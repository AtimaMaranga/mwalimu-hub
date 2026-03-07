"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import PageWrapper from "@/components/layout/PageWrapper";
import { SPECIALIZATIONS } from "@/types";

export default function TeacherProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    tagline: "",
    bio: "",
    teaching_approach: "",
    experience_years: "",
    qualifications: "",
    hourly_rate: "",
    timezone: "UTC",
    availability_description: "",
    specializations: [] as string[],
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, teacher_id")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        setForm((f) => ({ ...f, name: profile.full_name || "" }));
      }

      if (profile?.teacher_id) {
        const { data: teacher } = await supabase
          .from("teachers")
          .select("*")
          .eq("id", profile.teacher_id)
          .single();

        if (teacher) {
          setForm({
            name: teacher.name || "",
            tagline: teacher.tagline || "",
            bio: teacher.bio || "",
            teaching_approach: teacher.teaching_approach || "",
            experience_years: teacher.experience_years?.toString() || "",
            qualifications: teacher.qualifications || "",
            hourly_rate: teacher.hourly_rate?.toString() || "",
            timezone: teacher.timezone || "UTC",
            availability_description: teacher.availability_description || "",
            specializations: teacher.specializations || [],
          });
        }
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const toggleSpec = (spec: string) => {
    setForm((f) => ({
      ...f,
      specializations: f.specializations.includes(spec)
        ? f.specializations.filter((s) => s !== spec)
        : [...f.specializations, spec],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const teacherData = {
      slug,
      name: form.name,
      email: user.email!,
      tagline: form.tagline,
      bio: form.bio,
      teaching_approach: form.teaching_approach,
      experience_years: parseInt(form.experience_years) || 0,
      qualifications: form.qualifications,
      hourly_rate: parseFloat(form.hourly_rate) || 0,
      timezone: form.timezone,
      availability_description: form.availability_description,
      specializations: form.specializations,
      is_native_speaker: true,
      is_published: false,
    };

    const { data: existing } = await supabase
      .from("profiles")
      .select("teacher_id")
      .eq("id", user.id)
      .single();

    let teacherId = existing?.teacher_id;

    if (teacherId) {
      await supabase.from("teachers").update(teacherData).eq("id", teacherId);
    } else {
      const { data: newTeacher, error: insertError } = await supabase
        .from("teachers")
        .insert({ ...teacherData, rating: 0, total_students: 0 })
        .select("id")
        .single();

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
      teacherId = newTeacher?.id;
      await supabase.from("profiles").update({ teacher_id: teacherId }).eq("id", user.id);
    }

    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard/teacher");
      router.refresh();
    }, 1500);
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-8">
            <Link href="/dashboard/teacher" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              ← Back to dashboard
            </Link>
            <h1 className="text-3xl font-bold font-heading text-slate-900 mt-4 mb-2">
              Your Teacher Profile
            </h1>
            <p className="text-slate-500 text-sm">
              Fill in your details below. Your profile will be reviewed by our team and published within 24–48 hours.
            </p>
          </div>

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-6">
              Profile saved! Redirecting to dashboard…
            </div>
          )}

          <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Amina Odhiambo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tagline *</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                required
                maxLength={120}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Native Swahili speaker specialising in Business Swahili"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio *</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                required
                rows={5}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Tell students about your background, experience, and teaching style…"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Teaching approach</label>
              <textarea
                value={form.teaching_approach}
                onChange={(e) => setForm({ ...form, teaching_approach: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Describe your teaching methods and what students can expect…"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Years of experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={form.experience_years}
                  onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Hourly rate (USD) *
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={form.hourly_rate}
                  onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. 25"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Qualifications</label>
              <input
                type="text"
                value={form.qualifications}
                onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. BA Education, University of Nairobi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Availability</label>
              <input
                type="text"
                value={form.availability_description}
                onChange={(e) => setForm({ ...form, availability_description: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Weekdays 8am–6pm EAT, weekends available"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Specialisations
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpec(spec)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      form.specializations.includes(spec)
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
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
      </div>
    </PageWrapper>
  );
}
