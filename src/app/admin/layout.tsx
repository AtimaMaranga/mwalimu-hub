import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  LayoutDashboard, Users, BookOpen, MessageSquare,
  LogOut, FileText, ExternalLink, GraduationCap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard | Swahili Tutors",
  robots: { index: false, follow: false },
};

const navItems = [
  { href: "/admin",             label: "Dashboard",   icon: LayoutDashboard, exact: true },
  { href: "/admin/teachers",    label: "Teachers",    icon: Users },
  { href: "/admin/blog",        label: "Blog Posts",  icon: BookOpen },
  { href: "/admin/submissions", label: "Submissions", icon: MessageSquare },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <>{children}</>;

  const adminName = user.email?.split("@")[0] ?? "Admin";
  const initials = adminName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Sidebar ── */}
      <aside className="w-60 bg-white border-r border-slate-100 flex flex-col shrink-0 shadow-sm">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-md shadow-indigo-200 text-white font-bold text-sm italic shrink-0">
              ST
            </span>
            <div>
              <p className="text-slate-900 font-bold text-sm leading-none">Swahili Tutors</p>
              <p className="text-slate-400 text-[10px] font-medium mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menu</p>
          <div className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all group"
              >
                <Icon className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                {label}
              </Link>
            ))}
          </div>

          <p className="px-3 mt-6 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Site</p>
          <div className="space-y-0.5">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all group"
            >
              <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              View Website
            </Link>
            <Link
              href="/teachers"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all group"
            >
              <GraduationCap className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              Teacher Listing
            </Link>
          </div>
        </nav>

        {/* User + logout */}
        <div className="px-4 pb-5 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-xs font-semibold truncate">{adminName}</p>
              <p className="text-slate-400 text-[10px]">Administrator</p>
            </div>
          </div>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top header */}
        <header className="h-16 bg-white border-b border-slate-100 shadow-sm flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">Admin Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">Swahili Tutors management panel</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/teachers"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Live Site
            </Link>
            <div className="h-8 w-px bg-slate-100" />
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
