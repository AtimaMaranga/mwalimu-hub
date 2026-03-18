"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_HOURLY_RATE } from "@/lib/pricing";
import {
  User, Lock, Bell, Shield, Banknote, Camera,
  Eye, EyeOff, Loader2, CheckCircle, X, Upload,
  Smartphone, Building2, FileText, GraduationCap, CreditCard as IdCard, Video,
  Plus, ChevronDown,
} from "lucide-react";

/* ──────────────────────────── Types ──────────────────────────── */
interface Props {
  userId: string;
  userEmail: string;
  role: "student" | "teacher";
  profile: Record<string, unknown> | null;
  teacher: Record<string, unknown> | null;
  hasPassword: boolean;
  authProvider: string;
}

type Tab = "profile" | "password" | "notifications" | "verification" | "payout";

const SPECIALIZATION_OPTIONS = [
  "Conversational", "Business", "Exam Prep", "Kids & Young Learners",
  "Travel", "Grammar", "Beginners", "Advanced", "Literature", "Culture",
];

const PROFICIENCY_LEVELS = ["Native", "Fluent", "Intermediate", "Beginner"];

/* ──────────────────────────── Toast ──────────────────────────── */
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
      type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
    }`}>
      {type === "success" ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
      {message}
    </div>
  );
}

/* ──────────────────────────── Toggle ──────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
        checked ? "bg-teal-600" : "bg-slate-300"
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`} />
    </button>
  );
}

/* ──────────────────────────── Main ──────────────────────────── */
export default function SettingsClient({
  userId, userEmail, role, profile, teacher, hasPassword, authProvider,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const tabs: { id: Tab; label: string; icon: typeof User; teacherOnly?: boolean }[] = [
    { id: "profile", label: "Profile Settings", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "verification", label: "Verification", icon: Shield, teacherOnly: true },
    { id: "payout", label: "Payout Settings", icon: Banknote, teacherOnly: true },
  ];

  const visibleTabs = tabs.filter(t => !t.teacherOnly || role === "teacher");

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your profile, security, and preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* Sub-navigation — horizontal on mobile, vertical on desktop */}
          <nav className="md:w-[220px] md:border-r border-b md:border-b-0 border-slate-200 shrink-0">
            <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible">
              {visibleTabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === id
                      ? "text-teal-600 bg-teal-50 md:border-l-[3px] md:border-teal-600 border-b-2 md:border-b-0 border-teal-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden md:inline">{label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Form area */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto">
            <div className="max-w-[720px]">
              {activeTab === "profile" && (
                <ProfileTab
                  userId={userId}
                  userEmail={userEmail}
                  role={role}
                  profile={profile}
                  teacher={teacher}
                  onToast={setToast}
                />
              )}
              {activeTab === "password" && (
                <PasswordTab
                  hasPassword={hasPassword}
                  authProvider={authProvider}
                  onToast={setToast}
                />
              )}
              {activeTab === "notifications" && (
                <NotificationsTab
                  role={role}
                  initialPrefs={(profile?.notification_preferences as Record<string, boolean>) || {}}
                  onToast={setToast}
                />
              )}
              {activeTab === "verification" && role === "teacher" && (
                <VerificationTab
                  userId={userId}
                  teacher={teacher}
                  onToast={setToast}
                />
              )}
              {activeTab === "payout" && role === "teacher" && (
                <PayoutTab
                  teacher={teacher}
                  onToast={setToast}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 1: PROFILE
   ═══════════════════════════════════════════════════════════════ */
function ProfileTab({
  userId, userEmail, role, profile, teacher, onToast,
}: {
  userId: string;
  userEmail: string;
  role: "student" | "teacher";
  profile: Record<string, unknown> | null;
  teacher: Record<string, unknown> | null;
  onToast: (t: { message: string; type: "success" | "error" }) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const initial = useMemo(() => ({
    first_name: (profile?.first_name as string) || (profile?.full_name as string || "").split(" ")[0] || "",
    last_name: (profile?.last_name as string) || (profile?.full_name as string || "").split(" ").slice(1).join(" ") || "",
    phone: (profile?.phone as string) || (teacher?.phone as string) || "",
    gender: (profile?.gender as string) || (teacher?.gender as string) || "",
    date_of_birth: (profile?.date_of_birth as string) || (teacher?.date_of_birth as string) || "",
    country: (profile?.country as string) || (teacher?.country as string) || "Kenya",
    timezone: (profile?.timezone as string) || (teacher?.timezone as string) || "Africa/Nairobi",
    bio: (profile?.bio as string) || (teacher?.bio as string) || "",
    avatar_url: (profile?.avatar_url as string) || (teacher?.profile_image_url as string) || "",
    // Teacher-only
    tagline: (teacher?.tagline as string) || "",
    experience_years: (teacher?.experience_years as number) || 0,
    hourly_rate: (teacher?.hourly_rate as number) || DEFAULT_HOURLY_RATE,
    specializations: (teacher?.specializations as string[]) || [],
    languages_spoken: (teacher?.languages_spoken as { language: string; level: string }[]) || [],
  }), [profile, teacher]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);

  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      onToast({ message: "Image must be under 5MB", type: "error" });
      return;
    }
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/avatar.${ext}`;

    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      onToast({ message: "Upload failed: " + error.message, type: "error" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    // Add cache buster
    const url = `${publicUrl}?t=${Date.now()}`;

    // Save immediately
    await fetch("/api/settings/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar_url: url }),
    });

    set("avatar_url", url);
    setUploading(false);
    onToast({ message: "Profile photo updated", type: "success" });
  };

  const handleDeleteAvatar = async () => {
    await fetch("/api/settings/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar_url: null }),
    });
    set("avatar_url", "");
    onToast({ message: "Photo removed", type: "success" });
  };

  const handleSave = async () => {
    if (!form.first_name.trim()) {
      onToast({ message: "First name is required", type: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onToast({ message: "Profile updated successfully", type: "success" });
    } catch (err: unknown) {
      onToast({ message: err instanceof Error ? err.message : "Save failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const initials = [form.first_name, form.last_name].filter(Boolean).map(n => n[0]?.toUpperCase()).join("") || "?";

  // Specialization management
  const [specOpen, setSpecOpen] = useState(false);
  const availableSpecs = SPECIALIZATION_OPTIONS.filter(s => !form.specializations.includes(s));

  // Language management
  const [langForm, setLangForm] = useState({ language: "", level: "Fluent" });
  const [langOpen, setLangOpen] = useState(false);

  const addLanguage = () => {
    if (!langForm.language.trim()) return;
    set("languages_spoken", [...form.languages_spoken, { language: langForm.language, level: langForm.level }]);
    setLangForm({ language: "", level: "Fluent" });
    setLangOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="h-[120px] w-[120px] rounded-full border-2 border-slate-200 overflow-hidden bg-teal-50 flex items-center justify-center shrink-0">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-teal-700">{initials}</span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-md hover:bg-teal-700 transition-colors"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-6 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            Upload New
          </button>
          {form.avatar_url && (
            <button
              onClick={handleDeleteAvatar}
              className="px-6 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Delete avatar
            </button>
          )}
        </div>
      </div>

      {/* Row 1: Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="First Name" required>
          <input
            type="text"
            value={form.first_name}
            onChange={e => set("first_name", e.target.value)}
            className="input-field"
            placeholder="John"
          />
        </Field>
        <Field label="Last Name">
          <input
            type="text"
            value={form.last_name}
            onChange={e => set("last_name", e.target.value)}
            className="input-field"
            placeholder="Doe"
          />
        </Field>
      </div>

      {/* Row 2: Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="Email">
          <input
            type="email"
            value={userEmail}
            readOnly
            className="input-field bg-slate-50 text-slate-500 cursor-not-allowed"
          />
          <p className="text-xs text-slate-400 mt-1">Contact support to change email</p>
        </Field>
        <Field label="Mobile Number" required>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3 py-3 border border-slate-300 rounded-lg bg-slate-50 text-sm text-slate-600 shrink-0">
              <span>+254</span>
            </div>
            <input
              type="tel"
              value={form.phone.replace(/^\+254/, "")}
              onChange={e => set("phone", "+254" + e.target.value.replace(/\D/g, ""))}
              className="input-field flex-1"
              placeholder="712345678"
            />
          </div>
        </Field>
      </div>

      {/* Row 3: Gender + DOB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="Gender">
          <div className="flex gap-2">
            {(["male", "female", "other"] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => set("gender", g)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-all capitalize ${
                  form.gender === g
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Date of Birth">
          <input
            type="date"
            value={form.date_of_birth}
            onChange={e => set("date_of_birth", e.target.value)}
            className="input-field"
          />
        </Field>
      </div>

      {/* Row 4: Country + Timezone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="Country">
          <select
            value={form.country}
            onChange={e => set("country", e.target.value)}
            className="input-field"
          >
            <option value="Kenya">Kenya</option>
            <option value="Tanzania">Tanzania</option>
            <option value="Uganda">Uganda</option>
            <option value="Rwanda">Rwanda</option>
            <option value="DRC">DR Congo</option>
            <option value="Burundi">Burundi</option>
            <option value="South Africa">South Africa</option>
            <option value="Nigeria">Nigeria</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Other">Other</option>
          </select>
        </Field>
        <Field label="Timezone">
          <select
            value={form.timezone}
            onChange={e => set("timezone", e.target.value)}
            className="input-field"
          >
            <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
            <option value="Africa/Dar_es_Salaam">Africa/Dar es Salaam (EAT)</option>
            <option value="Africa/Kampala">Africa/Kampala (EAT)</option>
            <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
            <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="Europe/Berlin">Europe/Berlin (CET)</option>
            <option value="America/New_York">America/New York (EST)</option>
            <option value="America/Chicago">America/Chicago (CST)</option>
            <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
          </select>
        </Field>
      </div>

      {/* Row 5: Bio */}
      <Field label="Bio / About Me">
        <textarea
          value={form.bio}
          onChange={e => { if (e.target.value.length <= 500) set("bio", e.target.value); }}
          rows={4}
          className="input-field resize-none"
          placeholder={role === "teacher"
            ? "Describe your teaching experience and style..."
            : "Tell tutors about your learning goals..."
          }
        />
        <p className="text-xs text-slate-400 text-right mt-1">{form.bio.length}/500</p>
      </Field>

      {/* Teacher-only fields */}
      {role === "teacher" && (
        <>
          <hr className="border-slate-200" />
          <p className="text-sm font-semibold text-slate-800">Teaching Details</p>

          {/* Experience + Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Years of Experience" required>
              <input
                type="number"
                min={0}
                value={form.experience_years || ""}
                onChange={e => set("experience_years", Number(e.target.value))}
                className="input-field"
                placeholder="5"
              />
            </Field>
            <Field label="Hourly Rate (USD)">
              <p className="text-sm text-slate-600 py-2.5 px-4 bg-slate-50 rounded-xl border border-slate-200">
                ${form.hourly_rate}/hr — Manage your rate from the <a href="/dashboard/teacher" className="text-indigo-600 underline">teacher dashboard</a>
              </p>
            </Field>
          </div>

          {/* Specializations */}
          <Field label="Specializations">
            <div className="flex flex-wrap gap-2 mb-2">
              {form.specializations.map(s => (
                <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 text-sm font-medium rounded-full">
                  {s}
                  <button onClick={() => set("specializations", form.specializations.filter(x => x !== s))} className="hover:text-teal-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSpecOpen(!specOpen)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-dashed border-slate-300 text-slate-500 text-sm rounded-full hover:border-teal-500 hover:text-teal-600 transition-colors"
                >
                  <Plus className="h-3 w-3" /> Add more
                </button>
                {specOpen && availableSpecs.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 w-48 max-h-48 overflow-y-auto">
                    {availableSpecs.map(s => (
                      <button
                        key={s}
                        onClick={() => { set("specializations", [...form.specializations, s]); setSpecOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Field>

          {/* Languages */}
          <Field label="Languages Spoken">
            <div className="flex flex-wrap gap-2 mb-2">
              {form.languages_spoken.map((l, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full">
                  {l.language} ({l.level})
                  <button onClick={() => set("languages_spoken", form.languages_spoken.filter((_, j) => j !== i))} className="hover:text-indigo-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-dashed border-slate-300 text-slate-500 text-sm rounded-full hover:border-teal-500 hover:text-teal-600 transition-colors"
              >
                <Plus className="h-3 w-3" /> Add language
              </button>
            </div>
            {langOpen && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={langForm.language}
                  onChange={e => setLangForm(p => ({ ...p, language: e.target.value }))}
                  className="input-field flex-1"
                  placeholder="e.g., Swahili"
                />
                <select
                  value={langForm.level}
                  onChange={e => setLangForm(p => ({ ...p, level: e.target.value }))}
                  className="input-field w-36"
                >
                  {PROFICIENCY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <button onClick={addLanguage} className="px-4 py-3 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700">
                  Add
                </button>
              </div>
            )}
          </Field>

          {/* Tagline */}
          <Field label="Teaching Headline / Tagline">
            <input
              type="text"
              value={form.tagline}
              onChange={e => { if (e.target.value.length <= 150) set("tagline", e.target.value); }}
              className="input-field"
              placeholder="e.g., Certified Swahili Tutor | 5 Years Experience | Business & Travel Swahili"
            />
            <p className="text-xs text-slate-400 text-right mt-1">{form.tagline.length}/150</p>
          </Field>
        </>
      )}

      {/* Save */}
      <div className="flex items-center gap-4 pt-4">
        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Changes
        </button>
        {isDirty && (
          <button
            onClick={() => setForm(initial)}
            className="text-sm text-slate-600 hover:text-slate-800 font-medium"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Global input styles via class */}
      <style>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #1e293b;
          background: white;
          transition: all 0.15s;
        }
        .input-field:focus {
          outline: none;
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }
        .input-field::placeholder { color: #94a3b8; }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 2: PASSWORD
   ═══════════════════════════════════════════════════════════════ */
function PasswordTab({
  hasPassword, authProvider, onToast,
}: {
  hasPassword: boolean;
  authProvider: string;
  onToast: (t: { message: string; type: "success" | "error" }) => void;
}) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const isSocial = authProvider === "google" && !hasPassword;

  // Strength calculation
  const strength = useMemo(() => {
    let score = 0;
    if (newPw.length >= 8) score++;
    if (/[A-Z]/.test(newPw)) score++;
    if (/[a-z]/.test(newPw)) score++;
    if (/[0-9]/.test(newPw)) score++;
    if (/[^A-Za-z0-9]/.test(newPw)) score++;
    return score;
  }, [newPw]);

  const strengthLabel = strength <= 1 ? "Weak" : strength <= 3 ? "Medium" : "Strong";
  const strengthColor = strength <= 1 ? "bg-red-500" : strength <= 3 ? "bg-amber-500" : "bg-emerald-500";

  const handleSave = async () => {
    if (newPw.length < 8) {
      onToast({ message: "Password must be at least 8 characters", type: "error" });
      return;
    }
    if (newPw !== confirmPw) {
      onToast({ message: "Passwords do not match", type: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newPw, currentPassword: currentPw || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onToast({ message: "Password updated successfully", type: "success" });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err: unknown) {
      onToast({ message: err instanceof Error ? err.message : "Failed to update password", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
        {isSocial && (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mt-3">
            You signed in with Google. You can set a password below to also enable email/password login.
          </p>
        )}
      </div>

      {!isSocial && (
        <Field label="Current Password" required>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              className="input-field pr-10"
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
      )}

      <Field label="New Password" required>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            className="input-field pr-10"
          />
          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {newPw && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full ${strengthColor} transition-all`} style={{ width: `${(strength / 5) * 100}%` }} />
              </div>
              <span className={`text-xs font-medium ${strength <= 1 ? "text-red-600" : strength <= 3 ? "text-amber-600" : "text-emerald-600"}`}>
                {strengthLabel}
              </span>
            </div>
          </div>
        )}
      </Field>

      <Field label="Confirm New Password" required>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            className="input-field pr-10"
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {confirmPw && newPw !== confirmPw && (
          <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
        )}
      </Field>

      <button
        onClick={handleSave}
        disabled={saving || !newPw || newPw !== confirmPw}
        className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Update Password
      </button>

      <style>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #1e293b;
          background: white;
          transition: all 0.15s;
        }
        .input-field:focus {
          outline: none;
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 3: NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════ */
function NotificationsTab({
  role, initialPrefs, onToast,
}: {
  role: "student" | "teacher";
  initialPrefs: Record<string, boolean>;
  onToast: (t: { message: string; type: "success" | "error" }) => void;
}) {
  const defaults = {
    lesson_reminders: true,
    new_messages: true,
    payment_receipts: true,
    payout_notifications: true,
    marketing: false,
  };
  const [prefs, setPrefs] = useState({ ...defaults, ...initialPrefs });
  const [saving, setSaving] = useState(false);

  const toggle = (key: string) => setPrefs(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));

  const items = [
    { key: "lesson_reminders", label: "Lesson reminders", desc: "30 minutes before each lesson" },
    { key: "new_messages", label: "New messages", desc: "When a student or teacher sends you a message" },
    { key: "payment_receipts", label: "Payment receipts", desc: "After wallet top-ups and lesson charges" },
    ...(role === "teacher" ? [{ key: "payout_notifications", label: "Payout notifications", desc: "When your earnings are processed" }] : []),
    { key: "marketing", label: "Marketing & updates", desc: "Platform news, tips, and promotions" },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (!res.ok) throw new Error("Failed to save");
      onToast({ message: "Notification preferences saved", type: "success" });
    } catch {
      onToast({ message: "Failed to save preferences", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
        <p className="text-sm text-slate-500 mt-1">Choose what notifications you receive via email.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-sm font-medium text-slate-800">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </div>
            <Toggle
              checked={prefs[key as keyof typeof prefs] ?? false}
              onChange={() => toggle(key)}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-2"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save Preferences
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 4: VERIFICATION (Teachers Only)
   ═══════════════════════════════════════════════════════════════ */
function VerificationTab({
  userId, teacher, onToast,
}: {
  userId: string;
  teacher: Record<string, unknown> | null;
  onToast: (t: { message: string; type: "success" | "error" }) => void;
}) {
  const verStatus = (teacher?.verification_status as Record<string, string>) || {};
  const [statuses, setStatuses] = useState(verStatus);
  const [uploading, setUploading] = useState<string | null>(null);

  const docs = [
    { key: "certificate", label: "Teaching Certificate", desc: "Upload your TEFL, TESOL, or teaching degree", icon: FileText, accept: ".pdf,.jpg,.jpeg,.png" },
    { key: "education", label: "Education / Degree", desc: "Upload proof of your highest education qualification", icon: GraduationCap, accept: ".pdf,.jpg,.jpeg,.png" },
    { key: "government_id", label: "Government ID", desc: "National ID, passport, or driver's license", icon: IdCard, accept: ".pdf,.jpg,.jpeg,.png" },
    { key: "intro_video", label: "Intro Video", desc: "Record or upload a short introduction video (1-3 min)", icon: Video, accept: ".mp4,.webm" },
  ];

  const statusBadge = (status: string) => {
    if (status === "verified") return <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full"><CheckCircle className="h-3 w-3" /> Verified</span>;
    if (status === "pending") return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full"><Loader2 className="h-3 w-3" /> Pending review</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">Not uploaded</span>;
  };

  const handleUpload = async (docType: string, accept: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const maxSize = docType === "intro_video" ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        onToast({ message: `File too large (max ${docType === "intro_video" ? "100MB" : "10MB"})`, type: "error" });
        return;
      }

      setUploading(docType);
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const path = `${userId}/${docType}.${ext}`;

      const { error } = await supabase.storage.from("teacher-verification").upload(path, file, { upsert: true });
      if (error) {
        onToast({ message: "Upload failed: " + error.message, type: "error" });
        setUploading(null);
        return;
      }

      // Get URL and update verification status
      const { data: { publicUrl } } = supabase.storage.from("teacher-verification").getPublicUrl(path);

      const res = await fetch("/api/settings/verification", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_type: docType, file_url: publicUrl }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatuses(data.status);
        onToast({ message: "Document uploaded — pending review", type: "success" });
      } else {
        onToast({ message: data.error || "Upload failed", type: "error" });
      }
      setUploading(null);
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Teacher Verification</h2>
        <p className="text-sm text-slate-500 mt-1">
          Verify your identity and qualifications to build trust with students.
          Verified teachers appear higher in search results.
        </p>
      </div>

      <div className="space-y-4">
        {docs.map(({ key, label, desc, icon: Icon, accept }) => (
          <div key={key} className="border border-slate-200 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
              {statusBadge(statuses[key] || "none")}
            </div>
            <button
              onClick={() => handleUpload(key, accept)}
              disabled={uploading === key}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {uploading === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {statuses[key] && statuses[key] !== "none" ? "Replace Document" : "Upload"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB 5: PAYOUT SETTINGS (Teachers Only)
   ═══════════════════════════════════════════════════════════════ */
function PayoutTab({
  teacher, onToast,
}: {
  teacher: Record<string, unknown> | null;
  onToast: (t: { message: string; type: "success" | "error" }) => void;
}) {
  const existingSettings = (teacher?.payout_settings as Record<string, string>) || {};
  const [method, setMethod] = useState(existingSettings.method || (teacher?.payout_method as string) || "mpesa");
  const [mpesaPhone, setMpesaPhone] = useState(existingSettings.phone || (teacher?.payout_phone as string) || "");
  const [mpesaName, setMpesaName] = useState(existingSettings.mpesa_name || "");
  const [bankName, setBankName] = useState(existingSettings.bank_name || (teacher?.bank_name as string) || "");
  const [accountName, setAccountName] = useState(existingSettings.account_name || (teacher?.bank_account_name as string) || "");
  const [accountNumber, setAccountNumber] = useState(existingSettings.account_number || (teacher?.bank_account_number as string) || "");
  const [branchCode, setBranchCode] = useState(existingSettings.branch_code || "");
  const [saving, setSaving] = useState(false);

  const isConfigured = method === "mpesa" ? !!mpesaPhone : !!bankName && !!accountNumber;

  // Calculate next payout Friday (2nd or 4th Friday)
  const getNextPayoutDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    // Find all Fridays
    const fridays: Date[] = [];
    for (let d = 1; d <= 31; d++) {
      const date = new Date(year, month, d);
      if (date.getMonth() !== month) break;
      if (date.getDay() === 5) fridays.push(date);
    }
    const payoutFridays = [fridays[1], fridays[3]].filter(Boolean);
    let next = payoutFridays.find(f => f > now);
    if (!next) {
      // Next month
      const nextMonth = new Date(year, month + 1, 1);
      const nFridays: Date[] = [];
      for (let d = 1; d <= 31; d++) {
        const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), d);
        if (date.getMonth() !== nextMonth.getMonth()) break;
        if (date.getDay() === 5) nFridays.push(date);
      }
      next = nFridays[1] || nFridays[0];
    }
    return next?.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) || "TBD";
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = { method };
      if (method === "mpesa") {
        payload.phone = mpesaPhone;
        payload.mpesa_name = mpesaName;
      } else {
        payload.bank_name = bankName;
        payload.account_name = accountName;
        payload.account_number = accountNumber;
        payload.branch_code = branchCode;
      }
      const res = await fetch("/api/settings/payout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      onToast({ message: "Payout settings saved", type: "success" });
    } catch {
      onToast({ message: "Failed to save payout settings", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Payout Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure how you receive your earnings. Payouts are processed on the 2nd and 4th Friday of each month.
        </p>
      </div>

      {!isConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <Banknote className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            You have not configured a payout method. Please add your details to receive your next payout.
          </p>
        </div>
      )}

      {/* Method selector */}
      <Field label="Preferred Payout Method" required>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMethod("mpesa")}
            className={`flex items-center gap-2 flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
              method === "mpesa" ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Smartphone className="h-4 w-4" /> M-Pesa
          </button>
          <button
            type="button"
            onClick={() => setMethod("bank")}
            className={`flex items-center gap-2 flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
              method === "bank" ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Building2 className="h-4 w-4" /> Bank Transfer
          </button>
        </div>
      </Field>

      {method === "mpesa" ? (
        <>
          <Field label="M-Pesa Phone Number" required>
            <div className="flex gap-2">
              <div className="flex items-center px-3 py-3 border border-slate-300 rounded-lg bg-slate-50 text-sm text-slate-600 shrink-0">
                +254
              </div>
              <input
                type="tel"
                value={mpesaPhone.replace(/^\+254/, "")}
                onChange={e => setMpesaPhone("+254" + e.target.value.replace(/\D/g, ""))}
                className="input-field flex-1"
                placeholder="712345678"
              />
            </div>
          </Field>
          <Field label="Registered Name" required>
            <input
              type="text"
              value={mpesaName}
              onChange={e => setMpesaName(e.target.value)}
              className="input-field"
              placeholder="Name as registered on M-Pesa"
            />
          </Field>
        </>
      ) : (
        <>
          <Field label="Bank Name" required>
            <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="input-field" placeholder="e.g., Equity Bank" />
          </Field>
          <Field label="Account Holder Name" required>
            <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} className="input-field" placeholder="Full name on account" />
          </Field>
          <Field label="Account Number" required>
            <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="input-field" placeholder="Account number" />
          </Field>
          <Field label="Branch Code">
            <input type="text" value={branchCode} onChange={e => setBranchCode(e.target.value)} className="input-field" placeholder="Optional" />
          </Field>
        </>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-2"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save Payout Settings
      </button>

      <p className="text-sm text-slate-500 flex items-center gap-2">
        <Banknote className="h-4 w-4 text-slate-400" />
        Next payout: <span className="font-medium text-slate-700">{getNextPayoutDate()}</span>
      </p>

      <style>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #1e293b;
          background: white;
          transition: all 0.15s;
        }
        .input-field:focus {
          outline: none;
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }
      `}</style>
    </div>
  );
}

/* ──────────────────────────── Shared Field ──────────────────────────── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
