"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import PageWrapper from "@/components/layout/PageWrapper";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  };

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
            <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">Reset your password</h1>
            <p className="text-slate-500 text-sm">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            {sent ? (
              <div className="text-center py-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <p className="text-slate-700 font-medium mb-1">Check your inbox</p>
                <p className="text-sm text-slate-500">
                  We&apos;ve sent a password reset link to <strong>{email}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" loading={loading} fullWidth>
                  Send reset link
                </Button>
              </form>
            )}
          </div>

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
