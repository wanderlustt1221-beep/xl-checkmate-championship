import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;

export async function GET() {
  try {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db("chessxl"); // your DB name
    const players = await db
      .collection("players")
      .find({}, { projection: { fullName: 1, mobile: 1, _id: 0 } })
      .toArray();

    await client.close();

    const messageLines = players
      .filter(p => p.mobile)
      .map(p => `${p.fullName} - ${p.mobile}`);

    const message =
      `🏆XL Checkmate Chess Championship Participants: \n\n` +
      messageLines.join("\n");

    const whatsappURL = `https://wa.me/917878583600?text=${encodeURIComponent(message)}`;

    return NextResponse.json({ success: true, url: whatsappURL });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to generate WhatsApp link" },
      { status: 500 }
    );
  }
}
