import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: lessonId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await createAdminClient();

  // Verify participant
  const { data: lesson } = await admin
    .from("lessons")
    .select("student_id, teacher_id")
    .eq("id", lessonId)
    .single();

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("teacher_id")
    .eq("id", user.id)
    .single();

  const isStudent = lesson.student_id === user.id;
  const isTeacher = profile?.teacher_id === lesson.teacher_id;

  if (!isStudent && !isTeacher) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: messages } = await admin
    .from("lesson_messages")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: true });

  return NextResponse.json({ messages: messages ?? [] });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: lessonId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { content?: string; file_url?: string; file_name?: string; file_type?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { content, file_url, file_name, file_type } = body;

  if (!content && !file_url) {
    return NextResponse.json({ error: "Message content or file required" }, { status: 400 });
  }

  const admin = await createAdminClient();

  // Verify participant
  const { data: lesson } = await admin
    .from("lessons")
    .select("student_id, teacher_id, status")
    .eq("id", lessonId)
    .single();

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("teacher_id")
    .eq("id", user.id)
    .single();

  const isStudent = lesson.student_id === user.id;
  const isTeacher = profile?.teacher_id === lesson.teacher_id;

  if (!isStudent && !isTeacher) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: message, error } = await admin
    .from("lesson_messages")
    .insert({
      lesson_id: lessonId,
      sender_id: user.id,
      content: content?.slice(0, 2000) || null,
      file_url: file_url || null,
      file_name: file_name || null,
      file_type: file_type || null,
    })
    .select()
    .single();

  if (error || !message) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  return NextResponse.json({ message }, { status: 201 });
}
