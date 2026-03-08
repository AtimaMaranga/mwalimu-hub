import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import FaqContent from "./FaqContent";
import { faqs } from "./faq-data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://mwalimuwangu.com";

export const metadata: Metadata = {
  title: "Swahili Learning FAQ — Common Questions Answered",
  description:
    "Get answers to the most common questions about learning Swahili online, finding a tutor, lesson costs, payment, and how Mwalimu Wangu works.",
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
