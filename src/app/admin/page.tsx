import { createAdminClient } from "@/lib/supabase/server";
import { Users, BookOpen, MessageSquare, FileText } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const supabase = await createAdminClient();
  const [teachers, posts, contacts, applications] = await Promise.all([
    supabase.from("teachers").select("id, is_published", { count: "exact" }),
    supabase.from("blog_posts").select("id, is_published", { count: "exact" }),
    supabase
      .from("contact_submissions")
      .select("id, status", { count: "exact" }),
    supabase
      .from("teacher_applications")
      .select("id, status", { count: "exact" }),
  ]);
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
      total: applications.count ?? 0,
      pending: (applications.data ?? []).filter((a) => a.status === "pending")
        .length,
    },
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    {
      title: "Teachers",
      total: stats.teachers.total,
      sub: `${stats.teachers.published} published`,
      icon: Users,
      href: "/admin/teachers",
      color: "bg-indigo-500",
    },
    {
      title: "Blog Posts",
      total: stats.posts.total,
      sub: `${stats.posts.published} published`,
      icon: BookOpen,
      href: "/admin/blog",
      color: "bg-violet-500",
    },
    {
      title: "Contact Forms",
      total: stats.contacts.total,
      sub: `${stats.contacts.new} new`,
      icon: MessageSquare,
      href: "/admin/submissions",
      color: "bg-emerald-500",
    },
    {
      title: "Applications",
      total: stats.applications.total,
      sub: `${stats.applications.pending} pending review`,
      icon: FileText,
      href: "/admin/submissions",
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold font-heading text-slate-900 mb-2">
        Dashboard
      </h1>
      <p className="text-slate-500 text-sm mb-8">
        Welcome back. Here&apos;s an overview of Mwalimu Wangu.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map(({ title, total, sub, icon: Icon, href, color }) => (
          <Link
            key={title}
            href={href}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center`}
              >
                <Icon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{total}</p>
            <p className="text-sm font-medium text-slate-600 mt-0.5">{title}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Add new teacher", href: "/admin/teachers/new" },
              { label: "Write new blog post", href: "/admin/blog/new" },
              { label: "View new contact submissions", href: "/admin/submissions" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-indigo-50 transition-colors text-sm text-slate-700 group"
              >
                <span>{label}</span>
                <span className="text-indigo-600 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-indigo-50 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-900 mb-2">Getting Started</h2>
          <p className="text-sm text-slate-600 mb-3">
            To get your platform live:
          </p>
          <ol className="space-y-2 text-sm text-slate-600 list-decimal list-inside">
            <li>Run the database migration in Supabase SQL Editor</li>
            <li>Run the seed data migration to add sample teachers</li>
            <li>Update teacher profile images with real photos</li>
            <li>Configure your email service (Resend API key)</li>
            <li>Deploy to Vercel with environment variables</li>
          </ol>
          <p className="text-xs text-slate-400 mt-3">
            See README.md for detailed instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
