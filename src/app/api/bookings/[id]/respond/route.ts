import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendBookingConfirmedToStudent, sendBookingDeclinedToStudent } from "@/lib/email";

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

  let body: { action?: string; teacher_note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, teacher_note } = body;

  if (!action || !["confirm", "decline"].includes(action)) {
    return NextResponse.json({ error: "action must be 'confirm' or 'decline'" }, { status: 400 });
  }

  const admin = await createAdminClient();

  // Verify teacher owns this booking
  const { data: profile } = await admin
    .from("profiles")
    .select("teacher_id")
    .eq("id", user.id)
    .single();

  if (!profile?.teacher_id) {
    return NextResponse.json({ error: "Not a teacher" }, { status: 403 });
  }

  const { data: booking } = await admin
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("teacher_id", profile.teacher_id)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "pending") {
    return NextResponse.json({ error: "Booking is no longer pending" }, { status: 400 });
  }

  const newStatus = action === "confirm" ? "confirmed" : "declined";

  const { data: updated, error } = await admin
    .from("bookings")
    .update({
      status: newStatus,
      teacher_note: teacher_note?.slice(0, 500) || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending") // optimistic lock
    .select()
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }

  // Send email notification to student (non-blocking)
  (async () => {
    try {
      // Get student email and name
      const { data: studentUser } = await admin.auth.admin.getUserById(booking.student_id);
      const { data: studentProfile } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", booking.student_id)
        .single();
      // Get teacher name
      const { data: teacher } = await admin
        .from("teachers")
        .select("name")
        .eq("id", profile.teacher_id)
        .single();

      const studentEmail = studentUser?.user?.email;
      const studentName = studentProfile?.full_name || studentEmail?.split("@")[0] || "Student";
      const teacherName = teacher?.name || "Your teacher";

      if (studentEmail) {
        if (newStatus === "confirmed") {
          await sendBookingConfirmedToStudent({
            student_name: studentName,
            student_email: studentEmail,
            teacher_name: teacherName,
            proposed_date: booking.proposed_date,
            proposed_time: booking.proposed_time,
            duration_minutes: booking.duration_minutes,
            teacher_note: teacher_note || null,
          });
        } else {
          await sendBookingDeclinedToStudent({
            student_name: studentName,
            student_email: studentEmail,
            teacher_name: teacherName,
            proposed_date: booking.proposed_date,
            proposed_time: booking.proposed_time,
            teacher_note: teacher_note || null,
          });
        }
      }
    } catch {}
  })();

  return NextResponse.json({ booking: updated });
}
