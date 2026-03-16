import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createDailyRoom } from "@/lib/daily";
import { createNotification, getTeacherUserId } from "@/lib/notifications";

const MIN_BALANCE = 0; // First minute is free (grace period)

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { teacher_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { teacher_id } = body;

  if (!teacher_id || typeof teacher_id !== "string") {
    return NextResponse.json({ error: "teacher_id is required" }, { status: 400 });
  }

  const admin = await createAdminClient();

  // Fetch teacher — must exist, be published, and ideally be online
  const { data: teacher } = await admin
    .from("teachers")
    .select("id, rate_per_minute, hourly_rate, is_online, name, is_published")
    .eq("id", teacher_id)
    .single();

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  if (!teacher.is_published) {
    return NextResponse.json({ error: "Teacher is not available" }, { status: 404 });
  }

  // Determine per-minute rate — fall back to hourly_rate / 60
  const ratePerMinute = (teacher.rate_per_minute && teacher.rate_per_minute > 0)
    ? Number(teacher.rate_per_minute)
    : (teacher.hourly_rate ? Number((teacher.hourly_rate / 60).toFixed(4)) : 0.20);

  // Check if this is the student's first session with this teacher
  const { count: previousLessonCount } = await admin
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("student_id", user.id)
    .eq("teacher_id", teacher.id)
    .eq("status", "completed");

  const isFirstSession = (previousLessonCount ?? 0) === 0;

  // Check wallet balance (skip for first sessions — they get 10 free minutes)
  let { data: wallet } = await admin
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!wallet) {
    const { data: newWallet } = await admin
      .from("wallets")
      .insert({ user_id: user.id, balance: 0, currency: "USD" })
      .select()
      .single();
    wallet = newWallet;
  }

  if (!isFirstSession && (!wallet || Number(wallet.balance) < MIN_BALANCE)) {
    return NextResponse.json(
      { error: `Insufficient balance. Please top up your wallet.` },
      { status: 402 }
    );
  }

  // Check for existing active lesson
  const { data: existingLesson } = await admin
    .from("lessons")
    .select("id")
    .eq("student_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (existingLesson) {
    return NextResponse.json(
      { error: "You already have an active lesson", lesson_id: existingLesson.id },
      { status: 409 }
    );
  }

  // Create lesson
  const { data: lesson, error } = await admin
    .from("lessons")
    .insert({
      student_id: user.id,
      teacher_id: teacher.id,
      status: "active",
      rate_per_minute: ratePerMinute,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !lesson) {
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }

  // Create Daily.co video room
  try {
    const room = await createDailyRoom(lesson.id);
    await admin
      .from("lessons")
      .update({ daily_room_url: room.url, daily_room_name: room.name })
      .eq("id", lesson.id);
    lesson.daily_room_url = room.url;
    lesson.daily_room_name = room.name;
  } catch (err) {
    console.error("Daily room creation failed (lesson still created):", err);
  }

  // Notify the teacher that the student started a lesson
  try {
    const teacherUserId = await getTeacherUserId(teacher.id);
    if (teacherUserId) {
      await createNotification({
        userId: teacherUserId,
        type: "lesson_started",
        title: "Your student is ready!",
        body: "A lesson has started — join the classroom now.",
        link: `/classroom/${lesson.id}`,
        metadata: { lesson_id: lesson.id },
      });
    }
  } catch (err) {
    console.error("Failed to send lesson_started notification:", err);
  }

  return NextResponse.json({ lesson });
}
