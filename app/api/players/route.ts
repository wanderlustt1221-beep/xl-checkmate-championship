import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Player from "@/models/Player";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const filter: Record<string, string> = {};
    if (status) {
      filter.status = status;
    }

    const players = await Player.find(filter)
      .sort({ createdAt: -1 })
      .select("fullName age gender class schoolName status createdAt")
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: players.length,
        players,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[GET_PLAYERS_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch players." },
      { status: 500 }
    );
  }
}