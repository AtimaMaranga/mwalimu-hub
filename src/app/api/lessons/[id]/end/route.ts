import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await createAdminClient();

  // Fetch active lesson
  const { data: lesson } = await admin
    .from("lessons")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!lesson) {
    return NextResponse.json({ error: "Active lesson not found" }, { status: 404 });
  }

  // Verify the user is either the student or the linked teacher.
  // Students: direct ID match.
  // Teachers: must verify via profiles.teacher_id → lesson.teacher_id.
  let authorized = false;

  if (lesson.student_id === user.id) {
    authorized = true;
  } else {
    // Check if user is the teacher linked to this lesson
    const { data: profile } = await admin
      .from("profiles")
      .select("teacher_id")
      .eq("id", user.id)
      .single();

    if (profile?.teacher_id && profile.teacher_id === lesson.teacher_id) {
      authorized = true;
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // End the lesson
  const { error } = await admin
    .from("lessons")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to end lesson" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    duration_seconds: lesson.duration_seconds,
    total_charged: Number(lesson.total_charged),
  });
}
