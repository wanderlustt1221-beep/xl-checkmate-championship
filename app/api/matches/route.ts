import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Round from "@/models/Round";
import Player from "@/models/Player";

// ─── GET /api/matches?roundId=xxx ─────────────────────────────────────────────
// Returns all matches for a given round, with player names populated.

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roundId = searchParams.get("roundId");

    if (!roundId) {
      return NextResponse.json(
        { success: false, message: "roundId query parameter is required." },
        { status: 400 }
      );
    }

    if (!isValidObjectId(roundId)) {
      return NextResponse.json(
        { success: false, message: "Invalid roundId format." },
        { status: 400 }
      );
    }

    await connectDB();

    const matches = await Match.find({ roundId })
      .sort({ matchNumber: 1 })
      .populate("player1Id", "fullName class schoolName")
      .populate("player2Id", "fullName class schoolName")
      .populate("winnerId", "fullName")
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: matches.length,
        matches,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET_MATCHES_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch matches." },
      { status: 500 }
    );
  }
}

// ─── POST /api/matches ────────────────────────────────────────────────────────
// Creates a new match inside a round.
// Auto-generates matchNumber = existing matches in round + 1.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roundId, player1Id, player2Id } = body ?? {};

    // ── Field-level validation ────────────────────────────────────────────────
    const errors: Record<string, string> = {};

    if (!roundId) errors.roundId = "Round ID is required.";
    else if (!isValidObjectId(roundId)) errors.roundId = "Invalid Round ID.";

    if (!player1Id) errors.player1Id = "Player 1 is required.";
    else if (!isValidObjectId(player1Id)) errors.player1Id = "Invalid Player 1 ID.";

    if (!player2Id) errors.player2Id = "Player 2 is required.";
    else if (!isValidObjectId(player2Id)) errors.player2Id = "Invalid Player 2 ID.";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 422 });
    }

    // ── Same-player guard ─────────────────────────────────────────────────────
    if (player1Id === player2Id) {
      return NextResponse.json(
        {
          success: false,
          errors: { player2Id: "Player 1 and Player 2 cannot be the same person." },
        },
        { status: 422 }
      );
    }

    await connectDB();

    // ── Verify round exists ───────────────────────────────────────────────────
    const round = await Round.findById(roundId).lean();
    if (!round) {
      return NextResponse.json(
        { success: false, errors: { roundId: "Round not found." } },
        { status: 404 }
      );
    }

    // ── Verify both players exist ─────────────────────────────────────────────
    const [p1, p2] = await Promise.all([
      Player.findById(player1Id).lean(),
      Player.findById(player2Id).lean(),
    ]);

    if (!p1) {
      return NextResponse.json(
        { success: false, errors: { player1Id: "Player 1 not found." } },
        { status: 404 }
      );
    }
    if (!p2) {
      return NextResponse.json(
        { success: false, errors: { player2Id: "Player 2 not found." } },
        { status: 404 }
      );
    }

    // ── Check duplicate pairing in same round ─────────────────────────────────
    // Check both orderings: (p1 vs p2) and (p2 vs p1)
    const duplicate = await Match.findOne({
      roundId,
      $or: [
        { player1Id, player2Id },
        { player1Id: player2Id, player2Id: player1Id },
      ],
    }).lean();

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          errors: {
            player2Id: "This player pairing already exists in the selected round.",
          },
        },
        { status: 409 }
      );
    }

    // ── Auto-generate matchNumber ─────────────────────────────────────────────
    const existingCount = await Match.countDocuments({ roundId });
    const matchNumber = existingCount + 1;

    // ── Create match ─────────────────────────────────────────────────────────
    const match = await Match.create({
      roundId,
      player1Id,
      player2Id,
      winnerId: null,
      matchNumber,
      status: "pending",
    });

    // Return with populated player names for immediate UI use
    const populated = await Match.findById(match._id)
      .populate("player1Id", "fullName class schoolName")
      .populate("player2Id", "fullName class schoolName")
      .populate("roundId", "name status")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Match created successfully.",
        match: populated,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Compound unique index violation (race condition safety net)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          errors: {
            player2Id: "This player pairing already exists in the selected round.",
          },
        },
        { status: 409 }
      );
    }

    console.error("[POST_MATCHES_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Failed to create match." },
      { status: 500 }
    );
  }
}