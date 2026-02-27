import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Round from "@/models/Round";

// ─── GET /api/rounds ──────────────────────────────────────────────────────────
// Returns all rounds sorted by createdAt ascending (oldest → newest)

export async function GET() {
  try {
    await connectDB();

    const rounds = await Round.find({})
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: rounds.length,
        rounds,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET_ROUNDS_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch rounds." },
      { status: 500 }
    );
  }
}

// ─── POST /api/rounds ─────────────────────────────────────────────────────────
// Creates a new round. Prevents duplicate names. Default status = "ongoing".

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name: string = body?.name?.trim() ?? "";

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!name) {
      return NextResponse.json(
        { success: false, errors: { name: "Round name is required." } },
        { status: 422 }
      );
    }

    await connectDB();

    // ── Duplicate check (case-insensitive) ────────────────────────────────────
    const existing = await Round.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          errors: { name: `A round named "${existing.name}" already exists.` },
        },
        { status: 409 }
      );
    }

    // ── Create ────────────────────────────────────────────────────────────────
    const round = await Round.create({ name, status: "ongoing" });

    return NextResponse.json(
      {
        success: true,
        message: "Round created successfully.",
        round,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Mongoose duplicate key error (race condition safety net)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          errors: { name: "A round with this name already exists." },
        },
        { status: 409 }
      );
    }

    console.error("[POST_ROUNDS_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Failed to create round." },
      { status: 500 }
    );
  }
}