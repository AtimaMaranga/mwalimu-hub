"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Mail } from "lucide-react";
import type { Teacher } from "@/types";
import Button from "@/components/ui/Button";
import Toast, { ToastContainer } from "@/components/ui/Toast";

const schema = z.object({
  student_name: z.string().min(2, "Name must be at least 2 characters"),
  student_email: z.string().email("Please enter a valid email address"),
  experience_level: z.enum(["beginner", "intermediate", "advanced"]),
  preferred_times: z.string().optional(),
  message: z.string().min(20, "Please write at least 20 characters"),
});

type FormValues = z.infer<typeof schema>;

interface TeacherContactModalProps {
  teacher: Teacher;
}

export default function TeacherContactModal({ teacher }: TeacherContactModalProps) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, teacher_id: teacher.id, teacher_name: teacher.name }),
      });
      if (!res.ok) throw new Error();
      setToast({ message: `Your message has been sent to ${teacher.name}!`, type: "success" });
      reset();
      setOpen(false);
    } catch {
      setToast({ message: "Something went wrong. Please try again.", type: "error" });
    }
  };

  return (
    <>
      <Button variant="primary" fullWidth onClick={() => setOpen(true)}>
        <Mail className="h-4 w-4" aria-hidden="true" />
        Contact {teacher.name.split(" ")[0]}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Contact ${teacher.name}`}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-bold text-lg text-slate-900">
                Contact {teacher.name}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="student_name">
                  Your Name *
                </label>
                <input
                  id="student_name"
                  {...register("student_name")}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm"
                  placeholder="John Smith"
                />
                {errors.student_name && (
                  <p className="text-xs text-red-500 mt-1">{errors.student_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="student_email">
                  Email Address *
                </label>
                <input
                  id="student_email"
                  type="email"
                  {...register("student_email")}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm"
                  placeholder="you@example.com"
                />
                {errors.student_email && (
                  <p className="text-xs text-red-500 mt-1">{errors.student_email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="experience_level">
                  Your Swahili Level *
                </label>
                <select
                  id="experience_level"
                  {...register("experience_level")}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm bg-white"
                >
                  <option value="beginner">Beginner — little to no Swahili</option>
                  <option value="intermediate">Intermediate — some knowledge</option>
                  <option value="advanced">Advanced — looking to polish</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="preferred_times">
                  Preferred Lesson Times (optional)
                </label>
                <input
                  id="preferred_times"
                  {...register("preferred_times")}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm"
                  placeholder="e.g. Weekday evenings, UTC+0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="message">
                  Message *
                </label>
                <textarea
                  id="message"
                  {...register("message")}
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm resize-none"
                  placeholder="Tell the teacher about your goals, why you want to learn Swahili, and any specific topics you'd like to cover..."
                />
                {errors.message && (
                  <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  fullWidth
                >
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <ToastContainer>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </ToastContainer>
      )}
    </>
  );
}
