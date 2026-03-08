import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";
import TeachersClient from "./TeachersClient";
import JsonLd from "@/components/seo/JsonLd";
import { getTeachers } from "@/lib/supabase/queries";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://mwalimuwangu.com";

export const metadata: Metadata = {
  title: "Find a Swahili Tutor Online | Browse Native Swahili Teachers",
  description:
    "Browse verified native Swahili teachers. Filter by specialisation, price and availability. Book 1-on-1 online Swahili lessons from $15/hour — for beginners to advanced.",
  alternates: { canonical: `${BASE}/teachers` },
};

export default async function TeachersPage() {
  const teachers = await getTeachers();

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Native Swahili Teachers Online",
    description: "Verified native Swahili teachers available for 1-on-1 online lessons",
    numberOfItems: teachers.length,
    itemListElement: teachers.slice(0, 10).map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      url: `${BASE}/teachers/${t.slug}`,
    })),
  };

  return (
    <PageWrapper>
      <JsonLd data={itemListSchema} />
      <TeachersClient initialTeachers={teachers} />
    </PageWrapper>
  );
}
