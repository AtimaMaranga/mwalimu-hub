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

  return NextResponse.json({ booking: updated });
}
