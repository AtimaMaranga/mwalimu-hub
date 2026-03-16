import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createDailyRoom } from "@/lib/daily";
import { createNotification, getTeacherUserId } from "@/lib/notifications";

const MIN_BALANCE = 0; // First minute is free (grace period)

export async function POST(
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

  // Fetch the booking
  const { data: booking } = await admin
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "confirmed") {
    return NextResponse.json({ error: "Booking is not confirmed" }, { status: 400 });
  }

  if (booking.lesson_id) {
    return NextResponse.json(
      { error: "Lesson already started", lesson_id: booking.lesson_id },
      { status: 409 }
    );
  }

  // Verify the user is either the student or the teacher
  const isStudent = booking.student_id === user.id;

  let isTeacher = false;
  if (!isStudent) {
    const { data: profile } = await admin
      .from("profiles")
      .select("teacher_id")
      .eq("id", user.id)
      .single();
    isTeacher = profile?.teacher_id === booking.teacher_id;
  }

  if (!isStudent && !isTeacher) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check proposed date is today (with 1 day grace window)
  const proposedDate = new Date(booking.proposed_date + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (proposedDate < yesterday || proposedDate > tomorrow) {
    return NextResponse.json(
      { error: "Lesson can only be started on the scheduled day (±1 day)" },
      { status: 400 }
    );
  }

  // Fetch teacher rate
  const { data: teacher } = await admin
    .from("teachers")
    .select("id, rate_per_minute, hourly_rate, is_published")
    .eq("id", booking.teacher_id)
    .single();

  if (!teacher || !teacher.is_published) {
    return NextResponse.json({ error: "Teacher not available" }, { status: 404 });
  }

  const ratePerMinute = teacher.rate_per_minute
    ?? (teacher.hourly_rate ? Number((teacher.hourly_rate / 60).toFixed(4)) : 0.20);

  // Check student wallet
  let { data: wallet } = await admin
    .from("wallets")
    .select("*")
    .eq("user_id", booking.student_id)
    .single();

  if (!wallet) {
    const { data: newWallet } = await admin
      .from("wallets")
      .insert({ user_id: booking.student_id, balance: 0, currency: "USD" })
      .select()
      .single();
    wallet = newWallet;
  }

  if (!wallet || Number(wallet.balance) < MIN_BALANCE) {
    const msg = isTeacher
      ? "The student does not have sufficient balance to start this lesson."
      : `Insufficient balance. Minimum $${MIN_BALANCE.toFixed(2)} required. Please top up your wallet.`;
    return NextResponse.json(
      { error: msg },
      { status: 402 }
    );
  }

  // Check for existing active lesson for the student
  const { data: existingLesson } = await admin
    .from("lessons")
    .select("id")
    .eq("student_id", booking.student_id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (existingLesson) {
    return NextResponse.json(
      { error: "Student already has an active lesson", lesson_id: existingLesson.id },
      { status: 409 }
    );
  }

  // Create lesson
  const { data: lesson, error: lessonError } = await admin
    .from("lessons")
    .insert({
      student_id: booking.student_id,
      teacher_id: booking.teacher_id,
      status: "active",
      rate_per_minute: ratePerMinute,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (lessonError || !lesson) {
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

  // Link lesson to booking and mark booking as completed
  await admin
    .from("bookings")
    .update({
      lesson_id: lesson.id,
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "confirmed");

  // Notify the other participant to join
  try {
    if (isStudent) {
      // Notify the teacher
      const teacherUserId = await getTeacherUserId(booking.teacher_id);
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
    } else {
      // Notify the student
      await createNotification({
        userId: booking.student_id,
        type: "lesson_started",
        title: "Your teacher is ready!",
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
