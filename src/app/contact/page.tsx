import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";
import ContactForm from "./ContactForm";
import { Mail, Clock, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Mwalimu Wangu — whether you want to learn Swahili, become a teacher, or have a general question.",
};

export default function ContactPage() {
  return (
    <PageWrapper>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold font-heading mb-4">Get in Touch</h1>
          <p className="text-indigo-100 text-lg">
            Have a question? We'd love to hear from you. Send us a message and we'll
            respond as soon as possible.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-900 mb-6">
                Contact Information
              </h2>
            </div>

            {[
              {
                icon: Mail,
                title: "Email",
                value: "hello@mwalimuwangu.com",
                sub: "We read every message",
              },
              {
                icon: Clock,
                title: "Response Time",
                value: "Within 24 hours",
                sub: "Monday – Friday",
              },
              {
                icon: MessageSquare,
                title: "For Teachers",
                value: "Apply via the form",
                sub: "Select 'Become a Teacher'",
              },
            ].map(({ icon: Icon, title, value, sub }) => (
              <div key={title} className="flex gap-4 p-5 bg-slate-50 rounded-2xl">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-indigo-700" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{title}</p>
                  <p className="text-indigo-700 font-medium text-sm">{value}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}

            <div className="bg-indigo-50 rounded-2xl p-5">
              <p className="text-sm font-semibold text-indigo-900 mb-2">
                Looking for a teacher?
              </p>
              <p className="text-sm text-indigo-700">
                Browse our{" "}
                <a href="/teachers" className="underline font-semibold">
                  teacher directory
                </a>{" "}
                to find and contact a teacher directly.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
