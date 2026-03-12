"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, Mail, Check, ArrowRight, ArrowLeft,
  GraduationCap, BookOpen, User, MapPin, Briefcase,
  Clock, DollarSign, FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Helpers ────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300 ${className}`}
    />
  );
}

function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-700 ${className}`}
    >
      {children}
    </select>
  );
}

function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-300 resize-none leading-relaxed ${className}`}
    />
  );
}

function PasswordInput({
  value, onChange, placeholder, autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Min. 8 characters"}
        autoComplete={autoComplete ?? "new-password"}
        className="pr-11"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = (() => {
    if (!password) return null;
    if (password.length < 6) return "weak";
    if (password.length < 8) return "fair";
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return "strong";
    return "good";
  })();
  if (!strength) return null;
  const cfg = {
    weak:   { label: "Too short",  color: "bg-red-400",     w: "w-1/4" },
    fair:   { label: "Fair",       color: "bg-amber-400",   w: "w-2/4" },
    good:   { label: "Good",       color: "bg-indigo-400",  w: "w-3/4" },
    strong: { label: "Strong",     color: "bg-emerald-500", w: "w-full" },
  }[strength];
  return (
    <div className="mt-2">
      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${cfg.color} ${cfg.w}`} />
      </div>
      <p className={`text-xs mt-1 font-medium ${
        strength === "weak" ? "text-red-500" : strength === "fair" ? "text-amber-500" :
        strength === "good" ? "text-indigo-500" : "text-emerald-600"
      }`}>{cfg.label}</p>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-start gap-2">
      <span className="mt-0.5 shrink-0">⚠</span>
      <span>{message}</span>
    </div>
  );
}

// ─── Decorative right panel ─────────────────────────────────────────────────

function DecorativePanel() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
      {/* Concentric ring decorations */}
      <div className="absolute inset-0 flex items-center justify-end">
        {[700, 560, 420, 300, 200, 120].map((size, i) => (
          <div
            key={size}
            className="absolute rounded-full border border-white/10"
            style={{ width: size, height: size, right: -size / 2.5 }}
          />
        ))}
        {/* Filled inner circle */}
        <div className="absolute rounded-full bg-white/5 border border-white/15" style={{ width: 200, height: 200, right: -40 }} />
        <div className="absolute rounded-full bg-white/8 border border-white/15" style={{ width: 100, height: 100, right: 0 }} />
      </div>

      {/* Bottom left accent circles */}
      <div className="absolute bottom-0 left-0">
        {[300, 220, 140].map((size) => (
          <div
            key={size}
            className="absolute rounded-full border border-white/10"
            style={{ width: size, height: size, bottom: -size / 3, left: -size / 3 }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 px-12 py-16 text-center max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-12">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-sm font-heading italic shadow-lg">
            ST
          </span>
          <span className="text-white font-bold text-lg tracking-tight">Swahili Tutors</span>
        </div>

        <h2 className="text-white text-2xl font-bold font-heading leading-snug mb-4">
          Join thousands learning<br />Swahili online
        </h2>
        <p className="text-indigo-200 text-sm leading-relaxed mb-10">
          Connect with native Swahili teachers from East Africa and start your language journey today.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: "500+", label: "Active students" },
            { value: "50+", label: "Native teachers" },
            { value: "4.9★", label: "Average rating" },
            { value: "12+", label: "Countries reached" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-4 border border-white/15 text-left">
              <p className="text-white text-xl font-bold leading-none mb-1">{value}</p>
              <p className="text-indigo-200 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Success screen ─────────────────────────────────────────────────────────

function SuccessScreen({ email, isTeacher }: { email: string; isTeacher: boolean }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 mb-6">
            <Mail className="h-7 w-7 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 mb-3">Check your inbox</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-2">
            We&apos;ve sent a confirmation link to
          </p>
          <p className="font-semibold text-slate-800 mb-4">{email}</p>
          {isTeacher && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4 text-left">
              <p className="text-amber-800 text-xs font-semibold mb-1">Application received</p>
              <p className="text-amber-700 text-xs leading-relaxed">
                Your teacher application has also been submitted for review. We&apos;ll get back to you within 48 hours after confirming your email.
              </p>
            </div>
          )}
          <p className="text-xs text-slate-400 mb-8">
            Click the link in the email to activate your account. Check your spam folder if you don&apos;t see it.
          </p>
          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Student signup form ─────────────────────────────────────────────────────

function StudentSignupForm({
  onSuccess, onGoogleClick, googleLoading,
}: {
  onSuccess: (email: string) => void;
  onGoogleClick: () => void;
  googleLoading: boolean;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "student", full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard/student&welcome=1`,
      },
    });
    if (err) { setError(err.message); setLoading(false); }
    else { onSuccess(email); }
  };

  return (
    <div className="space-y-5">
      {/* Google */}
      <button
        type="button"
        onClick={onGoogleClick}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
      >
        <GoogleIcon />
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">or sign up with email</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorBox message={error} />}

        <div>
          <FieldLabel required>Full name</FieldLabel>
          <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            placeholder="e.g. Amina Odhiambo"
          />
        </div>

        <div>
          <FieldLabel required>Email address</FieldLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <FieldLabel required>Password</FieldLabel>
          <PasswordInput value={password} onChange={setPassword} />
          <PasswordStrengthBar password={password} />
        </div>

        <div>
          <FieldLabel required>Confirm password</FieldLabel>
          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repeat your password"
            autoComplete="new-password"
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1.5 font-medium">Passwords don&apos;t match</p>
          )}
          {confirmPassword && password === confirmPassword && password.length >= 8 && (
            <p className="text-xs text-emerald-600 mt-1.5 font-medium flex items-center gap-1">
              <Check className="h-3 w-3" /> Passwords match
            </p>
          )}
        </div>

        {/* Benefits */}
        <div className="bg-indigo-50 rounded-xl px-4 py-3.5 space-y-2">
          {["Browse all native Swahili teachers", "Send free inquiries to teachers", "Track your learning journey"].map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-xs text-indigo-700">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 shrink-0">
                <Check className="h-2.5 w-2.5 text-indigo-600" />
              </span>
              {item}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 shadow-sm shadow-indigo-200"
        >
          {loading ? (
            <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating account…</>
          ) : (
            <>Create student account <ArrowRight className="h-4 w-4" /></>
          )}
        </button>

        <p className="text-xs text-slate-400 text-center leading-relaxed">
          By signing up you agree to our{" "}
          <Link href="/terms" className="text-indigo-500 hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-indigo-500 hover:underline">Privacy Policy</Link>.
        </p>
      </form>
    </div>
  );
}

// ─── Teacher signup form (multi-step) ────────────────────────────────────────

const TEACHER_STEPS = [
  { id: 1, label: "Account",  icon: User },
  { id: 2, label: "Personal", icon: MapPin },
  { id: 3, label: "Teaching", icon: Briefcase },
];

function TeacherStepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {TEACHER_STEPS.map(({ id, label, icon: Icon }, idx) => (
        <div key={id} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              id < step  ? "bg-indigo-600 text-white" :
              id === step ? "bg-indigo-600 text-white ring-4 ring-indigo-100" :
              "bg-slate-100 text-slate-400"
            }`}>
              {id < step ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${id === step ? "text-indigo-700" : id < step ? "text-slate-500" : "text-slate-300"}`}>
              {label}
            </span>
          </div>
          {idx < TEACHER_STEPS.length - 1 && (
            <div className={`h-px w-6 transition-colors ${id < step ? "bg-indigo-400" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function TeacherSignupForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — Account
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2 — Personal
  const [gender, setGender] = useState("");
  const [ageBracket, setAgeBracket] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  // Step 3 — Teaching
  const [experience, setExperience] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [availableHours, setAvailableHours] = useState("");
  const [rateExpectation, setRateExpectation] = useState("");
  const [teachingPhilosophy, setTeachingPhilosophy] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (step === 1) {
      if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
      if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    }
    if (step === 2) {
      if (!country) { setError("Please enter your country."); return; }
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!agreeTerms) { setError("Please agree to the terms to continue."); return; }
    if (teachingPhilosophy.trim().length < 50) {
      setError("Teaching philosophy must be at least 50 characters."); return;
    }
    setLoading(true);

    try {
      // 1. Create auth account
      const supabase = createClient();
      const { error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: "teacher", full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard/teacher&welcome=1`,
        },
      });
      if (authErr) { setError(authErr.message); setLoading(false); return; }

      // 2. Submit teacher application
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          phone: phone || undefined,
          gender: gender || undefined,
          age_bracket: ageBracket || undefined,
          country: country || undefined,
          city: city || undefined,
          experience,
          qualifications,
          available_hours: Number(availableHours),
          rate_expectation: Number(rateExpectation),
          teaching_philosophy: teachingPhilosophy,
          agree_terms: true,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        console.error("Application submission error:", body.error);
        // Don't block signup — application can be submitted separately
      }

      onSuccess(email);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <TeacherStepIndicator step={step} />

      {/* Step 1: Account */}
      {step === 1 && (
        <form onSubmit={nextStep} className="space-y-4">
          {error && <ErrorBox message={error} />}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <FieldLabel required>Full name</FieldLabel>
              <Input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="e.g. Juma Mwangi" autoComplete="name" />
            </div>
            <div>
              <FieldLabel required>Email address</FieldLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" autoComplete="email" />
            </div>
            <div>
              <FieldLabel>Phone number <span className="text-slate-400 text-xs font-normal">(optional)</span></FieldLabel>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 700 000000" autoComplete="tel" />
            </div>
            <div>
              <FieldLabel required>Password</FieldLabel>
              <PasswordInput value={password} onChange={setPassword} />
              <PasswordStrengthBar password={password} />
            </div>
            <div>
              <FieldLabel required>Confirm password</FieldLabel>
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat your password" />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">Passwords don&apos;t match</p>
              )}
              {confirmPassword && password === confirmPassword && password.length >= 8 && (
                <p className="text-xs text-emerald-600 mt-1.5 font-medium flex items-center gap-1">
                  <Check className="h-3 w-3" /> Passwords match
                </p>
              )}
            </div>
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-indigo-200">
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* Step 2: Personal details */}
      {step === 2 && (
        <form onSubmit={nextStep} className="space-y-4">
          {error && <ErrorBox message={error} />}
          <p className="text-xs text-slate-400 -mt-1 mb-1">This information helps us match you with the right students.</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Gender</FieldLabel>
              <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non_binary">Non-binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </Select>
            </div>
            <div>
              <FieldLabel>Age bracket</FieldLabel>
              <Select value={ageBracket} onChange={(e) => setAgeBracket(e.target.value)}>
                <option value="">Select…</option>
                <option value="18-25">18 – 25</option>
                <option value="26-35">26 – 35</option>
                <option value="36-45">36 – 45</option>
                <option value="46-55">46 – 55</option>
                <option value="55+">55+</option>
              </Select>
            </div>
          </div>

          <div>
            <FieldLabel required>Country of residence</FieldLabel>
            <Input type="text" value={country} onChange={(e) => setCountry(e.target.value)} required placeholder="e.g. Kenya, Tanzania, Uganda…" />
          </div>

          <div>
            <FieldLabel>City / Region</FieldLabel>
            <Input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Nairobi, Dar es Salaam…" />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => { setError(""); setStep(1); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-indigo-200">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Teaching details */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorBox message={error} />}
          <p className="text-xs text-slate-400 -mt-1 mb-1">Tell us about your teaching background. We review all applications within 48 hours.</p>

          <div>
            <FieldLabel required>
              <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-slate-400" />Teaching experience</span>
            </FieldLabel>
            <Textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
              rows={3}
              placeholder="Describe your experience teaching Swahili — years, context, types of students…"
            />
          </div>

          <div>
            <FieldLabel required>
              <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-slate-400" />Qualifications & certifications</span>
            </FieldLabel>
            <Textarea
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              required
              rows={2}
              placeholder="Degrees, teaching certifications, language qualifications…"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-slate-400" />Hours/week available</span>
              </FieldLabel>
              <Input
                type="number"
                value={availableHours}
                onChange={(e) => setAvailableHours(e.target.value)}
                required
                min={1}
                max={80}
                placeholder="e.g. 10"
              />
            </div>
            <div>
              <FieldLabel required>
                <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-slate-400" />Rate (USD/hr)</span>
              </FieldLabel>
              <Input
                type="number"
                value={rateExpectation}
                onChange={(e) => setRateExpectation(e.target.value)}
                required
                min={5}
                max={200}
                placeholder="e.g. 25"
              />
            </div>
          </div>

          <div>
            <FieldLabel required>
              <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-slate-400" />Teaching philosophy</span>
            </FieldLabel>
            <Textarea
              value={teachingPhilosophy}
              onChange={(e) => setTeachingPhilosophy(e.target.value)}
              required
              rows={3}
              placeholder="How do you approach teaching Swahili? What makes your lessons unique? (min. 50 characters)"
            />
            <p className="text-xs text-slate-400 mt-1">{teachingPhilosophy.length} / 50 min characters</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="sr-only"
              />
              <div className={`h-4.5 w-4.5 rounded border-2 flex items-center justify-center transition-colors ${
                agreeTerms ? "bg-indigo-600 border-indigo-600" : "border-slate-300 group-hover:border-indigo-400"
              }`} style={{ width: 18, height: 18 }}>
                {agreeTerms && <Check className="h-2.5 w-2.5 text-white" />}
              </div>
            </div>
            <span className="text-xs text-slate-500 leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" className="text-indigo-500 hover:underline" target="_blank">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-indigo-500 hover:underline" target="_blank">Privacy Policy</Link>. I confirm the information above is accurate.
            </span>
          </label>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => { setError(""); setStep(2); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-indigo-200 disabled:opacity-60"
            >
              {loading ? (
                <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Submitting…</>
              ) : (
                <>Submit application <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

type Role = "student" | "teacher";

export default function SignupPage() {
  const [role, setRole] = useState<Role>("student");
  const [successEmail, setSuccessEmail] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}&next=/dashboard/${role}&welcome=1`,
      },
    });
  };

  if (successEmail) {
    return <SuccessScreen email={successEmail} isTeacher={role === "teacher"} />;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.1fr_0.9fr]">

      {/* ── Left: Form panel ── */}
      <div className="flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 xl:px-16 py-12">
          <div className="w-full max-w-md mx-auto">

            {/* Logo (mobile shows on left panel) */}
            <Link href="/" className="flex items-center gap-2.5 mb-8 group w-fit">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-md shadow-indigo-200 text-white font-bold text-sm font-heading italic">
                ST
              </span>
              <span className="font-heading font-bold text-slate-900 text-base tracking-tight">Swahili Tutors</span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 mb-1.5">
              Create your account
            </h1>
            <p className="text-slate-400 text-sm mb-7">
              Start your Swahili journey today — it&apos;s free.
            </p>

            {/* Role selector */}
            <div className="grid grid-cols-2 gap-2 mb-7">
              {([
                { value: "student" as Role, label: "I want to learn", icon: BookOpen, sub: "Student account" },
                { value: "teacher" as Role, label: "I want to teach", icon: GraduationCap, sub: "Teacher application" },
              ]).map(({ value, label, icon: Icon, sub }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`flex flex-col items-center gap-1 py-4 px-3 rounded-2xl border-2 text-sm font-medium transition-all ${
                    role === value
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl mb-0.5 transition-colors ${
                    role === value ? "bg-indigo-100" : "bg-slate-100"
                  }`}>
                    <Icon className={`h-4.5 w-4.5 ${role === value ? "text-indigo-600" : "text-slate-400"}`} />
                  </span>
                  <span className="font-semibold text-xs sm:text-sm">{label}</span>
                  <span className={`text-[10px] sm:text-xs font-normal ${role === value ? "text-indigo-500" : "text-slate-400"}`}>{sub}</span>
                </button>
              ))}
            </div>

            {/* Form based on role */}
            {role === "student" ? (
              <StudentSignupForm
                onSuccess={setSuccessEmail}
                onGoogleClick={handleGoogleSignup}
                googleLoading={googleLoading}
              />
            ) : (
              <TeacherSignupForm onSuccess={setSuccessEmail} />
            )}

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-indigo-600 font-semibold hover:text-indigo-700">
                Sign in
              </Link>
            </p>

          </div>
        </div>
      </div>

      {/* ── Right: Decorative panel ── */}
      <DecorativePanel />

    </div>
  );
}
