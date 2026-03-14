import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MIN_BALANCE = 0.50; // minimum wallet balance to start a lesson

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { teacher_id } = body;

  if (!teacher_id) {
    return NextResponse.json({ error: "teacher_id is required" }, { status: 400 });
  }

  // Fetch teacher
  const { data: teacher } = await supabase
    .from("teachers")
    .select("id, rate_per_minute, hourly_rate, is_online, name")
    .eq("id", teacher_id)
    .single();

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  // Determine per-minute rate — fall back to hourly_rate / 60
  const ratePerMinute = teacher.rate_per_minute
    ?? (teacher.hourly_rate ? Number((teacher.hourly_rate / 60).toFixed(4)) : 0.20);

  // Check wallet balance
  let { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!wallet) {
    // Auto-create wallet
    const { data: newWallet } = await supabase
      .from("wallets")
      .insert({ user_id: user.id, balance: 0, currency: "USD" })
      .select()
      .single();
    wallet = newWallet;
  }

  if (!wallet || Number(wallet.balance) < MIN_BALANCE) {
    return NextResponse.json(
      { error: `Insufficient balance. Minimum $${MIN_BALANCE.toFixed(2)} required.` },
      { status: 402 }
    );
  }

  // Check for existing active lesson
  const { data: existingLesson } = await supabase
    .from("lessons")
    .select("id")
    .eq("student_id", user.id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (existingLesson) {
    return NextResponse.json(
      { error: "You already have an active lesson", lesson_id: existingLesson.id },
      { status: 409 }
    );
  }

  // Create lesson
  const { data: lesson, error } = await supabase
    .from("lessons")
    .insert({
      student_id: user.id,
      teacher_id: teacher.id,
      status: "active",
      rate_per_minute: ratePerMinute,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !lesson) {
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }

  return NextResponse.json({ lesson });
}
