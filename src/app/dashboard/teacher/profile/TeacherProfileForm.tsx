"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SPECIALIZATIONS } from "@/types";
import { getInitials } from "@/lib/utils";
import { DEFAULT_HOURLY_RATE } from "@/lib/pricing";
import ImageUpload from "@/components/ui/ImageUpload";
import Button from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  tagline?: string;
  bio?: string;
  teaching_approach?: string;
  experience_years?: number;
  qualifications?: string;
  timezone?: string;
  availability_description?: string;
  specializations?: string[];
  profile_image_url?: string;
  is_published?: boolean;
}

interface Props {
  userId: string;
  userEmail: string;
  avatarUrl: string;
  teacher: Teacher | null;
}

export default function TeacherProfileForm({ userId, userEmail, avatarUrl, teacher }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState(teacher?.profile_image_url ?? avatarUrl ?? "");

  const [form, setForm] = useState({
    name: teacher?.name ?? "",
    tagline: teacher?.tagline ?? "",
    bio: teacher?.bio ?? "",
    teaching_approach: teacher?.teaching_approach ?? "",
    experience_years: teacher?.experience_years?.toString() ?? "",
    qualifications: teacher?.qualifications ?? "",
    timezone: teacher?.timezone ?? "UTC",
    availability_description: teacher?.availability_description ?? "",
    specializations: teacher?.specializations ?? [] as string[],
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleSpec = (spec: string) =>
    setForm((f) => ({
      ...f,
      specializations: f.specializations.includes(spec)
        ? f.specializations.filter((s) => s !== spec)
        : [...f.specializations, spec],
    }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const supabase = createClient();
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const teacherData = {
      slug,
      name: form.name,
      email: userEmail,
      tagline: form.tagline,
      bio: form.bio,
      teaching_approach: form.teaching_approach,
      experience_years: parseInt(form.experience_years) || 0,
      qualifications: form.qualifications,
      timezone: form.timezone,
      availability_description: form.availability_description,
      specializations: form.specializations,
      profile_image_url: imageUrl || null,
    };

    if (teacher?.id) {
      const { error: updateErr } = await supabase
        .from("teachers")
        .update(teacherData)
        .eq("id", teacher.id);
      if (updateErr) { setError(updateErr.message); setSaving(false); return; }
    } else {
      const { data: newTeacher, error: insertErr } = await supabase
        .from("teachers")
        .insert({ ...teacherData, hourly_rate: DEFAULT_HOURLY_RATE, rate_per_minute: Number((DEFAULT_HOURLY_RATE / 60).toFixed(4)), is_native_speaker: true, is_published: false, rating: 0, total_students: 0 })
        .select("id")
        .single();
      if (insertErr) { setError(insertErr.message); setSaving(false); return; }
      await supabase.from("profiles").update({ teacher_id: newTeacher.id }).eq("id", userId);
    }

    // Always sync avatar_url to profiles table too
    if (imageUrl) {
      await supabase.from("profiles").update({ avatar_url: imageUrl }).eq("id", userId);
    }

    setSaving(false);
    setSuccess(true);
    setTimeout(() => { router.push("/dashboard/teacher"); router.refresh(); }, 1500);
  };

  const initials = getInitials(form.name || userEmail);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Teacher Profile</h1>
        <p className="text-slate-400 text-sm mt-1">
          {teacher?.is_published
            ? "Your profile is live. Updates are published immediately."
            : "Fill in your details. Our team will review and publish your profile within 24–48 hours."}
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Profile saved! Redirecting…
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
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
            <p className="text-slate-500 text-xs mt-1">A clear headshot works best. JPG, PNG or WebP, max 5MB.</p>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl p-6 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Basic Information</p>

          {error && (
            <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-xl border border-red-500/20">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name *</label>
            <input
              type="text" value={form.name} onChange={(e) => set("name", e.target.value)} required
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
              placeholder="e.g. Amina Odhiambo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Tagline *</label>
            <input
              type="text" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} required maxLength={120}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
              placeholder="e.g. Native Swahili speaker specialising in Business Swahili"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio *</label>
            <textarea
              value={form.bio} onChange={(e) => set("bio", e.target.value)} required rows={4}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
              placeholder="Tell students about your background, experience, and teaching style…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Teaching approach</label>
            <textarea
              value={form.teaching_approach} onChange={(e) => set("teaching_approach", e.target.value)} rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
              placeholder="Describe your teaching methods and what students can expect…"
            />
          </div>
        </div>

        {/* Experience */}
        <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl p-6 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Experience</p>
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3">
            <p className="text-indigo-300 text-sm">
              All teachers start at <span className="font-bold text-white">${DEFAULT_HOURLY_RATE}/hr</span>. You can adjust your rate (up to $25/hr) after completing 50 hours of sessions with an average rating of 4.0+.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Years of experience</label>
            <input
              type="number" min="0" max="50" value={form.experience_years}
              onChange={(e) => set("experience_years", e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
              placeholder="5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Qualifications</label>
            <input
              type="text" value={form.qualifications} onChange={(e) => set("qualifications", e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
              placeholder="e.g. BA Education, University of Nairobi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Availability</label>
            <input
              type="text" value={form.availability_description}
              onChange={(e) => set("availability_description", e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
              placeholder="e.g. Weekdays 8am–6pm EAT, weekends available"
            />
          </div>
        </div>

        {/* Specialisations */}
        <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl p-6 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Specialisations</p>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((spec) => (
              <button
                key={spec} type="button" onClick={() => toggleSpec(spec)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  form.specializations.includes(spec)
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                    : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" loading={saving} fullWidth>
          Save Profile
        </Button>
      </form>
    </div>
  );
}
