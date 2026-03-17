import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { document_type: string; file_url: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validTypes = ["certificate", "education", "government_id", "intro_video"];
  if (!validTypes.includes(body.document_type)) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  }

  const admin = await createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("role, teacher_id")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "teacher" || !profile.teacher_id) {
    return NextResponse.json({ error: "Not a teacher" }, { status: 403 });
  }

  // Get current verification status
  const { data: teacher } = await admin
    .from("teachers")
    .select("verification_status")
    .eq("id", profile.teacher_id)
    .single();

  const status = (teacher?.verification_status as Record<string, string>) || {};
  status[body.document_type] = "pending";

  // For intro video, also store the URL
  const updates: Record<string, unknown> = { verification_status: status };
  if (body.document_type === "intro_video") {
    updates.video_intro_url = body.file_url;
  }

  const { error } = await admin
    .from("teachers")
    .update(updates)
    .eq("id", profile.teacher_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, status });
}
