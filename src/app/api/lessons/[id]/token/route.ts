import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createDailyToken, createDailyRoom } from "@/lib/daily";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await createAdminClient();

  const { data: lesson } = await admin
    .from("lessons")
    .select("id, student_id, teacher_id, status, daily_room_url, daily_room_name")
    .eq("id", id)
    .single();

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  if (lesson.status !== "active") {
    return NextResponse.json({ error: "Lesson is not active" }, { status: 400 });
  }

  // Auto-create room if it doesn't exist yet (self-healing fallback)
  if (!lesson.daily_room_name || !lesson.daily_room_url) {
    try {
      const room = await createDailyRoom(lesson.id);
      await admin
        .from("lessons")
        .update({ daily_room_url: room.url, daily_room_name: room.name })
        .eq("id", lesson.id);
      lesson.daily_room_url = room.url;
      lesson.daily_room_name = room.name;
    } catch (err) {
      console.error("Failed to create Daily room on token request:", err);
      return NextResponse.json(
        { error: "Video room could not be created. Check that DAILY_API_KEY is configured." },
        { status: 500 }
      );
    }
  }

  // Check if user is student or teacher
  const isStudent = lesson.student_id === user.id;

  let isTeacher = false;
  if (!isStudent) {
    const { data: profile } = await admin
      .from("profiles")
      .select("teacher_id")
      .eq("id", user.id)
      .single();

    isTeacher = profile?.teacher_id === lesson.teacher_id;
  }

  if (!isStudent && !isTeacher) {
    return NextResponse.json({ error: "You are not a participant in this lesson" }, { status: 403 });
  }

  // Get display name
  let displayName = "Participant";
  if (isStudent) {
    const { data: profile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    displayName = profile?.full_name || user.email?.split("@")[0] || "Student";
  } else {
    const { data: teacher } = await admin
      .from("teachers")
      .select("name")
      .eq("id", lesson.teacher_id)
      .single();
    displayName = teacher?.name || "Teacher";
  }

  try {
    const token = await createDailyToken(
      lesson.daily_room_name,
      user.id,
      displayName,
      isTeacher // teacher is room owner
    );

    return NextResponse.json({
      token,
      roomUrl: lesson.daily_room_url,
    });
  } catch (err) {
    console.error("Failed to create Daily token:", err);
    return NextResponse.json({ error: "Failed to create video token" }, { status: 500 });
  }
}
