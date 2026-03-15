import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import TeacherCard from "@/components/sections/TeacherCard";
import JsonLd from "@/components/seo/JsonLd";
import BlogCTA from "@/components/seo/BlogCTA";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ArrowRight } from "@/components/ui/icons";
import type { Teacher } from "@/types";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://swahili-tutors.com";

interface FaqItem {
  q: string;
  a: string;
}

interface NicheLandingPageProps {
  title: string;
  subtitle: string;
  contentSections: { heading: string; body: string }[];
  teachers: Teacher[];
  faqs: FaqItem[];
  slug: string;
}

export default function NicheLandingPage({
  title,
  subtitle,
  contentSections,
  teachers,
  faqs,
  slug,
}: NicheLandingPageProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Swahili Tutors", item: `${BASE}/teachers` },
      { "@type": "ListItem", position: 3, name: title },
    ],
  };

  return (
    <PageWrapper>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold font-heading mb-4">
            {title}
          </h1>
          <p className="text-indigo-100 text-lg mb-8">{subtitle}</p>
          <Link
            href="/teachers"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Browse All Tutors <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Content sections */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
          {contentSections.map(({ heading, body }, i) => (
            <ScrollReveal key={i} delay={i * 60}>
              <h2 className="text-2xl font-bold font-heading text-slate-900 mb-4">
                {heading}
              </h2>
              <p className="text-slate-600 leading-relaxed">{body}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Teachers */}
      <section className="py-16 bg-slate-50" aria-labelledby="niche-teachers-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <h2 id="niche-teachers-heading" className="text-3xl font-bold font-heading text-slate-900">
                Recommended Tutors
              </h2>
              <p className="text-slate-500 mt-1">Teachers who specialise in this area</p>
            </div>
            <Link
              href="/teachers"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 shrink-0"
            >
              View all &rarr;
            </Link>
          </div>
          {teachers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teachers.map((teacher, i) => (
                <ScrollReveal key={teacher.id} delay={i * 80}>
                  <TeacherCard teacher={teacher} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
              <p className="text-slate-500 mb-4">No tutors matched this specialty yet.</p>
              <Link href="/teachers" className="text-indigo-600 font-semibold hover:text-indigo-700">
                Browse all available tutors &rarr;
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white" aria-labelledby="niche-faq-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 id="niche-faq-heading" className="text-2xl font-bold font-heading text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group border border-slate-100 rounded-xl">
                <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer font-medium text-slate-900 text-sm hover:bg-slate-50 transition-colors">
                  {q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform shrink-0">&#9662;</span>
                </summary>
                <p className="px-6 pb-4 text-sm text-slate-500 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-4 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <BlogCTA />
        </div>
      </section>
    </PageWrapper>
  );
}
