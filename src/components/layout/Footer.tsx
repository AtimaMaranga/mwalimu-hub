import Link from "next/link";
import { Mail } from "lucide-react";

const footerLinks = {
  "For Students": [
    { label: "Find a Tutor", href: "/teachers" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "FAQ", href: "/faq" },
    { label: "Blog", href: "/blog" },
  ],
  "For Tutors": [
    { label: "Become a Tutor", href: "/become-a-teacher" },
    { label: "Tutor Dashboard", href: "/dashboard/teacher" },
    { label: "Requirements", href: "/become-a-teacher#requirements" },
  ],
  "Company": [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Blog", href: "/blog" },
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
    <footer className="bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main content */}
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5" aria-label="Swahili Tutors — Home">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600">
                <span className="text-white font-bold text-sm font-heading italic tracking-tight select-none">ST</span>
              </span>
              <span className="font-heading font-bold text-white text-lg tracking-tight">Swahili Tutors</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-6">
              Your gateway to Swahili fluency. Connect with qualified native Swahili teachers for personalized 1-on-1 online lessons.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-teal-600 hover:text-white transition-colors"
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
                    <Link href={link.href} className="text-sm text-slate-400 hover:text-teal-400 transition-colors">
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
            &copy; {currentYear} Swahili Tutors. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 italic">
            Asante kwa kujiunga nasi — <span className="not-italic text-slate-400">Thank you for joining us</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
