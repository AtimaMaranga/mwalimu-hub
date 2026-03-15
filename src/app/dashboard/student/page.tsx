import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import ConversationInbox from "@/components/chat/ConversationInbox";
import ScheduledSessions from "@/components/booking/ScheduledSessions";
import {
  ArrowRight, Clock, ChevronRight, Users, TrendingUp,
  MessageCircle, Search, GraduationCap, BookOpen, Star,
  Video, CalendarDays,
} from "@/components/ui/icons";
import WalletCard from "@/components/wallet/WalletCard";
import { getInitials } from "@/lib/utils";

const levelColors: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  beginner:     { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-100" },
  intermediate: { bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500",    border: "border-blue-100"    },
  advanced:     { bg: "bg-violet-50",   text: "text-violet-700",  dot: "bg-violet-500",  border: "border-violet-100"  },
};

function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor }: {
  label: string; value: string | number; sub?: string;
  icon: any; iconBg: string; iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function StepProgress({ pct, label, done }: { pct: number; label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
        done ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
      }`}>
        {done ? "✓" : ""}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className={`text-sm font-medium ${done ? "text-slate-900" : "text-slate-500"}`}>{label}</p>
          <span className={`text-xs font-semibold ${done ? "text-indigo-600" : "text-slate-400"}`}>{pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function BarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div
            className="w-full rounded-t-lg bg-indigo-500 transition-all"
            style={{ height: `${(v / max) * 100}%`, minHeight: 4, opacity: v === 0 ? 0.2 : 1 }}
          />
          <span className="text-slate-400 text-[9px] font-medium">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { welcome } = await searchParams;
  const isNewUser = welcome === "1";

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

  // Fetch bookings
  const admin = await createAdminClient();
  const { data: bookings } = await admin
    .from("bookings")
    .select("*, teachers!bookings_teacher_id_fkey(name, slug, profile_image_url)")
    .eq("student_id", user.id)
    .order("proposed_date", { ascending: false })
    .order("proposed_time", { ascending: false })
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
  const weeklyActivity = [1, 0, 2, 1, 3, 0, totalInquiries > 0 ? 2 : 0];

  return (
    <DashboardShell role="student" userName={name} userInitials={initials} userRole="Student">
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* ── Welcome banner ── */}
        {isNewUser && (
          <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 overflow-hidden shadow-lg shadow-indigo-200">
            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-8 opacity-20">
              <GraduationCap className="h-28 w-28 text-white" />
            </div>
            <div className="relative">
              <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Account confirmed</p>
              <h2 className="text-white text-xl font-bold mb-1">Welcome, {name.split(" ")[0]}!</h2>
              <p className="text-indigo-100 text-sm max-w-md mb-4">
                Your account is active. Browse native Swahili teachers and send your first free inquiry.
              </p>
              <Link href="/teachers">
                <button className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm">
                  Browse Teachers <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Inquiries Sent"     value={totalInquiries}    sub="Total messages sent"         icon={MessageCircle} iconBg="bg-indigo-50"  iconColor="text-indigo-600" />
          <StatCard label="Teachers Contacted" value={teachersContacted} sub="Unique teachers"              icon={Users}         iconBg="bg-violet-50"  iconColor="text-violet-600" />
          <StatCard label="Teachers Available" value={publishedTeachers} sub="Ready to teach"               icon={Search}        iconBg="bg-cyan-50"    iconColor="text-cyan-600" />
          <StatCard label="Learning Progress"  value="0%"                sub="Lessons completed"           icon={TrendingUp}    iconBg="bg-amber-50"   iconColor="text-amber-600" />
        </div>

        {/* ── Scheduled Sessions ── */}
        <ScheduledSessions bookings={bookings ?? []} role="student" />

        {/* ── Wallet ── */}
        <div className="grid lg:grid-cols-4 gap-4">
          <WalletCard />
          <div className="lg:col-span-3">
            {/* Recent lessons placeholder — will be populated as lessons are taken */}
          </div>
        </div>

        {/* ── Middle row ── */}
        <div className="grid lg:grid-cols-3 gap-4">

          {/* Activity chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-bold text-slate-900">Weekly Activity</p>
              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">This week</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Inquiries per day</p>
            <BarChart data={weeklyActivity} />
          </div>

          {/* Journey steps */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-slate-900">Learning Journey</p>
              <Link href="/teachers" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                Explore →
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              <StepProgress pct={teachersContacted > 0 ? 100 : 0} label="Find a teacher"      done={teachersContacted > 0} />
              <StepProgress pct={totalInquiries > 0 ? 100 : 0}    label="Send first inquiry"  done={totalInquiries > 0} />
              <StepProgress pct={0}                                label="Book first lesson"   done={false} />
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-sm font-bold text-slate-900 mb-4">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: "Browse all teachers",  sub: "Find your perfect match",  href: "/teachers",         iconBg: "bg-indigo-50",  iconColor: "text-indigo-600",  icon: Search },
                { label: "How lessons work",     sub: "Learn the booking process", href: "/how-it-works",     iconBg: "bg-violet-50",  iconColor: "text-violet-600",  icon: BookOpen },
                { label: "Become a teacher",     sub: "Earn teaching Swahili",     href: "/become-a-teacher", iconBg: "bg-amber-50",   iconColor: "text-amber-600",   icon: Star },
              ].map(({ label, sub, href, iconBg, iconColor, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
                >
                  <div className={`h-8 w-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-xs font-semibold">{label}</p>
                    <p className="text-slate-400 text-xs truncate">{sub}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Inquiries table ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">My Inquiries</p>
                <p className="text-xs text-slate-400">{totalInquiries} total sent</p>
              </div>
            </div>
            <Link href="/teachers" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
              Find teachers <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {!inquiries || totalInquiries === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 mb-4">
                <MessageCircle className="h-6 w-6 text-indigo-400" />
              </div>
              <p className="text-slate-900 font-semibold mb-1">No inquiries yet</p>
              <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
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
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100">
                {["Teacher", "Level", "Message", "Rate", "Date"].map((h, i) => (
                  <p key={h} className={`text-xs text-slate-400 font-semibold uppercase tracking-wider ${
                    i === 0 ? "col-span-3" : i === 2 ? "col-span-3" : "col-span-2"
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
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors ${idx !== 0 ? "border-t border-slate-50" : ""}`}
                  >
                    <div className="col-span-3 flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden shadow-sm">
                        {teacher?.profile_image_url
                          ? <img src={teacher.profile_image_url} alt={teacher.name} className="h-full w-full object-cover" />
                          : teacherInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-900 text-sm font-semibold truncate">{teacher?.name ?? "Teacher"}</p>
                        {teacher?.slug && (
                          <Link href={`/teachers/${teacher.slug}`} className="text-xs text-indigo-500 hover:text-indigo-600 truncate">
                            View profile
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${lc.bg} ${lc.text} ${lc.border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${lc.dot}`} />
                        <span className="capitalize">{lvl}</span>
                      </span>
                    </div>

                    <div className="col-span-3">
                      <p className="text-slate-500 text-sm line-clamp-1">{inq.message || "—"}</p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-indigo-600 text-sm font-semibold">
                        {teacher?.hourly_rate ? `$${teacher.hourly_rate}/hr` : "—"}
                      </p>
                    </div>

                    <div className="col-span-2 flex items-center gap-1 text-slate-400 text-xs">
                      <Clock className="h-3 w-3 shrink-0" />
                      {new Date(inq.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* ── Conversations ── */}
        <ConversationInbox currentUserId={user.id} userRole="student" />

      </div>
    </DashboardShell>
  );
}
