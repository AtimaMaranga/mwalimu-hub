"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Lock, Bell, Trash2, CheckCircle, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import DeleteAccountButton from "@/components/dashboard/DeleteAccountButton";

interface Props {
  userId: string;
  userEmail: string;
  fullName: string;
  role: "student" | "teacher";
}

function Section({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="h-4 w-4 text-slate-400" />
        </div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function SettingsClient({ userId, userEmail, fullName, role }: Props) {
  // Account section state
  const [name, setName] = useState(fullName);
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  // Password section state
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Notification prefs (UI only — stored client-side in localStorage)
  const [notifInquiries, setNotifInquiries] = useState(true);
  const [notifUpdates, setNotifUpdates] = useState(true);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setNameError("");
    setSavingName(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name.trim() })
      .eq("id", userId);

    if (error) {
      setNameError(error.message);
    } else {
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    }
    setSavingName(false);
  };

  const handlePasswordReset = async () => {
    setSendingReset(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setResetSent(true);
    setSendingReset(false);
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? "bg-cyan-500" : "bg-white/10"
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-[18px]" : "translate-x-[3px]"
      }`} />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account preferences.</p>
      </div>

      {/* Account */}
      <Section title="Account" icon={User}>
        <form onSubmit={handleSaveName} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl">
              <Mail className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="text-sm text-slate-400">{userEmail}</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Email changes are managed through Supabase Auth.</p>
          </div>

          {nameError && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {nameError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm" loading={savingName}>
              Save changes
            </Button>
            {nameSuccess && (
              <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                <CheckCircle className="h-4 w-4" /> Saved
              </span>
            )}
          </div>
        </form>
      </Section>

      {/* Security */}
      <Section title="Security" icon={Lock}>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-300 mb-1">Password</p>
            <p className="text-xs text-slate-500 mb-3">
              We&apos;ll send a password reset link to <span className="text-slate-400">{userEmail}</span>.
            </p>
            {resetSent ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle className="h-4 w-4" />
                Reset link sent — check your inbox.
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                loading={sendingReset}
                onClick={handlePasswordReset}
              >
                Send password reset email
              </Button>
            )}
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <div className="space-y-4">
          {[
            {
              label: role === "teacher" ? "New student inquiries" : "Teacher replies",
              desc: "Email me when someone contacts me",
              checked: notifInquiries,
              onChange: setNotifInquiries,
            },
            {
              label: "Platform updates",
              desc: "Occasional product news and announcements",
              checked: notifUpdates,
              onChange: setNotifUpdates,
            },
          ].map(({ label, desc, checked, onChange }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-300">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              <Toggle checked={checked} onChange={onChange} />
            </div>
          ))}
        </div>
      </Section>

      {/* Danger zone */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-red-500/10">
          <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Trash2 className="h-4 w-4 text-red-400" />
          </div>
          <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-400 mb-4">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}
