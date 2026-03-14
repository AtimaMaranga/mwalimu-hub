"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const NAV_LINKS_BASE = [
  { label: "Blog", href: "/blog" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on click outside
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? "U";

  return (
    <div className="sticky top-0 z-50">
      {/* ── Main nav ── */}
      <header
        className={cn(
          "bg-[#f0ebe3] transition-all duration-200",
          scrolled
            ? "shadow-sm border-b border-[#d8cfc4]"
            : "border-b border-transparent"
        )}
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
              aria-label="Swahili Tutors — Home"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-sm">
                <span className="text-white font-bold text-sm font-heading italic tracking-tight select-none">
                  ST
                </span>
              </span>
              <span className="font-heading font-bold text-slate-900 text-lg tracking-tight">
                Swahili Tutors
              </span>
            </Link>

            {/* Desktop Nav */}
            <ul className="hidden md:flex items-center gap-0.5" role="list">
              {[
                { label: "Find a Teacher", href: user ? "/teachers" : "/get-started" },
                ...NAV_LINKS_BASE,
              ].map((link) => {
                const isActive =
                  pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "px-4 py-2 text-sm rounded-lg transition-all duration-150",
                        isActive
                          ? "font-semibold text-indigo-600"
                          : "text-slate-700 hover:text-indigo-600 font-medium"
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                /* Logged-in user menu */
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-black/5 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                      {userInitials}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {user.user_metadata?.full_name?.split(" ")[0] ?? "Account"}
                    </span>
                    <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", userMenuOpen && "rotate-180")} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-slate-400" />
                        My Dashboard
                      </Link>
                      <Link
                        href="/dashboard/teacher/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        Edit Profile
                      </Link>
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Guest CTAs */
                <>
                  <Link href="/auth/login">
                    <button className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-black/5 transition-all">
                      Log in
                    </button>
                  </Link>
                  <Link href="/auth/signup">
                    <button className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all">
                      Sign up
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-black/5 transition-colors"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            id="mobile-menu"
            className={cn(
              "md:hidden overflow-hidden transition-all duration-300",
              mobileOpen ? "max-h-screen pb-4" : "max-h-0"
            )}
          >
            <ul className="flex flex-col gap-1 pt-2" role="list">
              {[
                { label: "Find a Teacher", href: user ? "/teachers" : "/get-started" },
                ...NAV_LINKS_BASE,
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      pathname === link.href || pathname.startsWith(link.href + "/")
                        ? "text-indigo-700 bg-indigo-50 font-semibold"
                        : "text-slate-600 hover:text-indigo-700 hover:bg-black/5"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-200 mt-2">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" fullWidth>My Dashboard</Button>
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); handleSignOut(); }}
                    className="w-full text-center text-sm text-red-600 py-2 font-medium"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" fullWidth>Log in</Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" fullWidth>Sign up free</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
