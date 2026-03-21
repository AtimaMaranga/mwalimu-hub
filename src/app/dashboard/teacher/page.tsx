import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import ConversationInbox from "@/components/chat/ConversationInbox";
import OnlineToggle from "@/components/dashboard/OnlineToggle";
import Button from "@/components/ui/Button";
import ScheduledSessions from "@/components/booking/ScheduledSessions";
import {
  User, MessageCircle, ExternalLink,
  ArrowRight, Clock, CheckCircle, DollarSign,
  TrendingUp, Pencil, ChevronRight, GraduationCap, CalendarDays,
} from "@/components/ui/icons";
import TeacherEarnings from "@/components/wallet/TeacherEarnings";
import { getInitials } from "@/lib/utils";

const levelColors: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  beginner:     { bg: "bg-emerald-50 dark:bg-emerald-950",  text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500", border: "border-emerald-100 dark:border-emerald-800" },
  intermediate: { bg: "bg-blue-50 dark:bg-blue-950",     text: "text-blue-700 dark:text-blue-300",    dot: "bg-blue-500",    border: "border-blue-100 dark:border-blue-800"    },
  advanced:     { bg: "bg-violet-50 dark:bg-violet-950",   text: "text-violet-700 dark:text-violet-300",  dot: "bg-violet-500",  border: "border-violet-100 dark:border-violet-800"  },
};

function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor }: {
  label: string; value: string | number; sub?: string;
  icon: any; iconBg: string; iconColor: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
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
          <span className="text-slate-400 dark:text-slate-500 text-[9px] font-medium">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function ProfileItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
        done ? "bg-indigo-600" : "bg-slate-100 dark:bg-slate-700"
      }`}>
        {done && <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </div>
      <p className={`text-sm ${done ? "text-slate-700 dark:text-slate-200 font-medium" : "text-slate-400 dark:text-slate-500"}`}>{label}</p>
      {done && <span className="ml-auto text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Done</span>}
      {!done && <span className="ml-auto text-xs text-slate-300 dark:text-slate-600 font-medium">Missing</span>}
    </div>
  );
}

export default async function TeacherDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { welcome } = await searchParams;
  const isNewUser = welcome === "1";

  const admin = await createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("*, teachers(*)")
    .eq("id", user.id)
    .single();

  if (profile?.role === "student") redirect("/dashboard/student");

  const teacher = (profile as any)?.teachers ?? null;

  // Fetch inquiries for display (limited)
  const { data: inquiries } = teacher
    ? await admin
        .from("student_inquiries")
        .select("*")
        .eq("teacher_id", teacher.id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  // Get exact inquiry count
  let totalInquiries = 0;
  if (teacher) {
    const { count } = await admin
      .from("student_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("teacher_id", teacher.id);
    totalInquiries = count ?? 0;
  }

  // Fetch bookings for this teacher
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bookings: any[] = [];

  if (teacher) {
    const { data: rawBookings } = await admin
      .from("bookings")
      .select("*")
      .eq("teacher_id", teacher.id)
      .order("proposed_date", { ascending: true })
      .order("proposed_time", { ascending: true })
      .limit(30);

    if (rawBookings && rawBookings.length > 0) {
      const studentIds = [...new Set(rawBookings.map((b: { student_id: string }) => b.student_id))];
      const { data: studentProfiles } = await admin
        .from("profiles")
        .select("id, full_name")
        .in("id", studentIds);

      const profileMap: Record<string, { full_name: string | null }> = Object.fromEntries(
        (studentProfiles ?? []).map((p: { id: string; full_name: string | null }) => [
          p.id,
          { full_name: p.full_name },
        ])
      );

      bookings = rawBookings.map((b: { student_id: string; [key: string]: unknown }) => ({
        ...b,
        profiles: profileMap[b.student_id] ?? { full_name: null },
      }));
    }
  }

  // Check for active lesson
  let activeLesson: { id: string; student_id: string } | null = null;
  if (teacher) {
    const { data: activeLessonData } = await admin
      .from("lessons")
      .select("id, student_id")
      .eq("teacher_id", teacher.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    activeLesson = activeLessonData;
  }

  // Resolve active lesson student name
  let activeLessonStudentName = "Student";
  if (activeLesson) {
    const { data: sProfile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", activeLesson.student_id)
      .single();
    activeLessonStudentName = sProfile?.full_name ?? "Student";
  }

  // Weekly inquiry activity (real data)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  let weeklyData = [0, 0, 0, 0, 0, 0, 0];
  if (teacher) {
    const { data: weekInquiries } = await admin
      .from("student_inquiries")
      .select("created_at")
      .eq("teacher_id", teacher.id)
      .gte("created_at", monday.toISOString());

    for (const inq of weekInquiries ?? []) {
      const d = new Date(inq.created_at);
      const idx = (d.getDay() + 6) % 7;
      weeklyData[idx]++;
    }
  }

  const name = profile?.full_name || user.email?.split("@")[0] || "Teacher";
  const initials = getInitials(name);

  const completenessItems = teacher ? [
    { label: "Name & tagline",      done: !!teacher.tagline },
    { label: "Bio written",         done: !!teacher.bio },
    { label: "Hourly rate set",     done: true },
    { label: "Specialisations",     done: teacher.specializations?.length > 0 },
    { label: "Availability added",  done: !!teacher.availability_description },
    { label: "Profile photo",       done: !!teacher.profile_image_url },
  ] : [];
  const completedItems = completenessItems.filter(i => i.done).length;
  const completenessPct = teacher ? Math.round((completedItems / 6) * 100) : 0;

  return (
    <DashboardShell role="teacher" userName={name} userInitials={initials} userRole="Teacher">
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* ── Welcome banner ── */}
        {isNewUser && (
          <div className="relative bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 overflow-hidden shadow-lg shadow-violet-200">
            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-8 opacity-20">
              <GraduationCap className="h-28 w-28 text-white" />
            </div>
            <div className="relative">
              <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest mb-1">Account confirmed</p>
              <h2 className="text-white text-xl font-bold mb-1">Welcome, {name.split(" ")[0]}!</h2>
              <p className="text-violet-100 text-sm max-w-md mb-4">
                Your teacher account is active. Set up your profile so students can discover you.
              </p>
              <Link href="/dashboard/teacher/profile">
                <button className="inline-flex items-center gap-2 bg-white text-violet-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-violet-50 transition-colors shadow-sm">
                  Set up profile <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ── No profile banner ── */}
        {!teacher && !isNewUser && (
          <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 overflow-hidden shadow-lg shadow-indigo-200">
            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-8 opacity-20">
              <User className="h-28 w-28 text-white" />
            </div>
            <div className="relative flex items-start sm:items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Action Required</p>
                <h2 className="text-white text-lg font-bold mb-1">Complete your teacher profile</h2>
                <p className="text-indigo-100 text-sm max-w-md">
                  Set up your profile so students can discover you. Reviewed and published within 24–48 hours.
                </p>
              </div>
              <Link href="/dashboard/teacher/profile" className="shrink-0">
                <button className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm">
                  Set up profile <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ── Active lesson banner ── */}
        {activeLesson && (
          <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 overflow-hidden shadow-lg shadow-emerald-200">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-emerald-100 text-xs font-semibold uppercase tracking-widest">Live Now</p>
                  <p className="text-white font-bold">Active lesson with {activeLessonStudentName}</p>
                </div>
              </div>
              <Link href={`/classroom/${activeLesson.id}`}>
                <button className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm">
                  Join Classroom <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Inquiries"   value={totalInquiries}
            sub="From students"       icon={MessageCircle}
            iconBg="bg-indigo-50 dark:bg-indigo-950"     iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <StatCard
            label="Hourly Rate"       value={teacher?.hourly_rate ? `$${teacher.hourly_rate}` : "—"}
            sub="Per lesson"          icon={DollarSign}
            iconBg="bg-emerald-50 dark:bg-emerald-950"    iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label="Profile Status"    value={!teacher ? "Not set" : teacher.is_published ? "Live" : "In review"}
            sub={teacher?.is_published ? "Students can find you" : "Under review"}
            icon={teacher?.is_published ? CheckCircle : Clock}
            iconBg={teacher?.is_published ? "bg-emerald-50 dark:bg-emerald-950" : "bg-amber-50 dark:bg-amber-950"}
            iconColor={teacher?.is_published ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}
          />
          <StatCard
            label="Profile Complete"  value={`${completenessPct}%`}
            sub={`${completedItems} of 6 sections`}
            icon={TrendingUp}         iconBg="bg-violet-50 dark:bg-violet-950"    iconColor="text-violet-600 dark:text-violet-400"
          />
        </div>

        {/* ── Scheduled Sessions ── */}
        <ScheduledSessions bookings={bookings ?? []} role="teacher" />

        {/* ── Middle row ── */}
        <div className="grid lg:grid-cols-3 gap-4">

          {/* Activity chart */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Inquiry Activity</p>
              <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-lg">This week</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Inquiries received per day</p>
            <BarChart data={weeklyData} />
          </div>

          {/* Profile completeness */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Profile Completeness</p>
              <Link href="/dashboard/teacher/profile" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium flex items-center gap-1">
                <Pencil className="h-3 w-3" /> Edit
              </Link>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">{completedItems} of 6 complete</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{completenessPct}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${completenessPct}%` }} />
              </div>
            </div>

            <div className="divide-y divide-slate-50 dark:divide-slate-700">
              {completenessItems.slice(0, 4).map(item => (
                <ProfileItem key={item.label} done={item.done} label={item.label} />
              ))}
            </div>
          </div>

          {/* Profile card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-4">My Profile</p>

            {teacher ? (
              <div className="space-y-4">
                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-base shrink-0 overflow-hidden shadow-sm">
                    {teacher.profile_image_url
                      ? <img src={teacher.profile_image_url} alt={name} className="h-full w-full object-cover" />
                      : initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 dark:text-white font-bold text-sm truncate">{teacher.name}</p>
                    {teacher.tagline && <p className="text-slate-400 dark:text-slate-500 text-xs truncate mt-0.5">{teacher.tagline}</p>}
                    {teacher.hourly_rate && (
                      <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold mt-0.5">${teacher.hourly_rate}/hr</p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border ${
                  teacher.is_published
                    ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800"
                    : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800"
                }`}>
                  {teacher.is_published
                    ? <><CheckCircle className="h-3.5 w-3.5" /> Profile is live</>
                    : <><Clock className="h-3.5 w-3.5" /> Under review — 24–48 hrs</>
                  }
                </div>

                {/* Online toggle */}
                <OnlineToggle initialValue={teacher.is_online ?? false} />

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href="/dashboard/teacher/profile" className="flex-1">
                    <button className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-xl hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                      <Pencil className="h-3 w-3" /> Edit Profile
                    </button>
                  </Link>
                  {teacher.is_published && (
                    <Link href={`/teachers/${teacher.slug}`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all">
                        <ExternalLink className="h-3 w-3" /> View Live
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
                  <User className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">No profile yet</p>
                <Link href="/dashboard/teacher/profile">
                  <Button variant="primary" size="sm">Create Profile</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Earnings ── */}
        {teacher && <TeacherEarnings />}

        {/* ── Inquiries ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Student Inquiries</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{totalInquiries} received</p>
              </div>
              {totalInquiries > 0 && (
                <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800">
                  {totalInquiries}
                </span>
              )}
            </div>
          </div>

          {!inquiries || totalInquiries === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950 mb-4">
                <MessageCircle className="h-6 w-6 text-indigo-400" />
              </div>
              <p className="text-slate-900 dark:text-white font-semibold mb-1">No inquiries yet</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mx-auto">
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
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                {[
                  { label: "Student",  span: "col-span-3" },
                  { label: "Level",    span: "col-span-2" },
                  { label: "Message",  span: "col-span-4" },
                  { label: "Date",     span: "col-span-2" },
                  { label: "",         span: "col-span-1" },
                ].map(({ label, span }) => (
                  <p key={label} className={`text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider ${span}`}>
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
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${idx !== 0 ? "border-t border-slate-50 dark:border-slate-700" : ""}`}
                  >
                    <div className="col-span-3 flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                        {studentInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-900 dark:text-white text-sm font-semibold truncate">{inq.student_name || "Student"}</p>
                        <a href={`mailto:${inq.student_email}`} className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 truncate block">
                          {inq.student_email}
                        </a>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${lc.bg} ${lc.text} ${lc.border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${lc.dot}`} />
                        <span className="capitalize">{lvl}</span>
                      </span>
                    </div>

                    <div className="col-span-4">
                      <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-1">{inq.message || "—"}</p>
                      {inq.preferred_times && (
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {inq.preferred_times}
                        </p>
                      )}
                    </div>

                    <div className="col-span-2 flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs">
                      <Clock className="h-3 w-3 shrink-0" />
                      {new Date(inq.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <a
                        href={`mailto:${inq.student_email}?subject=Re: Your Swahili lesson inquiry`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
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

        {/* ── Conversations ── */}
        <ConversationInbox currentUserId={user.id} userRole="teacher" />

      </div>
    </DashboardShell>
  );
}
