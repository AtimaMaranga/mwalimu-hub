import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { is_online } = await req.json();
    if (typeof is_online !== "boolean") {
      return NextResponse.json({ error: "is_online must be boolean" }, { status: 400 });
    }

    // Get the teacher record linked to this user
    const { data: profile } = await supabase
      .from("profiles")
      .select("teachers(id)")
      .eq("id", user.id)
      .single();

    const teacherId = (profile as any)?.teachers?.id;
    if (!teacherId) return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });

    const { error } = await supabase
      .from("teachers")
      .update({ is_online })
      .eq("id", teacherId);

    if (error) {
      console.error("PATCH online-status error:", error.message);
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }

    return NextResponse.json({ is_online });
  } catch (err) {
    console.error("PATCH online-status unexpected:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
