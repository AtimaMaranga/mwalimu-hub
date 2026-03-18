"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { SPECIALIZATIONS } from "@/types";
import { DEFAULT_HOURLY_RATE } from "@/lib/pricing";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(2, "Required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  tagline: z.string().optional(),
  bio: z.string().optional(),
  teaching_approach: z.string().optional(),
  experience_years: z.number().min(0).optional(),
  qualifications: z.string().optional(),
  timezone: z.string().optional(),
  availability_description: z.string().optional(),
  video_intro_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  profile_image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  specializations: z.array(z.string()).optional(),
  is_native_speaker: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export default function NewTeacherPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { specializations: [], is_native_speaker: true, is_published: false },
  });

  const selectedSpecs = watch("specializations") ?? [];

  const toggleSpec = (spec: string) => {
    if (selectedSpecs.includes(spec)) {
      setValue("specializations", selectedSpecs.filter((s) => s !== spec));
    } else {
      setValue("specializations", [...selectedSpecs, spec]);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setServerError("");
    try {
      const supabase = createClient();
      const slug = slugify(data.name) + "-" + Math.random().toString(36).slice(2, 6);

      const { error } = await supabase.from("teachers").insert({
        slug,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        tagline: data.tagline || null,
        bio: data.bio || null,
        teaching_approach: data.teaching_approach || null,
        experience_years: data.experience_years ?? 0,
        qualifications: data.qualifications || null,
        hourly_rate: DEFAULT_HOURLY_RATE,
        rate_per_minute: Number((DEFAULT_HOURLY_RATE / 60).toFixed(4)),
        timezone: data.timezone || "UTC",
        availability_description: data.availability_description || null,
        video_intro_url: data.video_intro_url || null,
        profile_image_url: data.profile_image_url || null,
        specializations: data.specializations ?? [],
        is_native_speaker: data.is_native_speaker ?? true,
        is_published: data.is_published ?? false,
        rating: 0,
        total_students: 0,
      });

      if (error) throw new Error(error.message);
      router.push("/admin/teachers");
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to create teacher");
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/teachers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold font-heading text-slate-900">
          Add New Teacher
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h2 className="font-semibold text-slate-900">Basic Information</h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className={labelClass}>Full Name *</label>
              <input id="name" {...register("name")} className={inputClass} placeholder="Amina Odhiambo" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email *</label>
              <input id="email" type="email" {...register("email")} className={inputClass} placeholder="amina@example.com" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Phone</label>
              <input id="phone" type="tel" {...register("phone")} className={inputClass} placeholder="+254 712 345 678" />
            </div>
            <div>
              <label className={labelClass}>Hourly Rate (USD)</label>
              <p className="text-sm text-slate-500 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                Auto-set to ${DEFAULT_HOURLY_RATE}/hr (platform default)
              </p>
            </div>
            <div>
              <label htmlFor="experience_years" className={labelClass}>Years of Experience</label>
              <input id="experience_years" type="number" min={0}
                {...register("experience_years", { valueAsNumber: true })}
                className={inputClass} placeholder="5" />
            </div>
            <div>
              <label htmlFor="timezone" className={labelClass}>Timezone</label>
              <input id="timezone" {...register("timezone")} className={inputClass} placeholder="Africa/Nairobi" />
            </div>
          </div>

          <div>
            <label htmlFor="profile_image_url" className={labelClass}>Profile Photo URL</label>
            <input id="profile_image_url" {...register("profile_image_url")} className={inputClass}
              placeholder="https://images.unsplash.com/photo-..." />
            {errors.profile_image_url && <p className="text-xs text-red-500 mt-1">{errors.profile_image_url.message}</p>}
          </div>

          <div>
            <label htmlFor="tagline" className={labelClass}>Tagline</label>
            <input id="tagline" {...register("tagline")} className={inputClass}
              placeholder="Native speaker specialising in Business Swahili" />
          </div>
        </section>

        {/* Bio & Approach */}
        <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h2 className="font-semibold text-slate-900">Bio & Teaching</h2>
          <div>
            <label htmlFor="bio" className={labelClass}>Full Biography</label>
            <textarea id="bio" {...register("bio")} rows={6} className={`${inputClass} resize-none`}
              placeholder="Write a detailed biography for the teacher profile page..." />
          </div>
          <div>
            <label htmlFor="teaching_approach" className={labelClass}>Teaching Approach</label>
            <textarea id="teaching_approach" {...register("teaching_approach")} rows={3} className={`${inputClass} resize-none`}
              placeholder="Describe teaching methodology..." />
          </div>
          <div>
            <label htmlFor="qualifications" className={labelClass}>Qualifications</label>
            <input id="qualifications" {...register("qualifications")} className={inputClass}
              placeholder="BA Education (Kiswahili), University of Nairobi" />
          </div>
          <div>
            <label htmlFor="availability_description" className={labelClass}>Availability</label>
            <input id="availability_description" {...register("availability_description")} className={inputClass}
              placeholder="Monday–Friday 7am–6pm EAT. Weekends on request." />
          </div>
          <div>
            <label htmlFor="video_intro_url" className={labelClass}>Video Introduction URL (YouTube/Vimeo)</label>
            <input id="video_intro_url" {...register("video_intro_url")} className={inputClass}
              placeholder="https://www.youtube.com/watch?v=..." />
            {errors.video_intro_url && <p className="text-xs text-red-500 mt-1">{errors.video_intro_url.message}</p>}
          </div>
        </section>

        {/* Specialisations */}
        <section className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Specialisations</h2>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => toggleSpec(spec)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedSpecs.includes(spec)
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </section>

        {/* Settings */}
        <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Settings</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register("is_native_speaker")}
              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
            <span className="text-sm text-slate-700">Native Swahili speaker</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register("is_published")}
              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm text-slate-700">
              Publish immediately (visible on the website)
            </span>
          </label>
        </section>

        {serverError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3" role="alert">
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/admin/teachers">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Create Teacher Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
