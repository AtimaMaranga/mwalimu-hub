import { createAdminClient } from "@/lib/supabase/server";
import {
  Users, BookOpen, MessageSquare, FileText,
  ChevronRight, Clock, CheckCircle, XCircle, AlertCircle,
  TrendingUp, UserPlus, Globe,
} from "lucide-react";
import Link from "next/link";

async function getStats() {
  const supabase = await createAdminClient();
  const [teachers, posts, contacts, applications, inquiries] = await Promise.all([
    supabase.from("teachers").select("id, is_published", { count: "exact" }),
    supabase.from("blog_posts").select("id, is_published", { count: "exact" }),
    supabase.from("contact_submissions").select("id, status", { count: "exact" }),
    supabase.from("teacher_applications").select("id, status, name, email, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("student_inquiries").select("id", { count: "exact" }),
  ]);

  const allApplications = await supabase
    .from("teacher_applications")
    .select("id, status", { count: "exact" });

  return {
    teachers: {
      total: teachers.count ?? 0,
      published: (teachers.data ?? []).filter((t) => t.is_published).length,
    },
    posts: {
      total: posts.count ?? 0,
      published: (posts.data ?? []).filter((p) => p.is_published).length,
    },
    contacts: {
      total: contacts.count ?? 0,
      new: (contacts.data ?? []).filter((c) => c.status === "new").length,
    },
    applications: {
      total: allApplications.count ?? 0,
      pending: (allApplications.data ?? []).filter((a) => a.status === "pending").length,
      recent: applications.data ?? [],
    },
    inquiries: inquiries.count ?? 0,
  };
}

const statusConfig: Record<string, { label: string; icon: any; cls: string }> = {
  pending:  { label: "Pending",  icon: AlertCircle,  cls: "text-amber-600 bg-amber-50 border-amber-200" },
  approved: { label: "Approved", icon: CheckCircle,  cls: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  rejected: { label: "Rejected", icon: XCircle,      cls: "text-red-600 bg-red-50 border-red-200" },
};

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    {
      title: "Published Teachers",
      value: stats.teachers.published,
      sub: `${stats.teachers.total} total`,
      icon: Users,
      href: "/admin/teachers",
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      accent: "border-l-indigo-500",
    },
    {
      title: "Pending Applications",
      value: stats.applications.pending,
      sub: `${stats.applications.total} total received`,
      icon: FileText,
      href: "/admin/submissions",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      accent: "border-l-amber-500",
    },
    {
      title: "Blog Posts",
      value: stats.posts.published,
      sub: `${stats.posts.total} total written`,
      icon: BookOpen,
      href: "/admin/blog",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      accent: "border-l-violet-500",
    },
    {
      title: "Student Inquiries",
      value: stats.inquiries,
      sub: "Total inquiries sent",
      icon: TrendingUp,
      href: "/admin/submissions",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      accent: "border-l-emerald-500",
    },
  ];

  const quickActions = [
    { label: "Add new teacher",           sub: "Manually create a teacher profile", href: "/admin/teachers/new",  icon: UserPlus },
    { label: "Write a blog post",         sub: "Publish content for learners",       href: "/admin/blog/new",      icon: BookOpen },
    { label: "Review applications",       sub: `${stats.applications.pending} awaiting review`, href: "/admin/submissions", icon: FileText },
    { label: "View contact submissions",  sub: `${stats.contacts.new} new messages`, href: "/admin/submissions",  icon: MessageSquare },
    { label: "View live teacher listing", sub: "See the public teachers page",       href: "/teachers",            icon: Globe },
  ];

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Welcome back. Here&apos;s an overview of Swahili Tutors.</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ title, value, sub, icon: Icon, href, iconBg, iconColor, accent }) => (
          <Link
            key={title}
            href={href}
            className={`bg-white rounded-2xl p-5 border border-slate-100 border-l-4 ${accent} shadow-sm hover:shadow-md transition-all group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`h-10 w-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm font-medium text-slate-600 mt-0.5">{title}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </Link>
        ))}
      </div>

      {/* ── Two-column section ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <FileText className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Recent Applications</p>
                <p className="text-xs text-slate-400">{stats.applications.pending} pending review</p>
              </div>
            </div>
            <Link href="/admin/submissions" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {stats.applications.recent.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 text-sm">No applications yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {stats.applications.recent.map((app: any) => {
                const sc = statusConfig[app.status] ?? statusConfig.pending;
                const StatusIcon = sc.icon;
                return (
                  <div key={app.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {app.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{app.name}</p>
                      <p className="text-xs text-slate-400 truncate">{app.email}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${sc.cls}`}>
                      <StatusIcon className="h-3 w-3" />
                      {sc.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                      <Clock className="h-3 w-3" />
                      {new Date(app.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-sm font-bold text-slate-900 mb-4">Quick Actions</p>
          <div className="space-y-1.5">
            {quickActions.map(({ label, sub, href, icon: Icon }) => (
              <Link
                key={href + label}
                href={href}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
              >
                <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                  <Icon className="h-4 w-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
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

      {/* ── Platform overview ── */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 shadow-lg shadow-indigo-200">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Platform Health</p>
            <h2 className="text-white text-lg font-bold mb-1">Everything is running smoothly</h2>
            <p className="text-indigo-200 text-sm">
              {stats.teachers.published} teachers live · {stats.posts.published} blog posts · {stats.inquiries} student inquiries
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/admin/teachers/new" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm">
              <UserPlus className="h-4 w-4" /> Add Teacher
            </Link>
            <Link href="/admin/submissions" className="inline-flex items-center gap-2 bg-indigo-500 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:bg-indigo-400 transition-colors border border-indigo-400">
              <FileText className="h-4 w-4" /> Review Apps
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
