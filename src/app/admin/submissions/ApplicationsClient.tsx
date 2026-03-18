"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Mail, Phone, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Application {
  id: string;
  name: string;
  email: string;
  phone?: string;
  rate_expectation?: number;
  available_hours?: number;
  experience?: string;
  qualifications?: string;
  teaching_philosophy?: string;
  status: string;
  created_at: string;
}

const statusColor: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

function ApplicationCard({
  application: a,
  onAction,
  processing,
}: {
  application: Application;
  onAction: (id: string, action: "approve" | "reject") => void;
  processing: string | null;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-slate-900">{a.name}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor[a.status] ?? statusColor.pending}`}>
              {a.status}
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />{a.email}
            </span>
            {a.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />{a.phone}
              </span>
            )}
            {a.available_hours && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />{a.available_hours} hrs/week
              </span>
            )}
            <span className="text-slate-400">{formatDate(a.created_at)}</span>
          </div>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors shrink-0"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-100 p-5 space-y-4 bg-slate-50">
          {a.experience && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Teaching Experience</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{a.experience}</p>
            </div>
          )}
          {a.qualifications && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Qualifications</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{a.qualifications}</p>
            </div>
          )}
          {a.teaching_philosophy && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Teaching Philosophy</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{a.teaching_philosophy}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {a.status === "pending" && (
        <div className="border-t border-slate-100 px-5 py-3 flex items-center gap-3 bg-white">
          <button
            onClick={() => onAction(a.id, "approve")}
            disabled={processing === a.id}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            Approve & Publish
          </button>
          <button
            onClick={() => onAction(a.id, "reject")}
            disabled={processing === a.id}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </button>
          <p className="text-xs text-slate-400 ml-auto">Click the arrow above to read the full application first</p>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsClient({ applications: initial }: { applications: Application[] }) {
  const [applications, setApplications] = useState(initial);
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAction = async (applicationId: string, action: "approve" | "reject") => {
    setProcessing(applicationId);
    const res = await fetch("/api/admin/approve-application", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, action }),
    });

    const body = await res.json();

    if (res.ok) {
      // Update local state immediately — do NOT call router.refresh() here
      // because it re-renders the server component and resets useState back
      // to whatever is in the DB at that instant, undoing the local update.
      setApplications((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? { ...a, status: action === "approve" ? "approved" : "rejected" }
            : a
        )
      );
      showToast(
        action === "approve"
          ? "Approved — teacher profile created and published."
          : "Application rejected successfully.",
        true  // always green for success
      );
    } else {
      showToast(body.error || "Something went wrong. Try again.", false);
    }
    setProcessing(null);
  };

  const pending = applications.filter((a) => a.status === "pending");
  const reviewed = applications.filter((a) => a.status !== "pending");

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl border ${
          toast.ok
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {toast.ok ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Pending */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Pending Review ({pending.length})
        </p>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-400 bg-white border border-slate-100 rounded-2xl p-6">No pending applications.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((a) => (
              <ApplicationCard key={a.id} application={a} onAction={handleAction} processing={processing} />
            ))}
          </div>
        )}
      </div>

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Previously Reviewed ({reviewed.length})
          </p>
          <div className="space-y-3">
            {reviewed.map((a) => (
              <ApplicationCard key={a.id} application={a} onAction={handleAction} processing={processing} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
