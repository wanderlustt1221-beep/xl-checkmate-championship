import mongoose, { Document, Schema } from "mongoose";

export interface IPlayer extends Document {
  fullName: string;
  age: number;
  gender: string;
  dob: Date;
  class: string;
  schoolName: string;
  mobile: string;
  status: string;
  createdAt: Date;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      max: [18, "Age must be less than 19"],
      min: [1, "Age must be valid"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female", "Other"],
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    class: {
      type: String,
      required: [true, "Class is required"],
      enum: [
        "Class 2",
        "Class 3",
        "Class 4",
        "Class 5",
        "Class 6",
        "Class 7",
        "Class 8",
        "Class 9",
        "Class 10",
        "Class 11",
        "Class 12",
        "12 Passout",
      ],
    },
    schoolName: {
      type: String,
      trim: true,
      default: "",
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"],
    },
    status: {
      type: String,
      default: "registered",
    },
  },
  {
    timestamps: true,
  }
);

const Player =
  mongoose.models.Player || mongoose.model<IPlayer>("Player", PlayerSchema);

export default Player;