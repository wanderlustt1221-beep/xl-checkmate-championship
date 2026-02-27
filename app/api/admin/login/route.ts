// app/api/admin/login/route.ts

import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 2; // 2 hours in seconds
const SESSION_TOKEN = "xl_admin_authenticated"; // opaque value stored in cookie

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body ?? {};

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "Password is required." },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASS;

    if (!adminPassword) {
      console.error("[ADMIN_LOGIN] ADMIN_PASS env variable is not set.");
      return NextResponse.json(
        { success: false, message: "Server misconfiguration. Contact admin." },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { success: false, message: "Incorrect password." },
        { status: 401 }
      );
    }

    // Password correct — set HTTP-only session cookie
    const response = NextResponse.json(
      { success: true, message: "Authenticated." },
      { status: 200 }
    );

    response.cookies.set(COOKIE_NAME, SESSION_TOKEN, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 }
    );
  }
}