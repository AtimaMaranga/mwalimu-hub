import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import { MessageCircle, User, CheckCircle, Clock, LogOut, ArrowRight } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default async function TeacherDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, teachers(*)")
    .eq("id", user.id)
    .single();

  if (profile?.role === "student") redirect("/dashboard/student");

  const teacher = (profile as any)?.teachers ?? null;

  // Fetch inquiries for this teacher
  const { data: inquiries } = teacher
    ? await supabase
        .from("student_inquiries")
        .select("*")
        .eq("teacher_id", teacher.id)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] };

  const name = profile?.full_name || user.email?.split("@")[0] || "Teacher";
  const initials = getInitials(name);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="flex items-start justify-between mb-10 gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {teacher?.profile_image_url ? (
                  <img
                    src={teacher.profile_image_url}
                    alt={name}
                    className="h-full w-full object-cover rounded-2xl"
                  />
                ) : (
                  initials
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-0.5">
                  Teacher Dashboard
                </p>
                <h1 className="text-2xl font-bold font-heading text-slate-900">
                  Habari, {name.split(" ")[0]}!
                </h1>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
            </div>
            <form action="/api/auth/logout" method="POST">
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>

          {/* Profile status */}
          {!teacher ? (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-indigo-900 mb-1">Complete your teacher profile</h2>
                  <p className="text-sm text-indigo-700 mb-4">
                    Set up your profile so students can find and book lessons with you.
                    Once submitted, our team will review and publish your profile within 24–48 hours.
                  </p>
                  <Link href="/dashboard/teacher/profile">
                    <Button variant="primary" size="sm">
                      Set up profile <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-2">Status</p>
                {teacher.is_published ? (
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Published</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Clock className="h-5 w-5" />
                    <span className="font-semibold">Under review</span>
                  </div>
                )}
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-2">Total Inquiries</p>
                <p className="text-3xl font-bold text-indigo-600">{inquiries?.length ?? 0}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-2">Hourly Rate</p>
                <p className="text-3xl font-bold text-indigo-600">
                  ${teacher.hourly_rate ?? "—"}
                </p>
              </div>
            </div>
          )}

          {/* Edit profile link */}
          {teacher && (
            <div className="flex gap-3 mb-8">
              <Link href="/dashboard/teacher/profile">
                <Button variant="outline" size="sm">Edit Profile</Button>
              </Link>
              {teacher.is_published && (
                <Link href={`/teachers/${teacher.slug}`}>
                  <Button variant="ghost" size="sm">View Public Profile →</Button>
                </Link>
              )}
            </div>
          )}

          {/* Inquiries */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <MessageCircle className="h-5 w-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Student Inquiries</h2>
              {inquiries && inquiries.length > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {inquiries.length}
                </span>
              )}
            </div>

            {!inquiries || inquiries.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mb-3">
                  <MessageCircle className="h-6 w-6 text-slate-400" />
                </div>
                <p className="font-medium text-slate-600 mb-1">No inquiries yet</p>
                <p className="text-sm text-slate-400">
                  {teacher
                    ? "Inquiries from students will appear here."
                    : "Complete your profile to start receiving inquiries."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {inquiries.map((inq: any) => (
                  <div key={inq.id} className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-900 text-sm">{inq.student_name}</p>
                          <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full capitalize">
                            {inq.experience_level || "beginner"}
                          </span>
                        </div>
                        <a
                          href={`mailto:${inq.student_email}`}
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          {inq.student_email}
                        </a>
                        {inq.message && (
                          <p className="text-sm text-slate-500 mt-2 line-clamp-2">{inq.message}</p>
                        )}
                        {inq.preferred_times && (
                          <p className="text-xs text-slate-400 mt-1">
                            Preferred times: {inq.preferred_times}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 shrink-0">
                        {new Date(inq.created_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}
