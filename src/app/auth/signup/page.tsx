"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, GraduationCap, BookOpen, Check, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import PageWrapper from "@/components/layout/PageWrapper";

type Role = "student" | "teacher";

const passwordStrength = (pw: string) => {
  if (pw.length === 0) return null;
  if (pw.length < 6) return "weak";
  if (pw.length < 8) return "fair";
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return "strong";
  return "good";
};

const strengthConfig = {
  weak:   { label: "Too short",  color: "bg-red-400",    width: "w-1/4" },
  fair:   { label: "Fair",       color: "bg-amber-400",  width: "w-2/4" },
  good:   { label: "Good",       color: "bg-indigo-400", width: "w-3/4" },
  strong: { label: "Strong",     color: "bg-emerald-500",width: "w-full" },
};

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = passwordStrength(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
          <div className="w-full max-w-md">
            <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 mb-6">
                <Mail className="h-7 w-7 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold font-heading text-slate-900 mb-3">
                Check your inbox
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-2">
                We&apos;ve sent a confirmation link to
              </p>
              <p className="font-semibold text-slate-800 mb-6">{email}</p>
              <p className="text-xs text-slate-400 mb-8">
                Click the link in the email to activate your account. Check your spam folder if you don&apos;t see it within a minute.
              </p>
              <Link href="/auth/login">
                <Button variant="outline" fullWidth>Back to sign in</Button>
              </Link>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 justify-center mb-7 group">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                <span className="text-white font-bold text-sm font-heading italic">MW</span>
              </span>
              <span className="font-heading font-bold text-slate-900 text-lg tracking-tight">Mwalimu Wangu</span>
            </Link>
            <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">Create your account</h1>
            <p className="text-slate-500 text-sm">Start your Swahili journey today — it&apos;s free</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Role selector — top tabs */}
            <div className="grid grid-cols-2 border-b border-slate-100">
              {([
                { value: "student" as Role, label: "I want to learn", icon: BookOpen, sub: "Find a teacher" },
                { value: "teacher" as Role, label: "I want to teach", icon: GraduationCap, sub: "Earn from lessons" },
              ]).map(({ value, label, icon: Icon, sub }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`flex flex-col items-center gap-1.5 py-5 px-4 text-sm font-medium transition-all relative ${
                    role === value
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  {role === value && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
                  )}
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                    role === value ? "bg-indigo-100" : "bg-slate-100"
                  }`}>
                    <Icon className={`h-4.5 w-4.5 ${role === value ? "text-indigo-600" : "text-slate-400"}`} />
                  </span>
                  <span className="font-semibold">{label}</span>
                  <span className={`text-xs font-normal ${role === value ? "text-indigo-500" : "text-slate-400"}`}>{sub}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSignup} className="p-8 space-y-5">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow placeholder:text-slate-300"
                  placeholder="e.g. Amina Odhiambo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow placeholder:text-slate-300"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-2.5 pr-11 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow placeholder:text-slate-300"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password strength bar */}
                {strength && (
                  <div className="mt-2">
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strengthConfig[strength].color} ${strengthConfig[strength].width}`} />
                    </div>
                    <p className={`text-xs mt-1 font-medium ${
                      strength === "weak" ? "text-red-500" :
                      strength === "fair" ? "text-amber-500" :
                      strength === "good" ? "text-indigo-500" : "text-emerald-600"
                    }`}>{strengthConfig[strength].label}</p>
                  </div>
                )}
              </div>

              {/* What you get */}
              <div className="bg-slate-50 rounded-xl px-4 py-3.5 space-y-2">
                {(role === "student"
                  ? ["Browse all native Swahili teachers", "Send inquiries for free", "Track your learning journey"]
                  : ["Create your teacher profile", "Receive student inquiries", "Set your own schedule & rates"]
                ).map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-xs text-slate-600">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 shrink-0">
                      <Check className="h-2.5 w-2.5 text-indigo-600" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              <Button type="submit" variant="primary" size="lg" loading={loading} fullWidth>
                {role === "student" ? "Create student account" : "Create teacher account"}
              </Button>

              <p className="text-xs text-slate-400 text-center leading-relaxed">
                By signing up you agree to our{" "}
                <Link href="/terms" className="text-indigo-500 hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-indigo-500 hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-indigo-600 font-semibold hover:text-indigo-700">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </PageWrapper>
  );
}
