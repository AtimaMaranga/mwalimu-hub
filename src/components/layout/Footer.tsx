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

const socialLinks = [
  { label: "Email", href: "mailto:hello@swahili-tutors.com", Icon: Mail },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#e8e0d4] relative overflow-hidden">
      {/* Decorative shapes */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -left-16 bottom-0 w-64 h-64 rounded-full bg-violet-300/25" />
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-amber-300/20 translate-x-1/3 -translate-y-1/3" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main content */}
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5" aria-label="Swahili Tutors — Home">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-sm">
                <span className="text-white font-bold text-sm font-heading italic tracking-tight select-none">ST</span>
              </span>
              <span className="font-heading font-bold text-slate-900 text-lg tracking-tight">Swahili Tutors</span>
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs mb-6">
              Your gateway to Swahili fluency. Connect with qualified native Swahili teachers and start your language journey today.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
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
              <h3 className="text-slate-900 font-bold text-sm mb-4">{title}</h3>
              <ul className="space-y-3" role="list">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-slate-600 hover:text-indigo-600 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            &copy; {currentYear} Swahili Tutors. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 italic">
            Asante kwa kujiunga nasi — <span className="not-italic text-slate-600">Thank you for joining us</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
