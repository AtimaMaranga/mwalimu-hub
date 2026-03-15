"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import PageWrapper from "@/components/layout/PageWrapper";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Session readiness states
  const [initializing, setInitializing] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  const establishSession = useCallback(async () => {
    const supabase = createClient();

    // Listen for PASSWORD_RECOVERY event (fired by Supabase after token exchange)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
        setInitializing(false);
      }
    });

    try {
      // 1. Try PKCE flow: code in query params
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          setSessionReady(true);
          setInitializing(false);
          return;
        }
      }

      // 2. Try implicit flow: tokens in hash fragment
      if (typeof window !== "undefined" && window.location.hash) {
        const params = new URLSearchParams(window.location.hash.replace("#", ""));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error) {
            setSessionReady(true);
            setInitializing(false);
            return;
          }
        }
      }

      // 3. Check if there's already an active session (e.g. user arrived via callback redirect)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setSessionReady(true);
        setInitializing(false);
        return;
      }

      // No session could be established — wait briefly for the auth state change event
      // (Supabase may still be processing the token exchange)
      setTimeout(() => {
        setInitializing(false);
      }, 3000);
    } catch {
      setInitializing(false);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

  useEffect(() => {
    establishSession();
  }, [establishSession]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      if (error.message.includes("session") || error.message.includes("token")) {
        setError("Your reset link has expired. Please request a new one.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const role = user?.user_metadata?.role;
        router.push(role === "teacher" ? "/dashboard/teacher" : role === "student" ? "/dashboard/student" : "/");
        router.refresh();
      }, 2000);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      {/* Loading — establishing session */}
      {initializing && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 mx-auto mb-3 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-500">Verifying your reset link&hellip;</p>
        </div>
      )}

      {/* Expired / invalid link */}
      {!initializing && !sessionReady && !success && (
        <div className="text-center py-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mb-4">
            <span className="text-2xl">&#9203;</span>
          </div>
          <p className="text-slate-700 font-medium mb-1">Link expired or invalid</p>
          <p className="text-sm text-slate-500 mb-4">
            This password reset link has expired or has already been used.
          </p>
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Request a new link
          </Link>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="text-center py-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 mb-4">
            <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="text-slate-700 font-medium mb-1">Password updated!</p>
          <p className="text-sm text-slate-500">
            Redirecting you to your dashboard&hellip;
          </p>
        </div>
      )}

      {/* Password form — only when session is ready */}
      {!initializing && sessionReady && !success && (
        <form onSubmit={handleReset} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              New password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Re-enter your password"
            />
          </div>
          <Button type="submit" variant="primary" size="lg" loading={loading} fullWidth>
            Update password
          </Button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <PageWrapper>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 justify-center mb-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-sm">
                <span className="text-white font-bold text-sm font-heading italic">ST</span>
              </span>
              <span className="font-heading font-bold text-slate-900 text-lg">Swahili Tutors</span>
            </Link>
            <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">Set new password</h1>
            <p className="text-slate-500 text-sm">Choose a strong password for your account.</p>
          </div>

          <Suspense fallback={
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 mx-auto mb-3 text-indigo-500 animate-spin" />
                <p className="text-sm text-slate-500">Loading&hellip;</p>
              </div>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>

          <p className="text-center text-sm text-slate-500 mt-6">
            <Link href="/auth/login" className="text-indigo-600 font-semibold hover:text-indigo-700">
              ← Back to login
            </Link>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
