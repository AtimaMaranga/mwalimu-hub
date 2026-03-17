"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search, Settings, LogOut, Menu, X,
  LayoutDashboard, User, MessageCircle, BookOpen, Users,
} from "lucide-react";
import DeleteAccountButton from "./DeleteAccountButton";
import NotificationDropdown from "./NotificationDropdown";
import IncomingCallOverlay from "./IncomingCallOverlay";
import { usePresence } from "@/hooks/usePresence";

const NAV_ITEMS = {
  student: [
    { label: "Dashboard",     href: "/dashboard/student",         icon: LayoutDashboard },
    { label: "My Profile",    href: "/dashboard/student/profile", icon: User },
    { label: "Find Teachers", href: "/teachers",                  icon: Search },
    { label: "My Inquiries",  href: "/dashboard/student",         icon: MessageCircle },
    { label: "How It Works",  href: "/how-it-works",              icon: BookOpen },
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

  usePresence();

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setSidebarOpen(false)}>
          <img src="/logo.png" alt="Swahili Tutors" className="h-9 w-9 rounded-xl object-cover shrink-0" />
          <div>
            <span className="text-slate-900 font-bold text-sm tracking-tight block leading-none">Swahili Tutors</span>
            <span className="text-slate-400 text-[10px] font-medium capitalize">{role} portal</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menu</p>
        <div className="space-y-0.5">
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
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-indigo-600" : "text-slate-400")} />
                {label}
                {isActive && (
                  <span className="ml-auto h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <p className="px-3 mt-6 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account</p>
        <div className="space-y-0.5">
          <Link
            href="/settings"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            <Settings className="h-4 w-4 shrink-0 text-slate-400" />
            Settings
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all w-full"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Log Out
            </button>
          </form>
          <DeleteAccountButton />
        </div>
      </nav>

      {/* User card at bottom */}
      <div className="px-4 pb-5 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 text-xs font-semibold truncate">{firstName}</p>
            <p className="text-slate-400 text-[10px] capitalize">{userRole}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Incoming call overlay */}
      <IncomingCallOverlay />

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-60 bg-white flex-col border-r border-slate-100 shadow-sm shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white flex flex-col border-r border-slate-100 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-100 shadow-sm flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">
                Good day, {firstName}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                Welcome back to your {role} dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <NotificationDropdown />

            {/* Divider */}
            <div className="h-8 w-px bg-slate-100" />

            {/* User chip */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                {userInitials}
              </div>
              <div className="hidden sm:block leading-none">
                <p className="text-slate-900 text-xs font-semibold">{firstName}</p>
                <p className="text-slate-400 text-xs mt-0.5 capitalize">{userRole}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
