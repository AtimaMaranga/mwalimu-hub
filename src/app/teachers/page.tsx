import type { Metadata } from "next";
import PageWrapper from "@/components/layout/PageWrapper";
import TeachersClient from "./TeachersClient";
import { getTeachers } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Find a Swahili Teacher",
  description:
    "Browse verified native Swahili teachers. Filter by specialisation, price, and availability. Start learning today.",
};

export default async function TeachersPage() {
  const teachers = await getTeachers();
  return (
    <PageWrapper>
      <TeachersClient initialTeachers={teachers} />
    </PageWrapper>
  );
}
