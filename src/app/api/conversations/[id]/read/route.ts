import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = await createAdminClient();

    // Get conversation to determine role
    const { data: conversation, error: convError } = await adminClient
      .from("conversations")
      .select("*")
      .eq("id", id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Get profile
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role, teacher_id")
      .eq("id", user.id)
      .single();

    // Determine which unread count to reset
    let updateField: Record<string, number> = {};

    if (conversation.student_id === user.id) {
      updateField = { student_unread: 0 };
    } else if (
      profile?.role === "teacher" &&
      profile?.teacher_id === conversation.teacher_id
    ) {
      updateField = { teacher_unread: 0 };
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error: updateError } = await adminClient
      .from("conversations")
      .update(updateField)
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/conversations/[id]/read error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
