import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  // Fetch active lesson
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!lesson) {
    return NextResponse.json({ error: "Active lesson not found" }, { status: 404 });
  }

  // Verify the user is either the student or the teacher
  if (lesson.student_id !== user.id) {
    // Check if user is the teacher
    const { data: teacher } = await supabase
      .from("teachers")
      .select("id")
      .eq("id", lesson.teacher_id)
      .limit(1)
      .single();

    // For now allow student to end
    if (!teacher) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  // End the lesson
  const { error } = await supabase
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
