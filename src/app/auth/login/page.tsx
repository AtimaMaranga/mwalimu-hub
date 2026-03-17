"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import PageWrapper from "@/components/layout/PageWrapper";

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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : error.message
      );
      setLoading(false);
    } else {
      router.push(next);
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
      >
        <GoogleIcon />
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          fullWidth
          className="mt-2"
        >
          Sign in
        </Button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <PageWrapper>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 justify-center mb-6">
              <img src="/logo.png" alt="Swahili Tutors" className="h-10 w-10 rounded-xl object-cover" />
              <span className="font-heading font-bold text-slate-900 text-lg">Swahili Tutors</span>
            </Link>
            <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
          </div>

          <Suspense fallback={<div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm h-64 animate-pulse" />}>
            <LoginForm />
          </Suspense>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-indigo-600 font-semibold hover:text-indigo-700">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
