"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
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
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default function ApplicationsClient({ applications: initial }: { applications: Application[] }) {
  const router = useRouter();
  const [applications, setApplications] = useState(initial);
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
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
      setApplications((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? { ...a, status: action === "approve" ? "approved" : "rejected" }
            : a
        )
      );
      showToast(
        action === "approve"
          ? "Application approved — teacher profile created and published."
          : "Application rejected.",
        action === "approve"
      );
      router.refresh();
    } else {
      showToast(body.error || "Something went wrong. Try again.", false);
    }
    setProcessing(null);
  };

  return (
    <div className="relative">
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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {applications.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">No applications yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                {["Name", "Email", "Rate", "Hours/wk", "Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {applications.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{a.name}</td>
                  <td className="px-4 py-3 text-slate-600">{a.email}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {a.rate_expectation ? `$${a.rate_expectation}/hr` : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.available_hours ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(a.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[a.status] ?? statusColor.pending}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(a.id, "approve")}
                          disabled={processing === a.id}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(a.id, "reject")}
                          disabled={processing === a.id}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
