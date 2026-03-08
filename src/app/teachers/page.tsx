import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";
import TeachersClient from "./TeachersClient";
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
  return (
    <PageWrapper>
      <TeachersClient initialTeachers={teachers} />
    </PageWrapper>
  );
}
