"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search, Bell, Settings, LogOut, Menu, X,
  LayoutDashboard, User, MessageCircle, BookOpen, Users,
} from "lucide-react";
import DeleteAccountButton from "./DeleteAccountButton";

const NAV_ITEMS = {
  student: [
    { label: "Dashboard",     href: "/dashboard/student", icon: LayoutDashboard },
    { label: "Find Teachers", href: "/teachers",           icon: Search },
    { label: "My Inquiries",  href: "/dashboard/student", icon: MessageCircle },
    { label: "How It Works",  href: "/how-it-works",       icon: BookOpen },
  ],
  teacher: [
    { label: "Dashboard",   href: "/dashboard/teacher",         icon: LayoutDashboard },
    { label: "My Profile",  href: "/dashboard/teacher/profile", icon: User },
    { label: "Inquiries",   href: "/dashboard/teacher",         icon: MessageCircle },
    { label: "Browse Site", href: "/teachers",                  icon: Users },
  ],
};

interface DashboardShellProps {
  children: React.ReactNode;
  role: "student" | "teacher";
  userName: string;
  userInitials: string;
  userRole: string;
}

export default function DashboardShell({
  children,
  role,
  userName,
  userInitials,
  userRole,
}: DashboardShellProps) {
  const pathname = usePathname();
  const firstName = userName.split(" ")[0];
  const navItems = NAV_ITEMS[role];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setSidebarOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-900/40 text-white font-bold text-xs italic shrink-0">
            ST
          </span>
          <span className="text-white font-bold text-sm tracking-tight">Swahili Tutors</span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={`${href}-${label}`}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-cyan-500/15 text-cyan-400 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-cyan-400" : "text-slate-500")} />
              {label}
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div className="px-3 pb-4 pt-2 border-t border-white/5 space-y-0.5">
        <Link
          href="/settings"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings className="h-4 w-4 shrink-0 text-slate-500" />
          Settings
        </Link>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Log Out
          </button>
        </form>
        <DeleteAccountButton />
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#13141f] overflow-hidden">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-56 bg-[#0c0d16] flex-col border-r border-white/5 shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile sidebar drawer ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#0c0d16] flex flex-col border-r border-white/5 transform transition-transform duration-300 ease-in-out md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top header */}
        <header className="h-16 bg-[#0c0d16] border-b border-white/5 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/8 text-slate-400 hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-base sm:text-xl font-bold text-white tracking-tight">
              Welcome, {firstName}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search — hidden on small mobile */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all w-44"
              />
            </div>

            {/* Notification bell */}
            <button className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:border-white/20 transition-all shrink-0">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-[#0c0d16]" />
            </button>

            {/* User chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-cyan-900/30 shrink-0">
                {userInitials}
              </div>
              <div className="hidden sm:block text-right leading-none">
                <p className="text-white text-xs font-semibold">{firstName}</p>
                <p className="text-slate-500 text-xs mt-0.5 capitalize">{userRole}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
