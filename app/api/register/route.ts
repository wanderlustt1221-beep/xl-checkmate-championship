import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Player from "@/models/Player";

interface RegisterPayload {
  fullName: string;
  age: number | string;
  gender: string;
  dob: string;
  class: string;
  schoolName?: string;
  mobile: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterPayload = await request.json();

    // --- Server-side validation ---
    const errors: Record<string, string> = {};

    if (!body.fullName?.trim()) {
      errors.fullName = "Full name is required.";
    }

    const age = Number(body.age);
    if (!body.age && body.age !== 0) {
      errors.age = "Age is required.";
    } else if (isNaN(age) || age < 1) {
      errors.age = "Enter a valid age.";
    } else if (age >= 19) {
      errors.age = "Age must be less than 19 to participate.";
    }

    if (!body.gender) {
      errors.gender = "Gender is required.";
    }

    if (!body.dob) {
      errors.dob = "Date of birth is required.";
    }

    if (!body.class) {
      errors.class = "Class is required.";
    }

    if (!body.mobile?.trim()) {
      errors.mobile = "Mobile number is required.";
    } else if (!/^[6-9]\d{9}$/.test(body.mobile.trim())) {
      errors.mobile = "Enter a valid 10-digit Indian mobile number.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 422 }
      );
    }

    await connectDB();

    // Check for duplicate mobile
    const existing = await Player.findOne({ mobile: body.mobile.trim() });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          errors: {
            mobile: "This mobile number is already registered.",
          },
        },
        { status: 409 }
      );
    }

    const player = await Player.create({
      fullName: body.fullName.trim(),
      age,
      gender: body.gender,
      dob: new Date(body.dob),
      class: body.class,
      schoolName: body.schoolName?.trim() ?? "",
      mobile: body.mobile.trim(),
      status: "registered",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful!",
        playerId: player._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_API_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}