import mongoose, { Document, Schema } from "mongoose";

export type RoundStatus = "upcoming" | "ongoing" | "completed";

export interface IRound extends Document {
  name: string;
  status: RoundStatus;
  createdAt: Date;
  updatedAt: Date;
}

const RoundSchema = new Schema<IRound>(
  {
    name: {
      type: String,
      required: [true, "Round name is required"],
      trim: true,
      unique: true,
    },
    status: {
      type: String,
      enum: {
        values: ["upcoming", "ongoing", "completed"],
        message: "Status must be upcoming, ongoing, or completed",
      },
      default: "ongoing",
    },
  },
  {
    timestamps: true,
  }
);

const Round =
  mongoose.models.Round || mongoose.model<IRound>("Round", RoundSchema);

export default Round;