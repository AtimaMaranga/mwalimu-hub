"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star, Send, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";

const schema = z.object({
  student_name:  z.string().min(2, "Name must be at least 2 characters"),
  student_email: z.string().email("Please enter a valid email"),
  rating:        z.number().min(1, "Please select a rating").max(5),
  comment:       z.string().max(1000, "Max 1000 characters").optional(),
});

type FormData = z.infer<typeof schema>;

interface ReviewFormProps {
  teacherId: string;
  teacherName: string;
}

export default function ReviewForm({ teacherId, teacherName }: ReviewFormProps) {
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const rating = watch("rating") ?? 0;

  async function onSubmit(data: FormData) {
    setServerError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, teacher_id: teacherId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError("Network error. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle className="h-10 w-10 text-emerald-500" />
        <p className="font-semibold text-slate-900">Thank you for your review!</p>
        <p className="text-sm text-slate-500">Your review has been submitted and will appear shortly.</p>
      </div>
    );
  }

  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <p className="text-sm text-slate-500">
        Share your experience learning with {teacherName}.
      </p>

      {/* Star picker */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Your rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setValue("rating", star, { shouldValidate: true })}
              aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hovered || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200 fill-slate-200"
                }`}
              />
            </button>
          ))}
          {(hovered || rating) > 0 && (
            <span className="ml-2 text-sm font-medium text-slate-600">
              {labels[hovered || rating]}
            </span>
          )}
        </div>
        {errors.rating && (
          <p className="text-xs text-red-500 mt-1">{errors.rating.message}</p>
        )}
      </div>

      {/* Name + email row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Your name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("student_name")}
            placeholder="Jane Doe"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {errors.student_name && (
            <p className="text-xs text-red-500 mt-1">{errors.student_name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            {...register("student_email")}
            type="email"
            placeholder="jane@example.com"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {errors.student_email && (
            <p className="text-xs text-red-500 mt-1">{errors.student_email.message}</p>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Your review
        </label>
        <textarea
          {...register("comment")}
          rows={4}
          placeholder="Tell others about your experience…"
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
        {errors.comment && (
          <p className="text-xs text-red-500 mt-1">{errors.comment.message}</p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="flex items-center gap-2"
      >
        {isSubmitting ? "Submitting…" : (
          <>Submit Review <Send className="h-4 w-4" /></>
        )}
      </Button>
    </form>
  );
}
