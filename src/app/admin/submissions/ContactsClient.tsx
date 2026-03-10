"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Mail, Phone } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const statusColor: Record<string, string> = {
  new:       "bg-emerald-100 text-emerald-700 border-emerald-200",
  read:      "bg-slate-100 text-slate-600 border-slate-200",
  responded: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

function ContactCard({ contact: c }: { contact: Contact }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-slate-900">{c.name}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor[c.status] ?? statusColor.read}`}>
              {c.status}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">{c.subject}</p>
          <div className="flex items-center gap-4 flex-wrap text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />{c.email}
            </span>
            {c.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />{c.phone}
              </span>
            )}
            <span className="text-slate-400">{formatDate(c.created_at)}</span>
          </div>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors shrink-0"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded message */}
      {expanded && (
        <div className="border-t border-slate-100 p-5 bg-slate-50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Message</p>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{c.message}</p>
          <a
            href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject)}`}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Reply via email
          </a>
        </div>
      )}
    </div>
  );
}

export default function ContactsClient({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return (
      <p className="text-sm text-slate-400 bg-white border border-slate-100 rounded-2xl p-6">
        No contact submissions yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {contacts.map((c) => (
        <ContactCard key={c.id} contact={c} />
      ))}
    </div>
  );
}
