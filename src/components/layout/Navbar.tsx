"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

const navLinks = [
  { label: "Find a Teacher", href: "/teachers" },
  { label: "Blog", href: "/blog" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
];

const greetings = [
  "Karibu · Learn Swahili from native speakers",
  "Habari? — Start your Swahili journey today",
  "Expert native teachers · Flexible schedules",
  "Join learners across 14+ countries · Asante",
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const id = setInterval(
      () => setGreetingIndex((i) => (i + 1) % greetings.length),
      3500
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-0 z-50">
      {/* ── Announcement / greeting bar ── */}
      <div className="bg-indigo-950 text-indigo-300 text-xs py-2 text-center overflow-hidden tracking-wide">
        <span
          key={greetingIndex}
          className="inline-block animate-fade-in font-medium"
        >
          {greetings[greetingIndex]}
        </span>
      </div>

      {/* ── Main nav ── */}
      <header
        className={cn(
          "border-b transition-all duration-200",
          scrolled
            ? "bg-white border-slate-200 shadow-md"
            : "bg-white border-slate-100 shadow-sm"
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
              aria-label="Mwalimu Wangu — Home"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-sm shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow duration-200">
                <span className="text-white font-bold text-sm font-heading italic tracking-tight select-none">
                  MW
                </span>
              </span>
              <span className="font-heading font-bold text-slate-900 text-lg tracking-tight">
                Mwalimu Wangu
              </span>
            </Link>

            {/* Desktop Nav */}
            <ul className="hidden md:flex items-center gap-0.5" role="list">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "relative px-4 py-2 text-sm font-medium transition-all duration-150 rounded-lg",
                        isActive
                          ? "text-indigo-700 font-semibold bg-indigo-50"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      {link.label}
                      {isActive && (
                        <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-indigo-600 rounded-full" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/become-a-teacher">
                <Button variant="outline" size="sm">
                  Become a Teacher
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-slate-50 transition-colors"
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
              mobileOpen ? "max-h-96 pb-4" : "max-h-0"
            )}
          >
            <ul className="flex flex-col gap-1 pt-2" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      pathname === link.href ||
                        pathname.startsWith(link.href + "/")
                        ? "text-indigo-700 bg-indigo-50 font-semibold"
                        : "text-slate-600 hover:text-indigo-700 hover:bg-slate-50"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 mt-2">
              <Link href="/become-a-teacher" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" fullWidth>
                  Become a Teacher
                </Button>
              </Link>
              <Link href="/contact" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" fullWidth>
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
