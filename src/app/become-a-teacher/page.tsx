import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";
import BecomeTeacherForm from "./BecomeTeacherForm";
import {
  CheckCircle,
  DollarSign,
  Clock,
  Globe,
  Heart,
  Users,
} from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://mwalimuwangu.com";

export const metadata: Metadata = {
  title: "Teach Swahili Online | Become a Swahili Tutor on Mwalimu Wangu",
  description:
    "Turn your Swahili expertise into a rewarding online teaching career. Apply to become a verified Swahili tutor on Mwalimu Wangu and reach motivated students worldwide.",
  alternates: { canonical: `${BASE}/become-a-teacher` },
};

const benefits = [
  {
    icon: DollarSign,
    title: "Set Your Own Rate",
    desc: "You decide your hourly rate — from $15 to $50+ depending on your experience and specialisation.",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    desc: "Teach whenever suits you. Set your own availability and accept only the students that fit your schedule.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    desc: "Connect with motivated Swahili learners from the UK, USA, Europe, and beyond — all online.",
  },
  {
    icon: Heart,
    title: "Share Your Culture",
    desc: "Beyond language, you're sharing East African culture, traditions, and ways of thinking with the world.",
  },
  {
    icon: Users,
    title: "Growing Community",
    desc: "Join a supportive network of Swahili educators and benefit from shared resources and community.",
  },
];

const requirements = [
  "Native or near-native Swahili proficiency",
  "Good spoken and written English",
  "Stable internet connection for video lessons",
  "Commitment to at least 5 hours per week",
  "Patience, enthusiasm, and a passion for teaching",
  "Relevant qualifications or experience (preferred)",
];

export default function BecomeTeacherPage() {
  return (
    <PageWrapper>
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold font-heading mb-4">
            Become a Swahili Teacher
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Share your language, share your culture. Join our growing community
            of Swahili educators and help learners worldwide discover the beauty
            of Swahili.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <section
        id="benefits"
        aria-labelledby="benefits-heading"
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2
              id="benefits-heading"
              className="text-3xl font-bold font-heading text-slate-900 mb-4"
            >
              Why Teach with Mwalimu Wangu?
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              We make it easy to share your Swahili expertise and build a
              fulfilling teaching practice — on your own terms.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-4 p-6 rounded-2xl bg-slate-50 hover:bg-indigo-50 transition-colors group"
              >
                <div className="h-12 w-12 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="h-6 w-6 text-indigo-700" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section
        id="requirements"
        aria-labelledby="reqs-heading"
        className="py-16 bg-slate-50"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2
            id="reqs-heading"
            className="text-2xl font-bold font-heading text-slate-900 mb-6 text-center"
          >
            What We Look For
          </h2>
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <ul className="space-y-3">
              {requirements.map((req) => (
                <li key={req} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle
                    className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-sm">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section
        aria-labelledby="apply-heading"
        className="py-20 bg-white"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2
              id="apply-heading"
              className="text-3xl font-bold font-heading text-slate-900 mb-4"
            >
              Apply to Teach
            </h2>
            <p className="text-slate-500">
              Fill in the form below and we&apos;ll review your application
              within 48 hours.
            </p>
          </div>
          <BecomeTeacherForm />
        </div>
      </section>
    </PageWrapper>
  );
}
