"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SPECIALIZATIONS } from "@/types";
import { getInitials } from "@/lib/utils";
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
  hourly_rate?: number;
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
    hourly_rate: teacher?.hourly_rate?.toString() ?? "",
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
      hourly_rate: parseFloat(form.hourly_rate) || 0,
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
        .insert({ ...teacherData, is_native_speaker: true, is_published: false, rating: 0, total_students: 0 })
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
        <h1 className="text-2xl font-bold text-slate-900">Teacher Profile</h1>
        <p className="text-slate-400 text-sm mt-1">
          {teacher?.is_published
            ? "Your profile is live. Updates are published immediately."
            : "Fill in your details. Our team will review and publish your profile within 24–48 hours."}
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Profile saved! Redirecting…
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile image */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-6">
          <ImageUpload
            currentUrl={imageUrl}
            userId={userId}
            initials={initials}
            onUpload={setImageUrl}
          />
          <div>
            <p className="text-slate-900 font-medium text-sm">Profile Photo</p>
            <p className="text-slate-500 text-xs mt-1">A clear headshot works best. JPG, PNG or WebP, max 5MB.</p>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Basic Information</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name *</label>
            <input
              type="text" value={form.name} onChange={(e) => set("name", e.target.value)} required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              placeholder="e.g. Amina Odhiambo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tagline *</label>
            <input
              type="text" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} required maxLength={120}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              placeholder="e.g. Native Swahili speaker specialising in Business Swahili"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio *</label>
            <textarea
              value={form.bio} onChange={(e) => set("bio", e.target.value)} required rows={4}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
              placeholder="Tell students about your background, experience, and teaching style…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Teaching approach</label>
            <textarea
              value={form.teaching_approach} onChange={(e) => set("teaching_approach", e.target.value)} rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
              placeholder="Describe your teaching methods and what students can expect…"
            />
          </div>
        </div>

        {/* Rates & Experience */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Rates & Experience</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Hourly rate (USD) *</label>
              <input
                type="number" min="5" max="200" value={form.hourly_rate}
                onChange={(e) => set("hourly_rate", e.target.value)} required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Years of experience</label>
              <input
                type="number" min="0" max="50" value={form.experience_years}
                onChange={(e) => set("experience_years", e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="5"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Qualifications</label>
            <input
              type="text" value={form.qualifications} onChange={(e) => set("qualifications", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              placeholder="e.g. BA Education, University of Nairobi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Availability</label>
            <input
              type="text" value={form.availability_description}
              onChange={(e) => set("availability_description", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              placeholder="e.g. Weekdays 8am–6pm EAT, weekends available"
            />
          </div>
        </div>

        {/* Specialisations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Specialisations</p>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((spec) => (
              <button
                key={spec} type="button" onClick={() => toggleSpec(spec)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  form.specializations.includes(spec)
                    ? "bg-teal-50 text-teal-700 border-teal-300"
                    : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300"
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
