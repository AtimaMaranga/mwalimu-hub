import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function isParticipant(
  adminClient: Awaited<ReturnType<typeof createAdminClient>>,
  conversationId: string,
  userId: string
): Promise<{ allowed: boolean; role: "student" | "teacher" | null }> {
  const { data: conversation } = await adminClient
    .from("conversations")
    .select("student_id, teacher_id")
    .eq("id", conversationId)
    .single();

  if (!conversation) return { allowed: false, role: null };

  if (conversation.student_id === userId) {
    return { allowed: true, role: "student" };
  }

  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, teacher_id")
    .eq("id", userId)
    .single();

  if (
    profile?.role === "teacher" &&
    profile?.teacher_id === conversation.teacher_id
  ) {
    return { allowed: true, role: "teacher" };
  }

  return { allowed: false, role: null };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = await createAdminClient();

    const { allowed } = await isParticipant(adminClient, conversationId, user.id);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: messages, error } = await adminClient
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: messages ?? [] });
  } catch (err) {
    console.error("GET /api/messages error:", err);
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
    const { conversation_id, content } = body;

    if (!conversation_id || !content?.trim()) {
      return NextResponse.json(
        { error: "conversation_id and content are required" },
        { status: 400 }
      );
    }

    const adminClient = await createAdminClient();

    const { allowed, role } = await isParticipant(adminClient, conversation_id, user.id);
    if (!allowed || !role) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get sender name
    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const senderName = profile?.full_name || user.email?.split("@")[0] || "User";

    // Insert message
    const { data: message, error: msgError } = await adminClient
      .from("messages")
      .insert({
        conversation_id,
        sender_id: user.id,
        sender_role: role,
        sender_name: senderName,
        content: content.trim(),
      })
      .select()
      .single();

    if (msgError) {
      return NextResponse.json({ error: msgError.message }, { status: 500 });
    }

    // Determine which unread field to increment (recipient's)
    const incrementField =
      role === "student" ? "teacher_unread" : "student_unread";

    // Fetch current unread count and increment
    const { data: conv } = await adminClient
      .from("conversations")
      .select(incrementField)
      .eq("id", conversation_id)
      .single();

    const currentCount = (conv as Record<string, number> | null)?.[incrementField] ?? 0;

    await adminClient
      .from("conversations")
      .update({
        last_message: content.trim().substring(0, 200),
        last_message_at: new Date().toISOString(),
        [incrementField]: currentCount + 1,
      })
      .eq("id", conversation_id);

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error("POST /api/messages error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
