"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, Bell, Settings, LogOut, type LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface DashboardShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  userName: string;
  userInitials: string;
  userRole: string;
}

export default function DashboardShell({
  children,
  navItems,
  userName,
  userInitials,
  userRole,
}: DashboardShellProps) {
  const pathname = usePathname();
  const firstName = userName.split(" ")[0];

  return (
    <div className="flex h-screen bg-[#13141f] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-56 bg-[#0c0d16] flex flex-col border-r border-white/5 shrink-0">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-900/40 text-white font-bold text-xs italic shrink-0">
              MW
            </span>
            <span className="text-white font-bold text-sm tracking-tight">Mwalimu Wangu</span>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
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
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top header */}
        <header className="h-16 bg-[#0c0d16] border-b border-white/5 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Welcome, {firstName}
          </h1>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all w-44"
              />
            </div>

            {/* Notification bell */}
            <button className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:border-white/20 transition-all">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-[#0c0d16]" />
            </button>

            {/* User chip */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-cyan-900/30">
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
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
