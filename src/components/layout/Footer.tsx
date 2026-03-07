import Link from "next/link";
import { Mail } from "lucide-react";

const footerLinks = {
  "Learn": [
    { label: "Find a Teacher", href: "/teachers" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Blog", href: "/blog" },
    { label: "Get Started", href: "/contact" },
  ],
  "Teach": [
    { label: "Become a Teacher", href: "/become-a-teacher" },
    { label: "Teacher Requirements", href: "/become-a-teacher#requirements" },
    { label: "Teacher Benefits", href: "/become-a-teacher#benefits" },
  ],
  "Company": [
    { label: "About Us", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  "Legal": [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

/** Only real social links — placeholders are excluded */
const socialLinks = [
  { label: "Email", href: "mailto:hello@mwalimuwangu.com", Icon: Mail },
  // Add Twitter, Facebook, Instagram, YouTube URLs here when live:
  // { label: "Twitter",   href: "https://twitter.com/mwalimuwangu",   Icon: Twitter   },
  // { label: "Facebook",  href: "https://facebook.com/mwalimuwangu",  Icon: Facebook  },
  // { label: "Instagram", href: "https://instagram.com/mwalimuwangu", Icon: Instagram },
  // { label: "YouTube",   href: "https://youtube.com/@mwalimuwangu",  Icon: Youtube   },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2.5 mb-4"
              aria-label="Mwalimu Wangu — Home"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-900/40">
                <span className="text-white font-bold text-sm font-heading italic tracking-tight select-none">
                  MW
                </span>
              </span>
              <span className="font-heading font-bold text-white text-lg tracking-tight">Mwalimu Wangu</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Your gateway to Swahili fluency. Connect with qualified native
              Swahili teachers and start your language journey today.
            </p>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 mt-6">
                {socialLinks.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-indigo-600 transition-colors"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold text-sm mb-4">{title}</h3>
              <ul className="space-y-3" role="list">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            &copy; {currentYear} Mwalimu Wangu. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 italic">
            Asante kwa kujiunga nasi —{" "}
            <span className="not-italic text-slate-600">
              Thank you for joining us
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
