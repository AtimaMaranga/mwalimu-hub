import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import {
  MessageCircle, Search, LogOut, BookOpen,
  ArrowRight, Clock, ChevronRight, Sparkles,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role === "teacher") redirect("/dashboard/teacher");

  const { data: inquiries } = await supabase
    .from("student_inquiries")
    .select("*, teachers(name, slug, profile_image_url, specializations, hourly_rate)")
    .eq("student_email", user.email!)
    .order("created_at", { ascending: false })
    .limit(20);

  const name = profile?.full_name || user.email?.split("@")[0] || "Student";
  const firstName = name.split(" ")[0];
  const initials = getInitials(name);
  const totalInquiries = inquiries?.length ?? 0;
  const teachersContacted = new Set(inquiries?.map((i: any) => i.teacher_id)).size;

  const levelColors: Record<string, string> = {
    beginner:     "bg-emerald-50 text-emerald-700 border-emerald-200",
    intermediate: "bg-indigo-50 text-indigo-700 border-indigo-200",
    advanced:     "bg-violet-50 text-violet-700 border-violet-200",
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-slate-50">

        {/* ── Hero header ── */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-start justify-between gap-4">

              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-bold text-xl ring-2 ring-white/20">
                    {initials}
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-indigo-900">
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </span>
                </div>

                <div>
                  <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-1">
                    Student Dashboard
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold font-heading leading-tight">
                    Habari, {firstName}!
                  </h1>
                  <p className="text-indigo-300 text-sm mt-0.5">{user.email}</p>
                </div>
              </div>

              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-2 text-sm text-indigo-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </form>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
              {[
                { label: "Inquiries sent", value: totalInquiries, icon: MessageCircle },
                { label: "Teachers contacted", value: teachersContacted, icon: BookOpen },
                { label: "Journey started", value: "Today", icon: Sparkles },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3.5 flex items-center gap-3">
                  <Icon className="h-5 w-5 text-indigo-300 shrink-0" />
                  <div>
                    <p className="text-xl font-bold text-white leading-none">{value}</p>
                    <p className="text-indigo-300 text-xs mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

          {/* Quick actions */}
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Quick actions</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href="/teachers"
                className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors shrink-0">
                    <Search className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 mb-0.5">Find a Teacher</p>
                    <p className="text-sm text-slate-500 leading-relaxed">Browse native Swahili speakers and send a lesson inquiry</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all mt-0.5 shrink-0" />
                </div>
              </Link>

              <Link
                href="/how-it-works"
                className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-50 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center group-hover:bg-amber-100 transition-colors shrink-0">
                    <BookOpen className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 mb-0.5">How It Works</p>
                    <p className="text-sm text-slate-500 leading-relaxed">Learn how to book lessons and get started quickly</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all mt-0.5 shrink-0" />
                </div>
              </Link>
            </div>
          </section>

          {/* Inquiries */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Your Inquiries</h2>
                {totalInquiries > 0 && (
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalInquiries}
                  </span>
                )}
              </div>
              {totalInquiries > 0 && (
                <Link href="/teachers" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                  Find more <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              {!inquiries || totalInquiries === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 mb-4">
                    <MessageCircle className="h-7 w-7 text-indigo-400" />
                  </div>
                  <p className="font-semibold text-slate-700 mb-2">No inquiries yet</p>
                  <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto leading-relaxed">
                    Browse our qualified native teachers and send your first lesson inquiry — it&apos;s free.
                  </p>
                  <Link href="/teachers">
                    <Button variant="primary" size="sm">
                      Browse Teachers <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div>
                  {inquiries.map((inq: any, idx: number) => {
                    const teacher = inq.teachers as any;
                    const teacherInitials = getInitials(teacher?.name ?? "T");
                    const levelClass = levelColors[inq.experience_level] ?? "bg-slate-50 text-slate-600 border-slate-200";
                    return (
                      <div
                        key={inq.id}
                        className={`flex items-start gap-4 px-6 py-5 hover:bg-slate-50/60 transition-colors ${idx !== 0 ? "border-t border-slate-100" : ""}`}
                      >
                        {/* Teacher avatar */}
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {teacher?.profile_image_url ? (
                            <img src={teacher.profile_image_url} alt={teacher.name} className="h-full w-full object-cover rounded-xl" />
                          ) : teacherInitials}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-slate-900 text-sm">
                              {teacher?.name ?? "Teacher"}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${levelClass}`}>
                              {inq.experience_level || "beginner"}
                            </span>
                          </div>
                          {inq.message && (
                            <p className="text-sm text-slate-500 line-clamp-1 mb-1">{inq.message}</p>
                          )}
                          {teacher?.specializations?.length > 0 && (
                            <p className="text-xs text-slate-400">{teacher.specializations.slice(0, 2).join(" · ")}</p>
                          )}
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                          {teacher?.hourly_rate && (
                            <p className="text-sm font-semibold text-indigo-600">${teacher.hourly_rate}/hr</p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="h-3 w-3" />
                            {new Date(inq.created_at).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </div>
                          {teacher?.slug && (
                            <Link href={`/teachers/${teacher.slug}`} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-0.5">
                              View profile <ChevronRight className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </PageWrapper>
  );
}
