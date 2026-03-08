import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import {
  LayoutDashboard, User, MessageCircle, ExternalLink,
  ArrowRight, Clock, CheckCircle, DollarSign,
  TrendingUp, Pencil, ChevronRight, Users,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard",   href: "/dashboard/teacher",         icon: LayoutDashboard },
  { label: "My Profile",  href: "/dashboard/teacher/profile", icon: User },
  { label: "Inquiries",   href: "/dashboard/teacher",         icon: MessageCircle },
  { label: "Browse Site", href: "/teachers",                  icon: Users },
];

const levelColors: Record<string, { bg: string; text: string; dot: string }> = {
  beginner:     { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" },
  intermediate: { bg: "bg-cyan-500/15",    text: "text-cyan-400",    dot: "bg-cyan-400"    },
  advanced:     { bg: "bg-violet-500/15",  text: "text-violet-400",  dot: "bg-violet-400"  },
};

/* ── Stat card ── */
function StatCard({ label, value, icon: Icon, accent, sub }: {
  label: string; value: string | number; icon: any; accent: string; sub?: string;
}) {
  return (
    <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{label}</p>
        <div className={`h-8 w-8 rounded-lg ${accent} flex items-center justify-center`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

/* ── Bar chart ── */
function BarChart({ data, color = "from-cyan-600 to-cyan-400" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="flex items-end gap-2 h-24 mt-2">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t-md bg-gradient-to-t ${color} transition-all`}
            style={{ height: `${(v / max) * 100}%`, minHeight: 4 }}
          />
          <span className="text-slate-600 text-[9px]">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Circular progress ── */
function CircleProgress({ pct, label, sub, color }: {
  pct: number; label: string; sub: string; color: string;
}) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="relative shrink-0">
        <svg width="68" height="68" viewBox="0 0 68 68" className="-rotate-90">
          <circle cx="34" cy="34" r={r} fill="none" stroke="#ffffff0d" strokeWidth="7" />
          <circle
            cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">{pct}%</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold">{label}</p>
        <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

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
  const initials = getInitials(name);
  const totalInquiries = inquiries?.length ?? 0;

  // Placeholder weekly inquiry data
  const weeklyData = [0, 1, 0, 2, 1, 0, totalInquiries > 0 ? 1 : 0];

  // Profile completeness
  const completeness = teacher
    ? [
        !!teacher.name, !!teacher.tagline, !!teacher.bio,
        !!teacher.hourly_rate, teacher.specializations?.length > 0,
        !!teacher.availability_description,
      ].filter(Boolean).length
    : 0;
  const completenessPct = teacher ? Math.round((completeness / 6) * 100) : 0;

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      userName={name}
      userInitials={initials}
      userRole="Teacher"
    >
      <div className="space-y-6">

        {/* ── Profile setup banner (no profile yet) ── */}
        {!teacher && (
          <div className="relative bg-gradient-to-r from-cyan-600/20 to-blue-600/10 border border-cyan-500/20 rounded-2xl p-6 overflow-hidden">
            <div className="absolute right-6 top-0 bottom-0 flex items-center opacity-10">
              <User className="h-32 w-32 text-cyan-400" />
            </div>
            <div className="relative flex items-start sm:items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-1">Action Required</p>
                <h2 className="text-white text-lg font-bold mb-1">Complete your teacher profile</h2>
                <p className="text-slate-400 text-sm max-w-md">
                  Set up your profile so students can discover you. Our team reviews and publishes it within 24–48 hours.
                </p>
              </div>
              <Link href="/dashboard/teacher/profile" className="shrink-0">
                <Button variant="primary" size="sm">
                  Set up profile <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Inquiries"
            value={totalInquiries}
            icon={MessageCircle}
            accent="bg-cyan-600"
          />
          <StatCard
            label="Hourly Rate"
            value={teacher?.hourly_rate ? `$${teacher.hourly_rate}` : "—"}
            icon={DollarSign}
            accent="bg-blue-600"
          />
          <StatCard
            label="Profile Status"
            value={!teacher ? "Not set" : teacher.is_published ? "Live" : "In review"}
            icon={teacher?.is_published ? CheckCircle : Clock}
            accent={teacher?.is_published ? "bg-emerald-600" : "bg-amber-600"}
          />
          <StatCard
            label="Profile Complete"
            value={`${completenessPct}%`}
            icon={TrendingUp}
            accent="bg-violet-600"
          />
        </div>

        {/* ── Middle row ── */}
        <div className="grid lg:grid-cols-3 gap-4">

          {/* Weekly inquiry chart */}
          <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-white">Inquiry Activity</p>
              <span className="text-xs text-slate-500">This week</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Inquiries received per day</p>
            <BarChart data={weeklyData} color="from-blue-600 to-cyan-400" />
          </div>

          {/* Profile completeness */}
          <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-white">Profile Progress</p>
              <Link href="/dashboard/teacher/profile" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
                <Pencil className="h-3 w-3" /> Edit
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              <CircleProgress
                pct={teacher?.bio ? 100 : 0}
                label="Bio & tagline"
                sub={teacher?.bio ? "Complete" : "Missing"}
                color="#22d3ee"
              />
              <CircleProgress
                pct={teacher?.hourly_rate ? 100 : 0}
                label="Rate & availability"
                sub={teacher?.hourly_rate ? "Complete" : "Missing"}
                color="#818cf8"
              />
              <CircleProgress
                pct={teacher?.specializations?.length > 0 ? 100 : 0}
                label="Specialisations"
                sub={teacher?.specializations?.length > 0 ? "Complete" : "Missing"}
                color="#34d399"
              />
            </div>
          </div>

          {/* Profile card + actions */}
          <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl p-5">
            <p className="text-sm font-semibold text-white mb-4">My Profile</p>

            {teacher ? (
              <div className="space-y-4">
                {/* Profile preview */}
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                    {teacher.profile_image_url
                      ? <img src={teacher.profile_image_url} alt={name} className="h-full w-full object-cover" />
                      : initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{teacher.name}</p>
                    {teacher.tagline && <p className="text-slate-500 text-xs truncate">{teacher.tagline}</p>}
                  </div>
                </div>

                {/* Status badge */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                  teacher.is_published
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                }`}>
                  {teacher.is_published
                    ? <><CheckCircle className="h-3.5 w-3.5" /> Profile is live — students can find you</>
                    : <><Clock className="h-3.5 w-3.5" /> Under review — published within 24–48 hrs</>
                  }
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Link href="/dashboard/teacher/profile" className="flex-1">
                    <button className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-300 border border-white/10 rounded-lg hover:border-white/20 hover:text-white transition-all">
                      <Pencil className="h-3 w-3" /> Edit Profile
                    </button>
                  </Link>
                  {teacher.is_published && (
                    <Link href={`/teachers/${teacher.slug}`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-cyan-400 border border-cyan-500/30 rounded-lg hover:border-cyan-500/60 hover:bg-cyan-500/10 transition-all">
                        <ExternalLink className="h-3 w-3" /> View Live
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <p className="text-slate-400 text-sm mb-3">No profile yet</p>
                <Link href="/dashboard/teacher/profile">
                  <Button variant="primary" size="sm">Create Profile</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Inquiries ── */}
        <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <MessageCircle className="h-4 w-4 text-cyan-400" />
              <p className="text-sm font-semibold text-white">Student Inquiries</p>
              {totalInquiries > 0 && (
                <span className="bg-cyan-500/20 text-cyan-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalInquiries}
                </span>
              )}
            </div>
          </div>

          {!inquiries || totalInquiries === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
                <MessageCircle className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-white font-semibold mb-1">No inquiries yet</p>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                {teacher
                  ? "Student inquiries will appear here once they discover your profile."
                  : "Set up your profile first so students can contact you."}
              </p>
              {!teacher && (
                <Link href="/dashboard/teacher/profile" className="mt-5 inline-block">
                  <Button variant="primary" size="sm">Set up profile <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-2.5 border-b border-white/5">
                {[
                  { label: "Student",  span: "col-span-3" },
                  { label: "Level",    span: "col-span-2" },
                  { label: "Message",  span: "col-span-4" },
                  { label: "Date",     span: "col-span-2" },
                  { label: "",         span: "col-span-1" },
                ].map(({ label, span }) => (
                  <p key={label} className={`text-xs text-slate-500 font-semibold uppercase tracking-wider ${span}`}>
                    {label}
                  </p>
                ))}
              </div>

              {inquiries.map((inq: any, idx: number) => {
                const lvl = inq.experience_level ?? "beginner";
                const lc = levelColors[lvl] ?? levelColors.beginner;
                const studentInitial = (inq.student_name || inq.student_email || "S")[0].toUpperCase();

                return (
                  <div
                    key={inq.id}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/3 transition-colors ${idx !== 0 ? "border-t border-white/5" : ""}`}
                  >
                    {/* Student */}
                    <div className="col-span-3 flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {studentInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{inq.student_name || "Student"}</p>
                        <a href={`mailto:${inq.student_email}`} className="text-xs text-cyan-500 hover:text-cyan-400 truncate block">
                          {inq.student_email}
                        </a>
                      </div>
                    </div>

                    {/* Level */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${lc.bg} ${lc.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${lc.dot}`} />
                        <span className="capitalize">{lvl}</span>
                      </span>
                    </div>

                    {/* Message */}
                    <div className="col-span-4">
                      <p className="text-slate-400 text-sm line-clamp-1">{inq.message || "—"}</p>
                      {inq.preferred_times && (
                        <p className="text-slate-600 text-xs mt-0.5 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {inq.preferred_times}
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <div className="col-span-2 flex items-center gap-1 text-slate-500 text-xs">
                      <Clock className="h-3 w-3 shrink-0" />
                      {new Date(inq.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short",
                      })}
                    </div>

                    {/* Reply */}
                    <div className="col-span-1 flex justify-end">
                      <a
                        href={`mailto:${inq.student_email}?subject=Re: Your Swahili lesson inquiry`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 transition-colors"
                        title="Reply by email"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

      </div>
    </DashboardShell>
  );
}
