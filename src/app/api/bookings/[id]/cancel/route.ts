import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

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

  const { data: booking } = await admin
    .from("bookings")
    .select("id, student_id, status")
    .eq("id", id)
    .eq("student_id", user.id)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (!["pending", "confirmed"].includes(booking.status)) {
    return NextResponse.json({ error: "This booking cannot be cancelled" }, { status: 400 });
  }

  const { data: updated, error } = await admin
    .from("bookings")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["pending", "confirmed"])
    .select()
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }

  return NextResponse.json({ booking: updated });
}
