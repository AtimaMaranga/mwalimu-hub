import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendLessonReminder } from "@/lib/email";

/**
 * Cron job: Send lesson reminders 30min and 60min before confirmed bookings.
 *
 * Deploy with Vercel Cron (vercel.json) or call via external scheduler every 10 min.
 * Protected by CRON_SECRET to prevent unauthorized access.
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await createAdminClient();
  const now = new Date();

  // Find confirmed bookings happening in the next 30-65 minutes
  // We query a wider window to catch both 30min and 60min reminders
  const todayStr = now.toISOString().split("T")[0];

  const { data: bookings, error: fetchError } = await admin
    .from("bookings")
    .select("id, student_id, teacher_id, proposed_date, proposed_time, duration_minutes, status")
    .eq("status", "confirmed")
    .eq("proposed_date", todayStr);

  if (fetchError) {
    console.error("Reminder cron: fetch error", fetchError);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ sent: 0, message: "No bookings today" });
  }

  let sentCount = 0;
  const errors: string[] = [];

  for (const booking of bookings) {
    const sessionTime = new Date(`${booking.proposed_date}T${booking.proposed_time}`);
    const minutesUntil = Math.round((sessionTime.getTime() - now.getTime()) / 60000);

    // Send 60-min reminder (between 55-65 min before)
    // Send 30-min reminder (between 25-35 min before)
    const shouldSend60 = minutesUntil >= 55 && minutesUntil <= 65;
    const shouldSend30 = minutesUntil >= 25 && minutesUntil <= 35;

    if (!shouldSend60 && !shouldSend30) continue;

    const reminderMinutes = shouldSend60 ? 60 : 30;

    try {
      // Fetch student info
      const { data: studentUser } = await admin.auth.admin.getUserById(booking.student_id);
      const { data: studentProfile } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", booking.student_id)
        .single();

      // Fetch teacher info
      const { data: teacher } = await admin
        .from("teachers")
        .select("name, email")
        .eq("id", booking.teacher_id)
        .single();

      const studentEmail = studentUser?.user?.email;
      const studentName = studentProfile?.full_name || studentEmail?.split("@")[0] || "Student";
      const teacherName = teacher?.name || "Teacher";
      const teacherEmail = teacher?.email;

      // Send reminder to student
      if (studentEmail) {
        await sendLessonReminder({
          recipient_name: studentName,
          recipient_email: studentEmail,
          other_person_name: teacherName,
          role: "student",
          proposed_date: booking.proposed_date,
          proposed_time: booking.proposed_time,
          duration_minutes: booking.duration_minutes,
          minutes_until: reminderMinutes,
        });
        sentCount++;
      }

      // Send reminder to teacher
      if (teacherEmail) {
        await sendLessonReminder({
          recipient_name: teacherName,
          recipient_email: teacherEmail,
          other_person_name: studentName,
          role: "teacher",
          proposed_date: booking.proposed_date,
          proposed_time: booking.proposed_time,
          duration_minutes: booking.duration_minutes,
          minutes_until: reminderMinutes,
        });
        sentCount++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      errors.push(`Booking ${booking.id}: ${msg}`);
    }
  }

  return NextResponse.json({
    sent: sentCount,
    bookings_checked: bookings.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
