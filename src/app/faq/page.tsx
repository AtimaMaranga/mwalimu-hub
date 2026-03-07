"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";

const faqs = [
  {
    category: "For Students",
    items: [
      {
        q: "Do I need prior knowledge of Swahili to join?",
        a: "Not at all! We have teachers who specialise in absolute beginners. Just let your teacher know your starting point and they'll tailor the lessons accordingly.",
      },
      {
        q: "How do I find the right teacher for me?",
        a: "Use our Teacher Directory to filter by specialisation, price, and teacher type. Read bios, check ratings, and watch video introductions. Most learners find their ideal match within a few profiles.",
      },
      {
        q: "What equipment do I need for online lessons?",
        a: "A computer or tablet with a microphone and webcam, and a stable internet connection. Your teacher will let you know which video platform they prefer (Zoom, Google Meet, Skype, etc.).",
      },
      {
        q: "How much do lessons cost?",
        a: "Our teachers set their own rates, ranging from approximately $15 to $50 per hour. You can filter by price range in the Teacher Directory to find options within your budget.",
      },
      {
        q: "Can I have a trial lesson before committing?",
        a: "We recommend asking your teacher about a trial or introductory lesson. Many teachers offer a shorter first session at a reduced rate so you can see if you're a good fit.",
      },
      {
        q: "How do I pay for lessons?",
        a: "Payment is arranged directly between you and your teacher. Common methods include PayPal, bank transfer, M-Pesa, and Wise. Mwalimu Wangu does not handle payments directly at this stage.",
      },
    ],
  },
  {
    category: "For Teachers",
    items: [
      {
        q: "How do I become a teacher on Mwalimu Wangu?",
        a: "Fill in the application form on our Become a Teacher page. We review all applications within 48 hours and will contact you by email with next steps.",
      },
      {
        q: "Do I need formal teaching qualifications?",
        a: "Formal qualifications are preferred but not always required. We value native fluency, teaching experience, and genuine passion for helping learners. Each application is reviewed individually.",
      },
      {
        q: "Can I set my own schedule?",
        a: "Yes — you have complete control over your availability and schedule. You decide when you teach and which students to accept.",
      },
      {
        q: "Is there a commission or fee?",
        a: "Currently, Mwalimu Wangu charges no commission. We may introduce a platform fee in future phases, and teachers will be informed well in advance of any changes.",
      },
    ],
  },
  {
    category: "General",
    items: [
      {
        q: "What languages are taught on Mwalimu Wangu?",
        a: "Our platform focuses exclusively on Swahili (Kiswahili). This allows us to maintain deep expertise and quality in one language rather than spreading thin across many.",
      },
      {
        q: "Is Mwalimu Wangu available worldwide?",
        a: "Yes — both students and teachers from anywhere in the world are welcome. Lessons take place online via video call, so geography is no barrier.",
      },
      {
        q: "How do I contact Mwalimu Wangu?",
        a: "Use our Contact page or email us at hello@mwalimuwangu.com. We aim to respond within 24 hours on weekdays.",
      },
    ],
  },
  {
    category: "Technical",
    items: [
      {
        q: "What video platforms are used for lessons?",
        a: "Teachers and students agree on a platform directly. Popular choices include Zoom, Google Meet, Microsoft Teams, and Skype. Lessons can also be conducted via WhatsApp video for simplicity.",
      },
      {
        q: "I'm having trouble with the website. What should I do?",
        a: "Please contact us at hello@mwalimuwangu.com or use the Contact page. Describe the issue and include your browser and device type if possible.",
      },
    ],
  },
];

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

export default function FaqPage() {
  return (
    <PageWrapper>
      <div className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold font-heading mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-indigo-100 text-lg">
            Everything you need to know about learning and teaching on Mwalimu
            Wangu.
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
                className="h-6 w-1.5 rounded-full bg-indigo-600 inline-block"
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

        <div className="bg-indigo-50 rounded-2xl p-8 text-center">
          <h3 className="font-bold text-slate-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            Can&apos;t find what you&apos;re looking for? Our team is happy to
            help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
