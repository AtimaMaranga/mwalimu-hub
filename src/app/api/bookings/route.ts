import { NextResponse, type NextRequest, after } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendBookingCreatedToTeacher, sendBookingCreatedToStudent } from "@/lib/email";
import { createNotification, getTeacherUserId } from "@/lib/notifications";

export const dynamic = "force-dynamic";

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
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (isNaN(proposedDateObj.getTime()) || proposedDateObj < todayMidnight) {
    return NextResponse.json({ error: "Date must be today or in the future" }, { status: 400 });
  }

  // If booking for today, the time must not be in the past
  if (proposedDateObj.getTime() === todayMidnight.getTime() && proposed_time) {
    const [h, m] = proposed_time.split(":").map(Number);
    if (h < now.getHours() || (h === now.getHours() && (m ?? 0) < now.getMinutes())) {
      return NextResponse.json({ error: "Cannot book a time in the past" }, { status: 400 });
    }
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

  // Send email notifications after response (keeps function alive on Vercel)
  const emailData = {
    teacher_name: teacher.name,
    student_name: studentName,
    student_email: studentEmail,
    proposed_date,
    proposed_time,
    duration_minutes,
    message: message || null,
  };

  after(async () => {
    // Create in-app notification for teacher
    const teacherUserId = await getTeacherUserId(teacher_id);
    if (teacherUserId) {
      await createNotification({
        userId: teacherUserId,
        type: "booking_created",
        title: "New lesson request",
        body: `${studentName} wants to book a ${duration_minutes}-min lesson on ${proposed_date} at ${proposed_time}`,
        link: "/dashboard/teacher",
        metadata: { booking_id: booking.id, student_name: studentName },
      });
    }

    // Create in-app notification for student
    await createNotification({
      userId: user.id,
      type: "booking_created",
      title: "Booking request sent",
      body: `Your lesson request to ${teacher.name} for ${proposed_date} has been sent`,
      link: "/dashboard/student",
      metadata: { booking_id: booking.id, teacher_name: teacher.name },
    });

    // Send emails
    const results = await Promise.allSettled([
      teacher.email
        ? sendBookingCreatedToTeacher({ ...emailData, teacher_email: teacher.email })
        : Promise.resolve(),
      studentEmail
        ? sendBookingCreatedToStudent(emailData)
        : Promise.resolve(),
    ]);

    results.forEach((result, i) => {
      const label = i === 0 ? "teacher" : "student";
      if (result.status === "rejected") {
        console.error(`Booking email to ${label} failed:`, result.reason);
      } else if (result.status === "fulfilled" && result.value && typeof result.value === "object" && "error" in result.value && result.value.error) {
        console.error(`Booking email to ${label} API error:`, result.value.error);
      }
    });
  });

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

  let bookings;

  if (role === "teacher" && profile?.teacher_id) {
    // Teacher view: fetch bookings then resolve student names separately
    // (bookings.student_id -> auth.users, not profiles, so FK join doesn't work)
    let query = admin
      .from("bookings")
      .select("*")
      .eq("teacher_id", profile.teacher_id)
      .order("proposed_date", { ascending: true })
      .order("proposed_time", { ascending: true });

    if (status) query = query.eq("status", status);

    const { data: rawBookings, error: bookingsError } = await query;

    if (bookingsError) {
      console.error("Error fetching teacher bookings:", bookingsError);
    }

    // Batch-fetch student names from profiles
    const studentIds = [...new Set((rawBookings ?? []).map((b: { student_id: string }) => b.student_id))];
    let profileMap: Record<string, { full_name: string | null }> = {};

    if (studentIds.length > 0) {
      const { data: studentProfiles } = await admin
        .from("profiles")
        .select("id, full_name")
        .in("id", studentIds);

      profileMap = Object.fromEntries(
        (studentProfiles ?? []).map((p: { id: string; full_name: string | null }) => [
          p.id,
          { full_name: p.full_name },
        ])
      );
    }

    bookings = (rawBookings ?? []).map((b: { student_id: string; [key: string]: unknown }) => ({
      ...b,
      profiles: profileMap[b.student_id] ?? { full_name: null },
    }));
  } else {
    // Student view: teachers FK join works fine (bookings.teacher_id -> teachers.id)
    let query = admin
      .from("bookings")
      .select("*, teachers(name, slug, profile_image_url)")
      .eq("student_id", user.id)
      .order("proposed_date", { ascending: false })
      .order("proposed_time", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data, error: bookingsError } = await query;

    if (bookingsError) {
      console.error("Error fetching student bookings:", bookingsError);
    }

    bookings = data;
  }

  // Prevent caching so polling always gets fresh data
  return NextResponse.json(
    { bookings: bookings ?? [] },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
