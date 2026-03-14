import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendBookingCreatedToTeacher, sendBookingCreatedToStudent } from "@/lib/email";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    teacher_id?: string;
    proposed_date?: string;
    proposed_time?: string;
    duration_minutes?: number;
    message?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { teacher_id, proposed_date, proposed_time, duration_minutes = 60, message } = body;

  if (!teacher_id || typeof teacher_id !== "string") {
    return NextResponse.json({ error: "teacher_id is required" }, { status: 400 });
  }
  if (!proposed_date || typeof proposed_date !== "string") {
    return NextResponse.json({ error: "proposed_date is required" }, { status: 400 });
  }
  if (!proposed_time || typeof proposed_time !== "string") {
    return NextResponse.json({ error: "proposed_time is required" }, { status: 400 });
  }
  if (![30, 60, 90].includes(duration_minutes)) {
    return NextResponse.json({ error: "duration_minutes must be 30, 60, or 90" }, { status: 400 });
  }

  // Date must be today or in the future
  const proposedDateObj = new Date(proposed_date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isNaN(proposedDateObj.getTime()) || proposedDateObj < today) {
    return NextResponse.json({ error: "Date must be today or in the future" }, { status: 400 });
  }

  const admin = await createAdminClient();

  // Teacher must exist and be published
  const { data: teacher } = await admin
    .from("teachers")
    .select("id, name, email, is_published")
    .eq("id", teacher_id)
    .single();

  if (!teacher || !teacher.is_published) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  // Get student profile for email notifications
  const { data: studentProfile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const studentName = studentProfile?.full_name || user.email?.split("@")[0] || "Student";
  const studentEmail = user.email || "";

  // Prevent duplicate pending bookings for same teacher/date/time
  const { data: existing } = await admin
    .from("bookings")
    .select("id")
    .eq("student_id", user.id)
    .eq("teacher_id", teacher_id)
    .eq("proposed_date", proposed_date)
    .eq("proposed_time", proposed_time)
    .in("status", ["pending", "confirmed"])
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "You already have a booking with this teacher at this date and time" },
      { status: 409 }
    );
  }

  const { data: booking, error } = await admin
    .from("bookings")
    .insert({
      student_id: user.id,
      teacher_id: teacher_id,
      proposed_date,
      proposed_time,
      duration_minutes,
      message: message?.slice(0, 1000) || null,
      status: "pending",
    })
    .select()
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }

  // Send email notifications (non-blocking)
  const emailData = {
    teacher_name: teacher.name,
    student_name: studentName,
    student_email: studentEmail,
    proposed_date,
    proposed_time,
    duration_minutes,
    message: message || null,
  };

  Promise.allSettled([
    teacher.email
      ? sendBookingCreatedToTeacher({ ...emailData, teacher_email: teacher.email })
      : Promise.resolve(),
    studentEmail
      ? sendBookingCreatedToStudent(emailData)
      : Promise.resolve(),
  ]).catch(() => {});

  return NextResponse.json({ booking }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await createAdminClient();
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const role = url.searchParams.get("role"); // "student" or "teacher"

  // Determine user's teacher_id if any
  const { data: profile } = await admin
    .from("profiles")
    .select("teacher_id")
    .eq("id", user.id)
    .single();

  if (role === "teacher" && profile?.teacher_id) {
    let query = admin
      .from("bookings")
      .select("*, profiles!bookings_student_id_fkey(full_name)")
      .eq("teacher_id", profile.teacher_id)
      .order("proposed_date", { ascending: true })
      .order("proposed_time", { ascending: true });

    if (status) query = query.eq("status", status);

    const { data: bookings } = await query;
    return NextResponse.json({ bookings: bookings ?? [] });
  }

  // Default: student view
  let query = admin
    .from("bookings")
    .select("*, teachers!bookings_teacher_id_fkey(name, slug, profile_image_url)")
    .eq("student_id", user.id)
    .order("proposed_date", { ascending: false })
    .order("proposed_time", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: bookings } = await query;
  return NextResponse.json({ bookings: bookings ?? [] });
}
