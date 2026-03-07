import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  MessageCircle,
  Video,
  CheckCircle,
  UserPlus,
  BookOpen,
  Star,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how to find a Swahili teacher and start learning on Mwalimu Wangu in just a few simple steps.",
};

const studentSteps = [
  {
    step: "01",
    icon: Search,
    title: "Browse Teacher Profiles",
    desc: "Explore our directory of verified native Swahili teachers. Use filters to narrow down by specialisation, price range, and availability. Read bios, watch video introductions, and check ratings.",
  },
  {
    step: "02",
    icon: MessageCircle,
    title: "Contact Your Teacher",
    desc: "Found someone who looks like a good fit? Send them a message directly from their profile. Tell them about your goals, current level, and preferred schedule. Most teachers respond within 24 hours.",
  },
  {
    step: "03",
    icon: Video,
    title: "Agree on a Plan",
    desc: "Discuss your learning goals, lesson frequency, and payment directly with your teacher. There is no platform fee at this stage — it is a direct conversation between you and your teacher.",
  },
  {
    step: "04",
    icon: Star,
    title: "Start Learning!",
    desc: "Begin your Swahili lessons via video call (Zoom, Google Meet, or the teacher's preferred platform). Learn at your own pace and track your progress toward fluency.",
  },
];

const teacherSteps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Apply to Join",
    desc: "Submit your application on the Become a Teacher page. Share your background, qualifications, teaching experience, and what makes you unique as a Swahili educator.",
  },
  {
    step: "02",
    icon: CheckCircle,
    title: "Get Verified",
    desc: "Our team reviews your application within 48 hours. We verify your qualifications and may ask for a short sample lesson or interview. Approved teachers get a verified badge on their profile.",
  },
  {
    step: "03",
    icon: BookOpen,
    title: "Build Your Profile",
    desc: "Create a compelling profile with your photo, bio, teaching approach, specialisations, and hourly rate. Add a video introduction to give students a feel for your teaching style.",
  },
  {
    step: "04",
    icon: Star,
    title: "Start Teaching",
    desc: "Students will contact you directly. Accept the students that fit your schedule, agree on terms, and start teaching. Grow your reputation through great lessons and student reviews.",
  },
];

const faqs = [
  {
    q: "Is there a fee to use Mwalimu Wangu?",
    a: "Using the platform to find and contact teachers is completely free for students. Teachers pay no commission during our current phase. This may change in future as we grow.",
  },
  {
    q: "How do I pay for lessons?",
    a: "Payment is arranged directly between you and your teacher. Common methods include PayPal, bank transfer, M-Pesa, or other methods agreed between you. We don't process payments directly at this stage.",
  },
  {
    q: "What if I'm not happy with my first lesson?",
    a: "We recommend discussing a trial lesson with your teacher before committing to a full package. If issues arise, contact us and we'll do our best to help resolve the situation.",
  },
];

export default function HowItWorksPage() {
  return (
    <PageWrapper>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold font-heading mb-4">
            How It Works
          </h1>
          <p className="text-indigo-100 text-lg">
            Getting started on Mwalimu Wangu is simple. Here is everything you
            need to know.
          </p>
        </div>
      </div>

      {/* For Students */}
      <section
        aria-labelledby="students-heading"
        className="py-20 bg-white"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2
            id="students-heading"
            className="text-2xl font-bold font-heading text-slate-900 mb-10 flex items-center gap-3"
          >
            <span className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              S
            </span>
            For Students
          </h2>
          <div className="space-y-8">
            {studentSteps.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex gap-6">
                <div className="relative shrink-0 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow">
                    <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 mt-1">
                    {step}
                  </span>
                </div>
                <div className="pb-8 border-b border-slate-100 flex-1">
                  <h3 className="font-bold text-slate-900 text-lg mb-2">
                    {title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-sm">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/teachers">
              <Button variant="primary" size="lg">
                Find a Teacher →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Teachers */}
      <section
        aria-labelledby="teachers-section-heading"
        className="py-20 bg-slate-50"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2
            id="teachers-section-heading"
            className="text-2xl font-bold font-heading text-slate-900 mb-10 flex items-center gap-3"
          >
            <span className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center text-white text-sm font-bold">
              T
            </span>
            For Teachers
          </h2>
          <div className="space-y-8">
            {teacherSteps.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex gap-6">
                <div className="relative shrink-0 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow">
                    <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold text-violet-600 mt-1">
                    {step}
                  </span>
                </div>
                <div className="pb-8 border-b border-slate-100 flex-1">
                  <h3 className="font-bold text-slate-900 text-lg mb-2">
                    {title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-sm">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/become-a-teacher">
              <Button variant="secondary" size="lg">
                Apply to Teach →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2
            id="faq-heading"
            className="text-2xl font-bold font-heading text-slate-900 mb-8 text-center"
          >
            Common Questions
          </h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-slate-50 rounded-2xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">{q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/faq"
              className="text-indigo-600 font-semibold hover:text-indigo-800 text-sm"
            >
              View all frequently asked questions →
            </Link>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
