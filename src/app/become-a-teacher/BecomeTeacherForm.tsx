"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  experience: z
    .string()
    .min(50, "Please describe your experience (at least 50 characters)"),
  qualifications: z
    .string()
    .min(10, "Please describe your qualifications"),
  available_hours: z
    .number()
    .min(1, "Minimum 1 hour")
    .max(168, "Maximum 168 hours"),
  rate_expectation: z
    .number()
    .min(5, "Minimum $5/hr")
    .max(200, "Maximum $200/hr"),
  teaching_philosophy: z
    .string()
    .min(100, "Please write at least 100 characters")
    .max(1000, "Maximum 1000 characters"),
  agree_terms: z
    .boolean()
    .refine((v) => v === true, "You must agree to the terms"),
});

type FormValues = z.infer<typeof schema>;

export default function BecomeTeacherForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const philosophy = watch("teaching_philosophy", "");

  const onSubmit = async (data: FormValues) => {
    setServerError("");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Submission failed");
      }
      setSubmitted(true);
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-600" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">
          Application Received!
        </h2>
        <p className="text-slate-500 max-w-sm mx-auto">
          Thank you for applying to teach on Swahili Tutors. We&apos;ll review
          your application and contact you within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Personal Info */}
        <fieldset>
          <legend className="text-base font-semibold text-slate-900 mb-4">
            Personal Information
          </legend>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Full Name *
              </label>
              <input
                id="name"
                {...register("name")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                placeholder="Amina Odhiambo"
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Phone Number (optional)
              </label>
              <input
                id="phone"
                type="tel"
                {...register("phone")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                placeholder="+254 712 345 678"
              />
            </div>
          </div>
        </fieldset>

        {/* Teaching Details */}
        <fieldset>
          <legend className="text-base font-semibold text-slate-900 mb-4">
            Teaching Details
          </legend>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="experience"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Teaching Experience *
              </label>
              <textarea
                id="experience"
                {...register("experience")}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm resize-none"
                placeholder="Describe your teaching experience — how long you've been teaching, where, what types of students, and any relevant contexts..."
              />
              {errors.experience && (
                <p className="text-xs text-red-500 mt-1" role="alert">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="qualifications"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Qualifications & Certifications *
              </label>
              <textarea
                id="qualifications"
                {...register("qualifications")}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm resize-none"
                placeholder="List your relevant degrees, teaching qualifications, language certifications, etc."
              />
              {errors.qualifications && (
                <p className="text-xs text-red-500 mt-1" role="alert">
                  {errors.qualifications.message}
                </p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="available_hours"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Available Hours Per Week *
                </label>
                <input
                  id="available_hours"
                  type="number"
                  min={1}
                  max={60}
                  {...register("available_hours", { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                  placeholder="10"
                />
                {errors.available_hours && (
                  <p className="text-xs text-red-500 mt-1" role="alert">
                    {errors.available_hours.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="rate_expectation"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Expected Hourly Rate (USD) *
                </label>
                <input
                  id="rate_expectation"
                  type="number"
                  min={5}
                  max={200}
                  {...register("rate_expectation", { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
                  placeholder="25"
                />
                {errors.rate_expectation && (
                  <p className="text-xs text-red-500 mt-1" role="alert">
                    {errors.rate_expectation.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="teaching_philosophy"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Teaching Philosophy *{" "}
                <span className="text-slate-400 font-normal">
                  ({philosophy?.length || 0}/1000 — min 100)
                </span>
              </label>
              <textarea
                id="teaching_philosophy"
                {...register("teaching_philosophy")}
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm resize-none"
                placeholder="Describe your approach to teaching Swahili. What makes your lessons unique? How do you adapt to different learning styles? What results do you help students achieve?"
                maxLength={1000}
              />
              {errors.teaching_philosophy && (
                <p className="text-xs text-red-500 mt-1" role="alert">
                  {errors.teaching_philosophy.message}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {/* Terms */}
        <div className="flex items-start gap-3">
          <input
            id="agree_terms"
            type="checkbox"
            {...register("agree_terms")}
            className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
          />
          <label htmlFor="agree_terms" className="text-sm text-slate-600">
            I agree to Swahili Tutors&apos;s{" "}
            <a
              href="/terms"
              className="text-indigo-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-indigo-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Policy
            </a>
            . *
          </label>
        </div>
        {errors.agree_terms && (
          <p className="text-xs text-red-500 -mt-4" role="alert">
            {errors.agree_terms.message}
          </p>
        )}

        {serverError && (
          <div
            className="rounded-xl bg-red-50 border border-red-200 px-4 py-3"
            role="alert"
          >
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          fullWidth
        >
          Submit Application
        </Button>

        <p className="text-xs text-slate-400 text-center">
          We review all applications within 48 hours and will contact you by
          email.
        </p>
      </form>
    </div>
  );
}
