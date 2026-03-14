"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X, AlertTriangle } from "lucide-react";

export default function DeleteAccountButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      let body: { error?: string; success?: boolean } = {};
      try { body = await res.json(); } catch { /* non-JSON response */ }

      if (!res.ok) {
        setError(body.error || `Server error (${res.status}). Please try again.`);
        setLoading(false);
        return;
      }
      // Account deleted — redirect to homepage
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
      >
        <Trash2 className="h-4 w-4 shrink-0" />
        Delete Account
      </button>

      {/* Confirmation modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative z-10 bg-[#1a1b2e] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              disabled={loading}
              className="absolute top-4 right-4 h-7 w-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icon */}
            <div className="h-12 w-12 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>

            <h2 className="text-white font-bold text-lg mb-2">Delete your account?</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              This will permanently delete your account and all associated data.
              This action <span className="text-white font-semibold">cannot be undone</span>.
            </p>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Yes, delete my account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
