// app/api/admin/logout/route.ts

import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_session";

export async function POST(_request: NextRequest) {
  const response = NextResponse.json(
    { success: true, message: "Logged out." },
    { status: 200 }
  );

  // Clear the session cookie by setting maxAge to 0
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });

  return response;
}