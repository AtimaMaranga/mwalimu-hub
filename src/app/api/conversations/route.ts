import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = await createAdminClient();

    // Get profile to determine role
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role, teacher_id")
      .eq("id", user.id)
      .single();

    let query = adminClient
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false });

    if (profile?.role === "teacher" && profile?.teacher_id) {
      query = query.eq("teacher_id", profile.teacher_id);
    } else {
      query = query.eq("student_id", user.id);
    }

    const { data: conversations, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversations: conversations ?? [] });
  } catch (err) {
    console.error("GET /api/conversations error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { teacher_id } = body;

    if (!teacher_id) {
      return NextResponse.json({ error: "teacher_id is required" }, { status: 400 });
    }

    const adminClient = await createAdminClient();

    // Get student profile for name
    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const studentName = profile?.full_name || user.email?.split("@")[0] || "Student";
    const studentEmail = user.email || "";

    // Get teacher name
    const { data: teacher, error: teacherError } = await adminClient
      .from("teachers")
      .select("name")
      .eq("id", teacher_id)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Check if conversation already exists
    const { data: existing } = await adminClient
      .from("conversations")
      .select("*")
      .eq("student_id", user.id)
      .eq("teacher_id", teacher_id)
      .single();

    if (existing) {
      return NextResponse.json({ conversation: existing });
    }

    // Create new conversation
    const { data: conversation, error: insertError } = await adminClient
      .from("conversations")
      .insert({
        student_id: user.id,
        teacher_id,
        student_name: studentName,
        student_email: studentEmail,
        teacher_name: teacher.name,
      })
      .select()
      .single();

    if (insertError) {
      // If unique constraint violation, fetch existing
      if (insertError.code === "23505") {
        const { data: existingConv } = await adminClient
          .from("conversations")
          .select("*")
          .eq("student_id", user.id)
          .eq("teacher_id", teacher_id)
          .single();
        return NextResponse.json({ conversation: existingConv });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (err) {
    console.error("POST /api/conversations error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
