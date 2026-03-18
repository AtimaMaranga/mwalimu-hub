import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  MIN_HOURLY_RATE,
  MAX_HOURLY_RATE,
  RATE_CHANGE_MIN_HOURS,
  RATE_CHANGE_MIN_RATING,
} from "@/lib/pricing";

/**
 * GET /api/teacher/rate
 * Returns the teacher's current rate and eligibility to change it.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("teacher_id")
    .eq("id", user.id)
    .single();

  if (!profile?.teacher_id) {
    return NextResponse.json({ error: "Not a teacher" }, { status: 403 });
  }

  const { data: teacher } = await admin
    .from("teachers")
    .select("id, hourly_rate, total_hours_taught, rating")
    .eq("id", profile.teacher_id)
    .single();

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const totalHours = Number(teacher.total_hours_taught) || 0;
  const avgRating = Number(teacher.rating) || 0;
  const canChangeRate = totalHours >= RATE_CHANGE_MIN_HOURS && avgRating >= RATE_CHANGE_MIN_RATING;

  return NextResponse.json({
    hourly_rate: teacher.hourly_rate,
    total_hours_taught: totalHours,
    avg_rating: avgRating,
    can_change_rate: canChangeRate,
    min_rate: MIN_HOURLY_RATE,
    max_rate: MAX_HOURLY_RATE,
    requirements: {
      min_hours: RATE_CHANGE_MIN_HOURS,
      min_rating: RATE_CHANGE_MIN_RATING,
      hours_remaining: Math.max(0, RATE_CHANGE_MIN_HOURS - totalHours),
      rating_met: avgRating >= RATE_CHANGE_MIN_RATING,
    },
  });
}

/**
 * PUT /api/teacher/rate
 * Update the teacher's hourly rate (only if eligible).
 */
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { hourly_rate?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const newRate = body.hourly_rate;
  if (typeof newRate !== "number" || newRate < MIN_HOURLY_RATE || newRate > MAX_HOURLY_RATE) {
    return NextResponse.json(
      { error: `Hourly rate must be between $${MIN_HOURLY_RATE} and $${MAX_HOURLY_RATE}` },
      { status: 400 }
    );
  }

  const admin = await createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("teacher_id")
    .eq("id", user.id)
    .single();

  if (!profile?.teacher_id) {
    return NextResponse.json({ error: "Not a teacher" }, { status: 403 });
  }

  const { data: teacher } = await admin
    .from("teachers")
    .select("id, total_hours_taught, rating")
    .eq("id", profile.teacher_id)
    .single();

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const totalHours = Number(teacher.total_hours_taught) || 0;
  const avgRating = Number(teacher.rating) || 0;

  if (totalHours < RATE_CHANGE_MIN_HOURS || avgRating < RATE_CHANGE_MIN_RATING) {
    return NextResponse.json(
      {
        error: `You need at least ${RATE_CHANGE_MIN_HOURS} hours of sessions and an average rating of ${RATE_CHANGE_MIN_RATING} to change your rate.`,
      },
      { status: 403 }
    );
  }

  // Update the rate
  const { error } = await admin
    .from("teachers")
    .update({
      hourly_rate: newRate,
      rate_per_minute: Number((newRate / 60).toFixed(4)),
    })
    .eq("id", profile.teacher_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, hourly_rate: newRate });
}
