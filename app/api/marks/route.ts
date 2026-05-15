import { NextRequest, NextResponse } from "next/server";
import { findStudentMarks } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, studentId, passcode } = body as {
      email?: string;
      studentId?: string;
      passcode?: string;
    };

    if (!email || !studentId || !passcode) {
      return NextResponse.json(
        { error: "Email, Student ID, and Passcode are required." },
        { status: 400 }
      );
    }

    const MAX = 200;
    if (email.length > MAX || studentId.length > MAX || passcode.length > MAX) {
      return NextResponse.json(
        { error: "Input exceeds maximum allowed length." },
        { status: 400 }
      );
    }

    const result = await findStudentMarks(email, studentId, passcode);

    if (!result) {
      return NextResponse.json(
        { error: "No student record found. Please check your credentials." },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[API /api/marks] Error:", err);
    return NextResponse.json(
      { error: "An internal server error occurred. Please try again later." },
      { status: 500 }
    );
  }
}