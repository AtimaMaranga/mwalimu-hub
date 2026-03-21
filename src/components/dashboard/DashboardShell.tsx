"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Search, Settings, LogOut, Menu, X,
  LayoutDashboard, User, MessageCircle, BookOpen, Users,
  Sun, Moon,
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
  const { theme, setTheme } = useTheme();

  usePresence(30_000, role === "teacher");

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-700">
        <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setSidebarOpen(false)}>
          <img src="/logo.png" alt="Swahili Tutors" className="h-9 w-9 rounded-xl object-cover shrink-0" />
          <div>
            <span className="text-slate-900 dark:text-white font-bold text-sm tracking-tight block leading-none">Swahili Tutors</span>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-medium capitalize">{role} portal</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Menu</p>
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
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500")} />
                {label}
                {isActive && (
                  <span className="ml-auto h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <p className="px-3 mt-6 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Account</p>
        <div className="space-y-0.5">
          <Link
            href="/settings"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-all"
          >
            <Settings className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
            Settings
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950 transition-all w-full"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Log Out
            </button>
          </form>
          <DeleteAccountButton />
        </div>
      </nav>

      {/* User card at bottom */}
      <div className="px-4 pb-5 pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 dark:text-white text-xs font-semibold truncate">{firstName}</p>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] capitalize">{userRole}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">

      {/* Incoming call overlay */}
      <IncomingCallOverlay />

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-60 bg-white dark:bg-slate-800 flex-col border-r border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 flex flex-col border-r border-slate-100 dark:border-slate-700 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                Good day, {firstName}
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">
                Welcome back to your {role} dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 hidden dark:block" />
              <Moon className="h-4 w-4 block dark:hidden" />
            </button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Divider */}
            <div className="h-8 w-px bg-slate-100 dark:bg-slate-700" />

            {/* User chip */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                {userInitials}
              </div>
              <div className="hidden sm:block leading-none">
                <p className="text-slate-900 dark:text-white text-xs font-semibold">{firstName}</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 capitalize">{userRole}</p>
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
