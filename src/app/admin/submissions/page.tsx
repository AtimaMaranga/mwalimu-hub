import { createAdminClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { MessageSquare, FileText } from "lucide-react";
import ApplicationsClient from "./ApplicationsClient";

export default async function SubmissionsPage() {
  const supabase = await createAdminClient();

  const [{ data: contacts }, { data: applications }] = await Promise.all([
    supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("teacher_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const statusColor = {
    new: "bg-emerald-100 text-emerald-700",
    read: "bg-slate-100 text-slate-600",
    responded: "bg-indigo-100 text-indigo-700",
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-2xl font-bold font-heading text-slate-900">
        Submissions
      </h1>

      {/* Contact Submissions */}
      <section aria-labelledby="contacts-heading">
        <h2
          id="contacts-heading"
          className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2"
        >
          <MessageSquare className="h-5 w-5 text-emerald-500" aria-hidden="true" />
          Contact Form Submissions ({contacts?.length ?? 0})
        </h2>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {!contacts || contacts.length === 0 ? (
            <p className="p-6 text-sm text-slate-400">No submissions yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  {["Name", "Email", "Subject", "Date", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.email}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                      {c.subject}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusColor[c.status as keyof typeof statusColor] ||
                          statusColor.read
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Teacher Applications */}
      <section aria-labelledby="applications-heading">
        <h2
          id="applications-heading"
          className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2"
        >
          <FileText className="h-5 w-5 text-amber-500" aria-hidden="true" />
          Teacher Applications ({applications?.length ?? 0})
        </h2>
        <ApplicationsClient applications={applications ?? []} />
      </section>
    </div>
  );
}
