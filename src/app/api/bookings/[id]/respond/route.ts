import { NextResponse, type NextRequest, after } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendBookingConfirmedToStudent, sendBookingDeclinedToStudent } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

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

  // Send notifications after response
  const teacherId = profile.teacher_id;
  after(async () => {
    try {
      const { data: studentUser } = await admin.auth.admin.getUserById(booking.student_id);
      const { data: studentProfile } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", booking.student_id)
        .single();
      const { data: teacher } = await admin
        .from("teachers")
        .select("name")
        .eq("id", teacherId)
        .single();

      const studentEmail = studentUser?.user?.email;
      const studentName = studentProfile?.full_name || studentEmail?.split("@")[0] || "Student";
      const teacherName = teacher?.name || "Your teacher";

      // In-app notification for student
      await createNotification({
        userId: booking.student_id,
        type: newStatus === "confirmed" ? "booking_confirmed" : "booking_declined",
        title: newStatus === "confirmed" ? "Lesson confirmed!" : "Booking declined",
        body: newStatus === "confirmed"
          ? `${teacherName} confirmed your lesson on ${booking.proposed_date} at ${booking.proposed_time}`
          : `${teacherName} was unable to accept your booking for ${booking.proposed_date}`,
        link: "/dashboard/student",
        metadata: { booking_id: id, teacher_name: teacherName },
      });

      // Send email
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
    } catch (err) {
      console.error("Respond booking email error:", err);
    }
  });

  return NextResponse.json({ booking: updated });
}
