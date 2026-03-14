"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import ImageUpload from "@/components/ui/ImageUpload";
import Button from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";

interface Props {
  userId: string;
  userEmail: string;
  fullName: string;
  avatarUrl: string;
}

const LEVELS = [
  { value: "beginner",     label: "Beginner",     desc: "Little to no Swahili knowledge" },
  { value: "intermediate", label: "Intermediate",  desc: "Can hold basic conversations" },
  { value: "advanced",     label: "Advanced",      desc: "Comfortable in most situations" },
];

export default function StudentProfileForm({ userId, userEmail, fullName, avatarUrl }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState(avatarUrl);
  const [name, setName] = useState(fullName);

  const initials = getInitials(name || userEmail);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Full name is required."); return; }
    setError("");
    setSaving(true);

    const supabase = createClient();
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ full_name: name.trim(), avatar_url: imageUrl || null })
      .eq("id", userId);

    if (updateErr) {
      setError(updateErr.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);
    setTimeout(() => { router.push("/dashboard/student"); router.refresh(); }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Update your name and profile photo.</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Profile saved! Redirecting…
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Profile image */}
        <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl p-6 flex items-center gap-6">
          <ImageUpload
            currentUrl={imageUrl}
            userId={userId}
            initials={initials}
            onUpload={setImageUrl}
          />
          <div>
            <p className="text-white font-medium text-sm">Profile Photo</p>
            <p className="text-slate-500 text-xs mt-1">JPG, PNG or WebP, max 5MB.</p>
          </div>
        </div>

        {/* Name */}
        <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl p-6 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Account Details</p>

          {error && (
            <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-xl border border-red-500/20">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-600 mt-1">Email cannot be changed here. Go to Settings to update it.</p>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" loading={saving} fullWidth>
          Save Profile
        </Button>
      </form>
    </div>
  );
}
