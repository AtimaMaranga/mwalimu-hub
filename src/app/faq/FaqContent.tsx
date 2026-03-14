"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { faqs } from "./faq-data";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = `faq-${q.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={open}
        aria-controls={id}
      >
        <span className="font-medium text-slate-900 text-sm">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      <div
        id={id}
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-48" : "max-h-0"
        }`}
      >
        <p className="px-6 pb-4 text-sm text-slate-500 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function FaqContent() {
  return (
    <PageWrapper>
      <div className="bg-gradient-to-br from-teal-800 to-teal-950 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold font-heading mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-teal-100 text-lg">
            Everything you need to know about learning and teaching Swahili on
            Swahili Tutors.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        {faqs.map(({ category, items }) => (
          <section key={category} aria-labelledby={`cat-${category}`}>
            <h2
              id={`cat-${category}`}
              className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"
            >
              <span
                className="h-6 w-1.5 rounded-full bg-teal-600 inline-block"
                aria-hidden="true"
              />
              {category}
            </h2>
            <div className="space-y-2">
              {items.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </section>
        ))}

        <div className="bg-teal-50 rounded-2xl p-8 text-center">
          <h3 className="font-bold text-slate-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            Can&apos;t find what you&apos;re looking for? Our team is happy to
            help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
