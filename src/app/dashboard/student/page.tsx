import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import {
  ArrowRight, Clock, ChevronRight, Users, TrendingUp, MessageCircle, Search,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

const levelColors: Record<string, { bg: string; text: string; dot: string }> = {
  beginner:     { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" },
  intermediate: { bg: "bg-cyan-500/15",    text: "text-cyan-400",    dot: "bg-cyan-400"    },
  advanced:     { bg: "bg-violet-500/15",  text: "text-violet-400",  dot: "bg-violet-400"  },
};

/* ── Small stat card ── */
function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number; icon: any; accent: string;
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
    </div>
  );
}

/* ── Circular progress SVG ── */
function CircleProgress({ pct, label, color }: { pct: number; label: string; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex items-center gap-4 py-3">
      <svg width="68" height="68" viewBox="0 0 68 68" className="shrink-0 -rotate-90">
        <circle cx="34" cy="34" r={r} fill="none" stroke="#ffffff0d" strokeWidth="7" />
        <circle
          cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{label}</p>
        <p className="text-slate-400 text-xs mt-0.5">Progress</p>
      </div>
      <p className="text-white font-bold text-lg shrink-0">{pct}%</p>
    </div>
  );
}

/* ── Mini bar chart (CSS) ── */
function BarChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="flex items-end gap-2 h-24 mt-2">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all"
            style={{ height: `${(v / max) * 100}%`, minHeight: 4 }}
          />
          <span className="text-slate-600 text-[9px]">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

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

  const { data: teacherCount } = await supabase
    .from("teachers")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true);

  const name = profile?.full_name || user.email?.split("@")[0] || "Student";
  const initials = getInitials(name);
  const totalInquiries = inquiries?.length ?? 0;
  const teachersContacted = new Set(inquiries?.map((i: any) => i.teacher_id)).size;
  const publishedTeachers = (teacherCount as any)?.count ?? 0;

  // Placeholder weekly activity data
  const weeklyActivity = [1, 0, 2, 1, 3, 0, totalInquiries > 0 ? 2 : 0];

  return (
    <DashboardShell
      role="student"
      userName={name}
      userInitials={initials}
      userRole="Student"
    >
      <div className="space-y-6">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Inquiries Sent"      value={totalInquiries}    icon={MessageCircle} accent="bg-cyan-600" />
          <StatCard label="Teachers Contacted"  value={teachersContacted} icon={Users}         accent="bg-blue-600" />
          <StatCard label="Teachers Available"  value={publishedTeachers} icon={Search}        accent="bg-violet-600" />
          <StatCard label="Lessons Progress"    value="0%"                icon={TrendingUp}    accent="bg-indigo-600" />
        </div>

        {/* ── Middle row ── */}
        <div className="grid lg:grid-cols-3 gap-4">

          {/* Weekly activity chart */}
          <div className="lg:col-span-1 bg-[#1a1b2e] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-white">Weekly Activity</p>
              <span className="text-xs text-slate-500">This week</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Inquiries per day</p>
            <BarChart data={weeklyActivity} />
          </div>

          {/* Learning goals / progress */}
          <div className="lg:col-span-1 bg-[#1a1b2e] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-white">Learning Goals</p>
              <Link href="/teachers" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                Explore
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              <CircleProgress pct={teachersContacted > 0 ? 40 : 0}  label="Find a teacher"   color="#22d3ee" />
              <CircleProgress pct={totalInquiries > 0 ? 100 : 0}    label="Send first inquiry" color="#818cf8" />
              <CircleProgress pct={0}                                label="Book first lesson" color="#34d399" />
            </div>
          </div>

          {/* Upcoming / quick actions */}
          <div className="lg:col-span-1 bg-[#1a1b2e] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-white">Quick Actions</p>
            </div>
            <div className="space-y-2">
              {[
                { label: "Browse all teachers",   sub: "Find your perfect match",    href: "/teachers",      color: "bg-cyan-500/15 text-cyan-400" },
                { label: "How lessons work",      sub: "Learn the booking process",   href: "/how-it-works",  color: "bg-blue-500/15 text-blue-400" },
                { label: "Become a teacher",      sub: "Earn teaching Swahili",       href: "/become-a-teacher", color: "bg-violet-500/15 text-violet-400" },
              ].map(({ label, sub, href, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/7 border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold">{label}</p>
                    <p className="text-slate-500 text-xs truncate">{sub}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Inquiries table ── */}
        <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <MessageCircle className="h-4 w-4 text-cyan-400" />
              <p className="text-sm font-semibold text-white">My Inquiries</p>
              {totalInquiries > 0 && (
                <span className="bg-cyan-500/20 text-cyan-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalInquiries}
                </span>
              )}
            </div>
            <Link href="/teachers" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
              Find teachers <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {!inquiries || totalInquiries === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
                <MessageCircle className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-white font-semibold mb-1">No inquiries yet</p>
              <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                Browse our native Swahili teachers and send your first free inquiry.
              </p>
              <Link href="/teachers">
                <Button variant="primary" size="sm">
                  Browse Teachers <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-2.5 border-b border-white/5">
                {["Teacher", "Level", "Message", "Rate", "Date"].map((h, i) => (
                  <p key={h} className={`text-xs text-slate-500 font-semibold uppercase tracking-wider ${
                    i === 0 ? "col-span-3" : i === 2 ? "col-span-3" : i === 1 ? "col-span-2" : "col-span-2"
                  }`}>{h}</p>
                ))}
              </div>

              {inquiries.map((inq: any, idx: number) => {
                const teacher = inq.teachers as any;
                const teacherInitials = getInitials(teacher?.name ?? "T");
                const lvl = inq.experience_level ?? "beginner";
                const lc = levelColors[lvl] ?? levelColors.beginner;

                return (
                  <div
                    key={inq.id}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/3 transition-colors ${idx !== 0 ? "border-t border-white/5" : ""}`}
                  >
                    {/* Teacher */}
                    <div className="col-span-3 flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                        {teacher?.profile_image_url
                          ? <img src={teacher.profile_image_url} alt={teacher.name} className="h-full w-full object-cover" />
                          : teacherInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{teacher?.name ?? "Teacher"}</p>
                        {teacher?.slug && (
                          <Link href={`/teachers/${teacher.slug}`} className="text-xs text-cyan-500 hover:text-cyan-400 truncate">
                            View profile
                          </Link>
                        )}
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
                    <div className="col-span-3">
                      <p className="text-slate-400 text-sm line-clamp-1">{inq.message || "—"}</p>
                    </div>

                    {/* Rate */}
                    <div className="col-span-2">
                      <p className="text-cyan-400 text-sm font-semibold">
                        {teacher?.hourly_rate ? `$${teacher.hourly_rate}/hr` : "—"}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="col-span-2 flex items-center gap-1 text-slate-500 text-xs">
                      <Clock className="h-3 w-3 shrink-0" />
                      {new Date(inq.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short",
                      })}
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
