import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient, createPureAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = await createAdminClient();

    const { data: profile } = await adminClient
      .from("profiles")
      .select("role, teacher_id")
      .eq("id", user.id)
      .single();

    // Auto-heal: if teacher role but no teacher_id, try to link by email
    let teacherId = profile?.teacher_id ?? null;
    if (profile?.role === "teacher" && !teacherId) {
      teacherId = await linkTeacherProfile(user.id);
    }

    let query = adminClient
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false });

    if (profile?.role === "teacher" && teacherId) {
      query = query.eq("teacher_id", teacherId);
    } else {
      query = query.eq("student_id", user.id);
    }

    const { data: conversations, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (!conversations || conversations.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    // Enrich with teacher online status
    const teacherIds = [...new Set(conversations.map((c) => c.teacher_id))];
    const { data: teachers } = await adminClient
      .from("teachers")
      .select("id, is_online")
      .in("id", teacherIds);

    const teacherOnlineMap: Record<string, boolean> = {};
    for (const t of teachers ?? []) {
      teacherOnlineMap[t.id] = t.is_online ?? false;
    }

    // Enrich with student last_seen_at (for teacher's view)
    const studentIds = [...new Set(conversations.map((c) => c.student_id))];
    const { data: studentProfiles } = await adminClient
      .from("profiles")
      .select("id, last_seen_at")
      .in("id", studentIds);

    const studentLastSeenMap: Record<string, string | null> = {};
    for (const p of studentProfiles ?? []) {
      studentLastSeenMap[p.id] = p.last_seen_at ?? null;
    }

    const enriched = conversations.map((c) => ({
      ...c,
      teacher_is_online: teacherOnlineMap[c.teacher_id] ?? false,
      student_last_seen_at: studentLastSeenMap[c.student_id] ?? null,
    }));

    return NextResponse.json({ conversations: enriched });
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

    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const studentName = profile?.full_name || user.email?.split("@")[0] || "Student";

    const { data: teacher, error: teacherError } = await adminClient
      .from("teachers")
      .select("name")
      .eq("id", teacher_id)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Return existing conversation if present
    const { data: existing } = await adminClient
      .from("conversations")
      .select("*")
      .eq("student_id", user.id)
      .eq("teacher_id", teacher_id)
      .single();

    if (existing) return NextResponse.json({ conversation: existing });

    const { data: conversation, error: insertError } = await adminClient
      .from("conversations")
      .insert({
        student_id: user.id,
        teacher_id,
        student_name: studentName,
        student_email: user.email || "",
        teacher_name: teacher.name,
      })
      .select()
      .single();

    if (insertError) {
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

/** Auto-link a teacher's profile.teacher_id by matching their auth email to teachers.email */
async function linkTeacherProfile(userId: string): Promise<string | null> {
  try {
    const admin = createPureAdminClient();
    const { data: authData } = await admin.auth.admin.getUserById(userId);
    const email = authData?.user?.email?.toLowerCase();
    if (!email) return null;

    const { data: teacher } = await admin
      .from("teachers")
      .select("id")
      .ilike("email", email)
      .single();

    if (!teacher) return null;

    await admin
      .from("profiles")
      .update({ teacher_id: teacher.id, role: "teacher" })
      .eq("id", userId);

    return teacher.id;
  } catch {
    return null;
  }
}
