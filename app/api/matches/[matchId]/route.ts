import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import Player from "@/models/Player";
import Round from "@/models/Round";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await context.params; // ✅ Next 16 async param

    if (!isValidObjectId(matchId)) {
      return NextResponse.json(
        { success: false, message: "Invalid match ID." },
        { status: 400 }
      );
    }

    const { winnerId } = await request.json();

    if (!winnerId || !isValidObjectId(winnerId)) {
      return NextResponse.json(
        { success: false, message: "Invalid winner ID." },
        { status: 422 }
      );
    }

    await connectDB();

    const match = await Match.findById(matchId);

    if (!match) {
      return NextResponse.json(
        { success: false, message: "Match not found." },
        { status: 404 }
      );
    }

    if (match.status === "completed") {
      return NextResponse.json(
        { success: false, message: "Match already completed." },
        { status: 409 }
      );
    }

    const p1 = match.player1Id.toString();
    const p2 = match.player2Id.toString();

    if (winnerId !== p1 && winnerId !== p2) {
      return NextResponse.json(
        { success: false, message: "Winner must belong to this match." },
        { status: 422 }
      );
    }

    const loserId = winnerId === p1 ? p2 : p1;

    // ✅ Mark match completed
    match.winnerId = winnerId;
    match.status = "completed";
    await match.save();

    // ✅ Update player statuses
    await Promise.all([
      Player.findByIdAndUpdate(winnerId, { status: "qualified" }),
      Player.findByIdAndUpdate(loserId, { status: "eliminated" }),
    ]);

    // ================================
    // 🔥 AUTO ROUND COMPLETION LOGIC
    // ================================

    const remainingPending = await Match.countDocuments({
      roundId: match.roundId,
      status: "pending",
    });

    if (remainingPending === 0) {
      // Close the round
      const round = await Round.findByIdAndUpdate(
        match.roundId,
        { status: "completed" },
        { new: true }
      ).lean() as { name: string } | null;

      // ================================
      // 🏆 CHAMPION DECLARATION
      // ================================
      if (round?.name === "Final") {
        await Player.findByIdAndUpdate(winnerId, {
          status: "champion",
        });
      }
    }

    return NextResponse.json(
      { success: true, message: "Winner marked successfully." },
      { status: 200 }
    );

  } catch (error) {
    console.error("[PATCH_MATCH_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Server error." },
      { status: 500 }
    );
  }
}