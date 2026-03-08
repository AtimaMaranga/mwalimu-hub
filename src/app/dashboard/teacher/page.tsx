import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import {
  MessageCircle, User, CheckCircle, Clock, LogOut,
  ArrowRight, Pencil, ExternalLink, ChevronRight, TrendingUp, DollarSign,
} from "lucide-react";
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

  const { data: inquiries } = teacher
    ? await supabase
        .from("student_inquiries")
        .select("*")
        .eq("teacher_id", teacher.id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const name = profile?.full_name || user.email?.split("@")[0] || "Teacher";
  const firstName = name.split(" ")[0];
  const initials = getInitials(name);
  const totalInquiries = inquiries?.length ?? 0;

  const levelColors: Record<string, string> = {
    beginner:     "bg-emerald-50 text-emerald-700 border-emerald-200",
    intermediate: "bg-indigo-50 text-indigo-700 border-indigo-200",
    advanced:     "bg-violet-50 text-violet-700 border-violet-200",
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-slate-50">

        {/* ── Hero header ── */}
        <div className="bg-gradient-to-br from-violet-900 via-indigo-900 to-indigo-800 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-start justify-between gap-4">

              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-bold text-xl ring-2 ring-white/20 overflow-hidden">
                    {teacher?.profile_image_url ? (
                      <img src={teacher.profile_image_url} alt={name} className="h-full w-full object-cover" />
                    ) : initials}
                  </div>
                  <span className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-indigo-900 ${teacher?.is_published ? "bg-emerald-400" : "bg-amber-400"}`}>
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </span>
                </div>

                <div>
                  <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-1">
                    Teacher Dashboard
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
            {teacher && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
                {[
                  {
                    label: "Profile status",
                    value: teacher.is_published ? "Published" : "Under review",
                    icon: teacher.is_published ? CheckCircle : Clock,
                    color: teacher.is_published ? "text-emerald-300" : "text-amber-300",
                  },
                  {
                    label: "Total inquiries",
                    value: totalInquiries,
                    icon: MessageCircle,
                    color: "text-indigo-300",
                  },
                  {
                    label: "Hourly rate",
                    value: teacher.hourly_rate ? `$${teacher.hourly_rate}` : "Not set",
                    icon: DollarSign,
                    color: "text-indigo-300",
                  },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3.5 flex items-center gap-3">
                    <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                    <div>
                      <p className="text-xl font-bold text-white leading-none">{value}</p>
                      <p className="text-indigo-300 text-xs mt-0.5">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

          {/* Profile setup CTA — shown when no profile yet */}
          {!teacher && (
            <div className="relative bg-white border border-indigo-100 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-violet-50/40" />
              <div className="relative p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Complete your teacher profile</h2>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
                    Set up your public profile so students can find you. Once submitted, our team reviews and publishes it within 24–48 hours.
                  </p>
                  <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-400">
                    {["Add your bio & photo", "Set your hourly rate", "Choose your specialisations"].map((s) => (
                      <span key={s} className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />{s}
                      </span>
                    ))}
                  </div>
                </div>
                <Link href="/dashboard/teacher/profile" className="shrink-0">
                  <Button variant="primary" size="sm">
                    Set up profile <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Profile card — shown when profile exists */}
          {teacher && (
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Your Profile</h2>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="flex items-start gap-5 p-6">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
                    {teacher.profile_image_url ? (
                      <img src={teacher.profile_image_url} alt={teacher.name} className="h-full w-full object-cover" />
                    ) : initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-slate-900">{teacher.name}</p>
                      {teacher.is_published ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle className="h-3 w-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> Under review
                        </span>
                      )}
                    </div>
                    {teacher.tagline && (
                      <p className="text-sm text-slate-500 line-clamp-1">{teacher.tagline}</p>
                    )}
                    {teacher.specializations?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {teacher.specializations.slice(0, 4).map((s: string) => (
                          <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/dashboard/teacher/profile">
                      <button className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-700 font-medium px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                    </Link>
                    {teacher.is_published && (
                      <Link href={`/teachers/${teacher.slug}`}>
                        <button className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium px-3 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-all">
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Profile completeness */}
                {!teacher.is_published && (
                  <div className="border-t border-slate-100 bg-amber-50/50 px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-amber-800">Profile under review</p>
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                    </div>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Our team will review your profile and publish it within 24–48 hours. You&apos;ll receive an email when it goes live.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Inquiries */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Student Inquiries</h2>
                {totalInquiries > 0 && (
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalInquiries}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              {!inquiries || totalInquiries === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 mb-4">
                    <MessageCircle className="h-7 w-7 text-slate-300" />
                  </div>
                  <p className="font-semibold text-slate-700 mb-2">No inquiries yet</p>
                  <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                    {teacher
                      ? "Once students discover your profile, their inquiries will appear here."
                      : "Complete your profile first so students can find and contact you."}
                  </p>
                  {!teacher && (
                    <Link href="/dashboard/teacher/profile" className="mt-5 inline-block">
                      <Button variant="primary" size="sm">Set up profile <ArrowRight className="h-4 w-4" /></Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div>
                  {inquiries.map((inq: any, idx: number) => {
                    const levelClass = levelColors[inq.experience_level] ?? "bg-slate-50 text-slate-600 border-slate-200";
                    const studentInitial = (inq.student_name || inq.student_email || "S")[0].toUpperCase();
                    return (
                      <div
                        key={inq.id}
                        className={`flex items-start gap-4 px-6 py-5 hover:bg-slate-50/60 transition-colors ${idx !== 0 ? "border-t border-slate-100" : ""}`}
                      >
                        {/* Student initial avatar */}
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0 border border-indigo-100">
                          {studentInitial}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-slate-900 text-sm">
                              {inq.student_name || "Student"}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${levelClass}`}>
                              {inq.experience_level || "beginner"}
                            </span>
                          </div>
                          <a href={`mailto:${inq.student_email}`} className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline transition-colors">
                            {inq.student_email}
                          </a>
                          {inq.message && (
                            <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{inq.message}</p>
                          )}
                          {inq.preferred_times && (
                            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {inq.preferred_times}
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="h-3 w-3" />
                            {new Date(inq.created_at).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </div>
                          <a
                            href={`mailto:${inq.student_email}?subject=Re: Your Swahili lesson inquiry`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Reply <ChevronRight className="h-3 w-3" />
                          </a>
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
