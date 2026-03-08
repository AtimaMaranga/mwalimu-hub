"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle, Clock, XCircle, ExternalLink,
  Users, UserCheck, ChevronDown, ChevronUp,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

interface Teacher {
  id: string;
  name: string;
  email: string;
  tagline?: string;
  bio?: string;
  hourly_rate?: number;
  experience_years?: number;
  specializations?: string[];
  qualifications?: string;
  availability_description?: string;
  teaching_approach?: string;
  profile_image_url?: string;
  slug: string;
  is_published: boolean;
  created_at: string;
}

function TeacherRow({
  teacher,
  onAction,
}: {
  teacher: Teacher;
  onAction: (id: string, action: "approve" | "reject") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const initials = getInitials(teacher.name);

  return (
    <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 p-5">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
          {teacher.profile_image_url
            ? <img src={teacher.profile_image_url} alt={teacher.name} className="h-full w-full object-cover" />
            : initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-semibold">{teacher.name}</p>
            {teacher.hourly_rate && (
              <span className="text-xs text-cyan-400 font-semibold bg-cyan-500/15 px-2 py-0.5 rounded-full">
                ${teacher.hourly_rate}/hr
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm truncate">{teacher.email}</p>
          {teacher.tagline && (
            <p className="text-slate-400 text-xs mt-0.5 truncate">{teacher.tagline}</p>
          )}
        </div>

        {/* Submitted date */}
        <div className="hidden sm:block text-right shrink-0">
          <p className="text-slate-500 text-xs">Applied</p>
          <p className="text-slate-400 text-xs font-medium">
            {new Date(teacher.created_at).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onAction(teacher.id, "approve")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-xs font-semibold transition-colors border border-emerald-500/20"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Approve</span>
          </button>
          <button
            onClick={() => onAction(teacher.id, "reject")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-semibold transition-colors border border-red-500/20"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reject</span>
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-white/5 p-5 grid sm:grid-cols-2 gap-4">
          {[
            { label: "Bio",               value: teacher.bio },
            { label: "Teaching approach", value: teacher.teaching_approach },
            { label: "Qualifications",    value: teacher.qualifications },
            { label: "Availability",      value: teacher.availability_description },
          ].map(({ label, value }) => value ? (
            <div key={label}>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1">{label}</p>
              <p className="text-slate-300 text-sm leading-relaxed">{value}</p>
            </div>
          ) : null)}

          {teacher.specializations && teacher.specializations.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-2">Specialisations</p>
              <div className="flex flex-wrap gap-1.5">
                {teacher.specializations.map((s) => (
                  <span key={s} className="text-xs bg-white/5 text-slate-400 border border-white/10 px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          {teacher.experience_years ? (
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1">Experience</p>
              <p className="text-slate-300 text-sm">{teacher.experience_years} years</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function PublishedRow({ teacher, onUnpublish }: { teacher: Teacher; onUnpublish: (id: string) => void }) {
  const initials = getInitials(teacher.name);
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
        {teacher.profile_image_url
          ? <img src={teacher.profile_image_url} alt={teacher.name} className="h-full w-full object-cover" />
          : initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{teacher.name}</p>
        <p className="text-slate-500 text-xs">{teacher.email}</p>
      </div>
      {teacher.hourly_rate && (
        <p className="text-cyan-400 text-sm font-semibold shrink-0 hidden sm:block">${teacher.hourly_rate}/hr</p>
      )}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/teachers/${teacher.slug}`}
          target="_blank"
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={() => onUnpublish(teacher.id)}
          className="text-xs text-red-400 hover:text-red-300 px-2.5 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors"
        >
          Unpublish
        </button>
      </div>
    </div>
  );
}

export default function AdminTeachersClient({
  pending: initialPending,
  published: initialPublished,
}: {
  pending: Teacher[];
  published: Teacher[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pending, setPending] = useState(initialPending);
  const [published, setPublished] = useState(initialPublished);
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAction = async (teacherId: string, action: "approve" | "reject") => {
    setProcessing(teacherId);
    const res = await fetch("/api/admin/approve-teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId, action }),
    });

    if (res.ok) {
      const teacher = pending.find((t) => t.id === teacherId);
      setPending((p) => p.filter((t) => t.id !== teacherId));
      if (action === "approve" && teacher) {
        setPublished((p) => [{ ...teacher, is_published: true }, ...p]);
        showToast(`${teacher.name} approved and published.`, true);
      } else {
        showToast(`Application rejected.`, false);
      }
      startTransition(() => router.refresh());
    } else {
      showToast("Something went wrong. Try again.", false);
    }
    setProcessing(null);
  };

  const handleUnpublish = async (teacherId: string) => {
    setProcessing(teacherId);
    const res = await fetch("/api/admin/approve-teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId, action: "reject" }),
    });
    if (res.ok) {
      const teacher = published.find((t) => t.id === teacherId);
      setPublished((p) => p.filter((t) => t.id !== teacherId));
      if (teacher) setPending((p) => [{ ...teacher, is_published: false }, ...p]);
      showToast("Teacher unpublished.", false);
      startTransition(() => router.refresh());
    }
    setProcessing(null);
  };

  return (
    <div className="min-h-screen bg-[#13141f] text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border transition-all ${
          toast.ok
            ? "bg-emerald-950 text-emerald-300 border-emerald-800"
            : "bg-red-950 text-red-300 border-red-800"
        }`}>
          {toast.ok ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-1">Admin Panel</p>
            <h1 className="text-3xl font-bold text-white">Teacher Applications</h1>
            <p className="text-slate-400 text-sm mt-1">Review and approve teacher profiles before they go live.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/15 border border-amber-500/20 rounded-xl px-4 py-2.5 text-center">
              <p className="text-amber-400 text-xl font-bold">{pending.length}</p>
              <p className="text-amber-500/70 text-xs">Pending</p>
            </div>
            <div className="bg-emerald-500/15 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-center">
              <p className="text-emerald-400 text-xl font-bold">{published.length}</p>
              <p className="text-emerald-500/70 text-xs">Published</p>
            </div>
          </div>
        </div>

        {/* Pending applications */}
        <section>
          <div className="flex items-center gap-2.5 mb-4">
            <Clock className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest">Pending Review</h2>
            {pending.length > 0 && (
              <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {pending.length}
              </span>
            )}
          </div>

          {pending.length === 0 ? (
            <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl p-10 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-3">
                <UserCheck className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-white font-semibold mb-1">All caught up</p>
              <p className="text-slate-500 text-sm">No pending applications at the moment.</p>
            </div>
          ) : (
            <div className={`space-y-3 ${isPending || processing ? "opacity-70 pointer-events-none" : ""}`}>
              {pending.map((teacher) => (
                <TeacherRow key={teacher.id} teacher={teacher} onAction={handleAction} />
              ))}
            </div>
          )}
        </section>

        {/* Published teachers */}
        <section>
          <div className="flex items-center gap-2.5 mb-4">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest">Published Profiles</h2>
            {published.length > 0 && (
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {published.length}
              </span>
            )}
          </div>

          {published.length === 0 ? (
            <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl p-10 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-3">
                <Users className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-slate-500 text-sm">No published teachers yet.</p>
            </div>
          ) : (
            <div className="bg-[#1a1b2e] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
              {published.map((teacher) => (
                <PublishedRow key={teacher.id} teacher={teacher} onUnpublish={handleUnpublish} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
