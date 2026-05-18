import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTargetSheet, findStudentInSheet } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export const POST = auth(async function POST(req) {
  const session = req.auth;
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { studentId, course } = body as { studentId?: string; course?: string };

    if (!studentId || !course) {
      return NextResponse.json(
        { error: "Student ID and course are required." },
        { status: 400 }
      );
    }

    if (studentId.length > 50 || course.length > 200) {
      return NextResponse.json(
        { error: "Input exceeds maximum allowed length." },
        { status: 400 }
      );
    }

    // Step A: Resolve the target sheet ID + course info from the master index
    const master = await getTargetSheet(course);
    if (!master) {
      return NextResponse.json(
        { error: "Course not found. Please check your portal link." },
        { status: 404 }
      );
    }

    // Steps B + C: Double-match on email (from session) + student ID (from client)
    const result = await findStudentInSheet(
      master.sheetId,
      session.user.email,
      studentId,
      master.courseInfo
    );

    if (!result) {
      return NextResponse.json(
        { error: "Marks not found for this ID/Email combination." },
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
});
