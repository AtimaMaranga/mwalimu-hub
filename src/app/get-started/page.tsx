"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowLeft, Check, Eye, EyeOff,
  MessageCircle, Briefcase, Plane, BookOpen, Globe,
  Clock, Zap, Star, Music, Users, Heart,
  BarChart2, TrendingUp, Calendar, Mail,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isPasswordStrong } from "@/app/auth/signup/page";

// ─── Quiz data ───────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "goal",
    question: "What's your main goal for learning Swahili?",
    subtitle: "We'll match you with teachers who specialise in your goal.",
    multi: false,
    options: [
      { value: "conversational", label: "Everyday conversation", desc: "Chat confidently with native speakers", icon: MessageCircle },
      { value: "business",       label: "Business & work",       desc: "Professional communication in Swahili", icon: Briefcase },
      { value: "travel",         label: "Travel & culture",      desc: "Explore East Africa with confidence", icon: Plane },
      { value: "academic",       label: "Academic study",        desc: "Exams, research, or university", icon: BookOpen },
      { value: "heritage",       label: "Heritage & roots",      desc: "Connect with your cultural background", icon: Globe },
    ],
  },
  {
    id: "timeline",
    question: "How quickly do you want to reach your goal?",
    subtitle: "This helps us suggest the right lesson frequency for you.",
    multi: false,
    options: [
      { value: "1-3m",   label: "1–3 months",       desc: "Intensive — I'm in a hurry", icon: Zap },
      { value: "3-6m",   label: "3–6 months",        desc: "Steady pace, clear progress", icon: TrendingUp },
      { value: "6-12m",  label: "6–12 months",       desc: "I'm taking my time", icon: Calendar },
      { value: "1y+",    label: "1 year or more",    desc: "Long-term learning journey", icon: Star },
      { value: "unsure", label: "Not sure yet",      desc: "I'll figure it out as I go", icon: Clock },
    ],
  },
  {
    id: "motivation",
    question: "What's driving you to learn Swahili?",
    subtitle: "Understanding your 'why' helps teachers connect with you better.",
    multi: false,
    options: [
      { value: "family",   label: "Family & heritage",         desc: "My family or partner speaks Swahili", icon: Heart },
      { value: "travel",   label: "Travelling to East Africa", desc: "Planning a trip to Kenya, Tanzania…", icon: Plane },
      { value: "work",     label: "Work or business",          desc: "My job involves East Africa", icon: Briefcase },
      { value: "love",     label: "Love for languages",        desc: "I simply enjoy learning languages", icon: Music },
      { value: "academic", label: "Academic requirement",      desc: "University, research or exams", icon: BookOpen },
    ],
  },
  {
    id: "level",
    question: "What's your current Swahili level?",
    subtitle: "Be honest — we match you with teachers suited to where you are now.",
    multi: false,
    options: [
      { value: "beginner",     label: "Complete beginner", desc: "I know little to no Swahili", icon: BarChart2 },
      { value: "elementary",   label: "Elementary",        desc: "I know a few words and phrases", icon: BarChart2 },
      { value: "intermediate", label: "Intermediate",      desc: "I can hold basic conversations", icon: BarChart2 },
      { value: "advanced",     label: "Advanced",          desc: "I'm fluent but want to refine", icon: BarChart2 },
    ],
  },
  {
    id: "style",
    question: "How do you learn best?",
    subtitle: "We'll suggest teachers who match your preferred teaching style.",
    multi: false,
    options: [
      { value: "structured",     label: "Structured lessons",     desc: "Grammar rules, exercises, textbooks", icon: BookOpen },
      { value: "conversational", label: "Conversational practice", desc: "Speaking and listening focused", icon: MessageCircle },
      { value: "mixed",          label: "Mix of both",            desc: "Structure when needed, conversation-led", icon: Users },
      { value: "cultural",       label: "Culture-immersed",       desc: "Language through stories, music, film", icon: Music },
    ],
  },
  {
    id: "hours",
    question: "How many hours per week can you study?",
    subtitle: "Even 1 hour a week makes a difference — consistency is key.",
    multi: false,
    options: [
      { value: "1-2",  label: "1–2 hrs / week",  desc: "Casual learner", icon: Clock },
      { value: "3-5",  label: "3–5 hrs / week",  desc: "Committed learner", icon: Clock },
      { value: "5-10", label: "5–10 hrs / week", desc: "Intensive learner", icon: Clock },
      { value: "10+",  label: "10+ hrs / week",  desc: "Full immersion", icon: Clock },
    ],
  },
];

type Answers = Record<string, string>;

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">
          Step {current} of {total}
        </span>
        <span className="text-xs text-indigo-300">{Math.round((current / total) * 100)}% complete</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function QuizStep({
  step, selected, onSelect, onNext, onBack, stepIndex, totalSteps,
}: {
  step: typeof STEPS[0];
  selected: string;
  onSelect: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}) {
  // Level step — show varying bar heights
  const levelHeights: Record<string, string> = {
    beginner: "h-2", elementary: "h-4", intermediate: "h-6", advanced: "h-8",
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-2 leading-snug">
        {step.question}
      </h2>
      <p className="text-indigo-200 text-sm mb-8">{step.subtitle}</p>

      <div className={`grid gap-3 ${step.options.length <= 4 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
        {step.options.map(({ value, label, desc, icon: Icon }) => {
          const isSelected = selected === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => { onSelect(value); }}
              className={`group flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? "border-white bg-white/20 backdrop-blur-sm shadow-lg shadow-black/10"
                  : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isSelected ? "bg-white text-indigo-600" : "bg-white/10 text-white/70"
              }`}>
                {step.id === "level" ? (
                  <div className="flex items-end gap-0.5 h-5">
                    {["h-2","h-3","h-4","h-5"].slice(0,
                      value === "beginner" ? 1 : value === "elementary" ? 2 : value === "intermediate" ? 3 : 4
                    ).map((h, i) => (
                      <div key={i} className={`w-1.5 ${h} rounded-sm ${isSelected ? "bg-indigo-600" : "bg-white/60"}`} />
                    ))}
                    {Array.from({ length: 4 - (value === "beginner" ? 1 : value === "elementary" ? 2 : value === "intermediate" ? 3 : 4) }).map((_, i) => (
                      <div key={i} className={`w-1.5 h-5 rounded-sm opacity-20 ${isSelected ? "bg-indigo-300" : "bg-white/20"}`} />
                    ))}
                  </div>
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold leading-snug ${isSelected ? "text-white" : "text-white/90"}`}>{label}</p>
                <p className={`text-xs mt-0.5 leading-relaxed ${isSelected ? "text-indigo-100" : "text-white/50"}`}>{desc}</p>
              </div>
              {isSelected && (
                <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-indigo-600" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-8">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-white/20 text-white/80 text-sm font-semibold hover:border-white/40 hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={!selected}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-indigo-700 text-sm font-bold hover:bg-indigo-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-black/10"
        >
          {stepIndex === totalSteps - 1 ? "See my teacher matches" : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Signup form (shown after quiz) ─────────────────────────────────────────

function PasswordInput({ value, onChange, placeholder, autoComplete }: {
  value: string; onChange: (v: string) => void; placeholder?: string; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Min. 8 characters"}
        autoComplete={autoComplete ?? "new-password"}
        className="w-full px-4 py-3 pr-11 border-2 border-white/20 rounded-xl text-sm bg-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-all"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
        aria-label={show ? "Hide" : "Show"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function PasswordRules({ password }: { password: string }) {
  if (!password) return null;
  const rules = [
    { label: "At least 8 characters",        ok: password.length >= 8 },
    { label: "One uppercase letter (A–Z)",    ok: /[A-Z]/.test(password) },
    { label: "One lowercase letter (a–z)",    ok: /[a-z]/.test(password) },
    { label: "One number (0–9)",              ok: /[0-9]/.test(password) },
    { label: "One special character (!@#…)",  ok: /[^A-Za-z0-9]/.test(password) },
  ];
  return (
    <div className="grid grid-cols-1 gap-1 mt-2">
      {rules.map((r) => (
        <div key={r.label} className="flex items-center gap-2">
          <div className={`h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${r.ok ? "bg-emerald-400" : "bg-white/20"}`}>
            {r.ok && <Check className="h-2 w-2 text-white" />}
          </div>
          <span className={`text-xs ${r.ok ? "text-emerald-300" : "text-white/40"}`}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}

function SignupForm({ answers, onSuccess }: { answers: Answers; onSuccess: (email: string) => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isPasswordStrong(password)) { setError("Please meet all password requirements."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "student",
          full_name: fullName,
          onboarding_goal: answers.goal,
          onboarding_level: answers.level,
          onboarding_style: answers.style,
          onboarding_timeline: answers.timeline,
          onboarding_hours: answers.hours,
          onboarding_motivation: answers.motivation,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/teachers&welcome=1`,
      },
    });
    if (err) { setError(err.message); setLoading(false); }
    else { onSuccess(email); }
  };

  // Summary of answers to show user
  const summaryItems = [
    { label: "Goal", value: STEPS[0].options.find(o => o.value === answers.goal)?.label },
    { label: "Level", value: STEPS[3].options.find(o => o.value === answers.level)?.label },
    { label: "Style", value: STEPS[4].options.find(o => o.value === answers.style)?.label },
  ].filter(i => i.value);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-2">
        Almost there! Create your free account
      </h2>
      <p className="text-indigo-200 text-sm mb-6">
        We&apos;ve built your learner profile. Sign up to see your personalised teacher matches.
      </p>

      {/* Profile summary */}
      <div className="flex flex-wrap gap-2 mb-6">
        {summaryItems.map(({ label, value }) => (
          <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs text-white font-medium">
            <Check className="h-3 w-3 text-emerald-400" />
            {label}: <span className="text-indigo-200">{value}</span>
          </span>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-200 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-indigo-200 mb-1.5 uppercase tracking-wide">Full name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              placeholder="e.g. Amina Odhiambo"
              className="w-full px-4 py-3 border-2 border-white/20 rounded-xl text-sm bg-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-indigo-200 mb-1.5 uppercase tracking-wide">Email address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 border-2 border-white/20 rounded-xl text-sm bg-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-indigo-200 mb-1.5 uppercase tracking-wide">Password *</label>
          <PasswordInput value={password} onChange={setPassword} />
          <PasswordRules password={password} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-indigo-200 mb-1.5 uppercase tracking-wide">Confirm password *</label>
          <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat your password" />
          {confirmPassword && (
            <p className={`text-xs mt-1.5 font-medium ${password === confirmPassword ? "text-emerald-300" : "text-red-300"}`}>
              {password === confirmPassword ? "✓ Passwords match" : "Passwords don't match"}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-indigo-700 text-sm font-bold hover:bg-indigo-50 transition-all disabled:opacity-60 shadow-lg shadow-black/10 mt-2"
        >
          {loading ? (
            <><div className="h-4 w-4 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" /> Creating account…</>
          ) : (
            <>View my teacher matches <ArrowRight className="h-4 w-4" /></>
          )}
        </button>

        <p className="text-xs text-white/40 text-center leading-relaxed">
          By signing up you agree to our{" "}
          <Link href="/terms" className="text-indigo-300 hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-indigo-300 hover:underline">Privacy Policy</Link>.
          Already have an account?{" "}
          <Link href="/auth/login" className="text-indigo-300 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

// ─── Success screen ──────────────────────────────────────────────────────────

function SuccessScreen({ email }: { email: string }) {
  return (
    <div className="animate-in fade-in duration-300 text-center">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 border border-white/20 mb-6">
        <Mail className="h-9 w-9 text-white" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-3">
        Check your inbox!
      </h2>
      <p className="text-indigo-200 text-sm mb-2">We&apos;ve sent a confirmation link to</p>
      <p className="text-white font-bold text-base mb-6">{email}</p>
      <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-left mb-6">
        <p className="text-white text-xs font-semibold mb-1">Your learner profile is ready</p>
        <p className="text-indigo-200 text-xs leading-relaxed">
          Once you confirm your email, you&apos;ll be taken straight to your personalised list of matching teachers.
        </p>
      </div>
      <p className="text-white/40 text-xs">
        Check your spam folder if you don&apos;t see it within a minute.
      </p>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function GetStartedPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showSignup, setShowSignup] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");

  // Persist answers in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("st_onboarding");
    if (saved) {
      try { setAnswers(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem("st_onboarding", JSON.stringify(answers));
    }
  }, [answers]);

  const currentStep = STEPS[stepIndex];
  const currentAnswer = answers[currentStep?.id] ?? "";

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentStep.id]: value }));
  };

  const handleNext = () => {
    if (!currentAnswer) return;
    if (stepIndex === STEPS.length - 1) {
      setShowSignup(true);
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    if (showSignup) { setShowSignup(false); return; }
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const handleSuccess = (email: string) => {
    localStorage.removeItem("st_onboarding");
    setSuccessEmail(email);
  };

  const totalSteps = STEPS.length + 1; // +1 for signup step

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 flex flex-col">

      {/* Decorative background rings */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full border border-white/5" />
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full border border-white/5" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full border border-white/3" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 border border-white/20 text-white font-bold text-xs font-heading italic">
            ST
          </span>
          <span className="text-white font-bold text-sm tracking-tight hidden sm:block">Swahili Tutors</span>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-white/50 hidden sm:block">Already have an account?</span>
          <Link
            href="/auth/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
        <div className="w-full max-w-2xl">

          {successEmail ? (
            <SuccessScreen email={successEmail} />
          ) : (
            <>
              {/* Progress */}
              {!successEmail && (
                <div className="mb-8">
                  <ProgressBar
                    current={showSignup ? totalSteps : stepIndex + 1}
                    total={totalSteps}
                  />
                </div>
              )}

              {showSignup ? (
                <>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-6 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to questions
                  </button>
                  <SignupForm answers={answers} onSuccess={handleSuccess} />
                </>
              ) : (
                <QuizStep
                  step={currentStep}
                  selected={currentAnswer}
                  onSelect={handleSelect}
                  onNext={handleNext}
                  onBack={handleBack}
                  stepIndex={stepIndex}
                  totalSteps={STEPS.length}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer note */}
      {!successEmail && (
        <footer className="relative z-10 text-center pb-6 px-6">
          <p className="text-white/30 text-xs">
            Free to join · No credit card required · Cancel anytime
          </p>
        </footer>
      )}
    </div>
  );
}
