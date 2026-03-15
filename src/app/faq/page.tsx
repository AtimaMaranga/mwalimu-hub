import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import FaqContent from "./FaqContent";
import { faqs } from "./faq-data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://swahili-tutors.com";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about Swahili lessons, pricing, booking tutors, and how our platform works.",
  alternates: { canonical: `${BASE}/faq` },
};

export default function FaqPage() {
  const allItems = faqs.flatMap((cat) => cat.items);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      <FaqContent />
    </>
  );
}
