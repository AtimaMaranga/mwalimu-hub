import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const admin = await createAdminClient();

  // Verify teacher role
  const { data: profile } = await admin
    .from("profiles")
    .select("role, teacher_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "teacher" || !profile.teacher_id) {
    return NextResponse.json({ error: "Not a teacher" }, { status: 403 });
  }

  // Update payout settings and related fields on teachers table
  const updates: Record<string, unknown> = {
    payout_settings: body,
    payout_method: body.method,
  };

  if (body.method === "mpesa") {
    updates.payout_phone = body.phone;
  } else if (body.method === "bank") {
    updates.bank_name = body.bank_name;
    updates.bank_account_name = body.account_name;
    updates.bank_account_number = body.account_number;
  }

  const { error } = await admin
    .from("teachers")
    .update(updates)
    .eq("id", profile.teacher_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
