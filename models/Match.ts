import mongoose, { Document, Schema, Types } from "mongoose";

export type MatchStatus = "pending" | "completed";

export interface IMatch extends Document {
  roundId: Types.ObjectId;
  player1Id: Types.ObjectId;
  player2Id: Types.ObjectId;
  winnerId: Types.ObjectId | null;
  matchNumber: number;
  status: MatchStatus;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    roundId: {
      type: Schema.Types.ObjectId,
      ref: "Round",
      required: [true, "Round ID is required"],
      index: true,
    },
    player1Id: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: [true, "Player 1 is required"],
    },
    player2Id: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      required: [true, "Player 2 is required"],
    },
    winnerId: {
      type: Schema.Types.ObjectId,
      ref: "Player",
      default: null,
    },
    matchNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "completed"],
        message: "Status must be pending or completed",
      },
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: a player pair should not be duplicated within the same round
MatchSchema.index({ roundId: 1, player1Id: 1, player2Id: 1 }, { unique: true });

const Match =
  mongoose.models.Match || mongoose.model<IMatch>("Match", MatchSchema);

export default Match;