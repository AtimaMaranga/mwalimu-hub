import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendBookingCancelledToTeacher } from "@/lib/email";

export async function PATCH(
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

  // Fetch booking and verify ownership
  const { data: booking, error: fetchError } = await admin
    .from("bookings")
    .select("id, student_id, teacher_id, status, proposed_date, proposed_time")
    .eq("id", id)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.student_id !== user.id) {
    return NextResponse.json({ error: "You can only cancel your own bookings" }, { status: 403 });
  }

  if (!["pending", "confirmed"].includes(booking.status)) {
    return NextResponse.json(
      { error: `This booking cannot be cancelled (status: ${booking.status})` },
      { status: 400 }
    );
  }

  // Perform the cancellation
  const { data: updated, error: updateError } = await admin
    .from("bookings")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("student_id", user.id)
    .in("status", ["pending", "confirmed"])
    .select()
    .maybeSingle();

  if (updateError) {
    console.error("Cancel booking error:", updateError);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }

  if (!updated) {
    return NextResponse.json(
      { error: "Booking could not be cancelled — it may have already been updated" },
      { status: 409 }
    );
  }

  // Send email notification to teacher (non-blocking)
  (async () => {
    try {
      const { data: teacher } = await admin
        .from("teachers")
        .select("name, email")
        .eq("id", booking.teacher_id)
        .single();

      const { data: studentProfile } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const studentName = studentProfile?.full_name || user.email?.split("@")[0] || "Student";

      if (teacher?.email) {
        await sendBookingCancelledToTeacher({
          teacher_name: teacher.name,
          teacher_email: teacher.email,
          student_name: studentName,
          proposed_date: booking.proposed_date,
          proposed_time: booking.proposed_time,
        });
      }
    } catch {}
  })();

  return NextResponse.json({ booking: updated });
}
