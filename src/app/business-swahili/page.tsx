import type { Metadata } from "next";
import NicheLandingPage from "@/components/seo/NicheLandingPage";
import { getTeachersBySpecialization, getFeaturedTeachers } from "@/lib/supabase/queries";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://swahili-tutors.com";

export const metadata: Metadata = {
  title: "Business Swahili Lessons | Professional Communication",
  description:
    "Master Business Swahili for professional communication in East Africa. Learn formal greetings, negotiation language, email writing, and meeting vocabulary with expert native tutors.",
  alternates: { canonical: `${BASE}/business-swahili` },
  openGraph: {
    title: "Business Swahili for Professionals | Swahili Tutors",
    description: "Master professional Swahili communication with expert native tutors.",
  },
};

export default async function BusinessSwahiliPage() {
  let teachers = await getTeachersBySpecialization("Business");
  if (teachers.length === 0) teachers = await getFeaturedTeachers();

  return (
    <NicheLandingPage
      title="Business Swahili for Professionals"
      subtitle="Communicate confidently in East African business environments with native-speaker guidance."
      slug="business-swahili"
      teachers={teachers}
      contentSections={[
        {
          heading: "Why Business Swahili Matters",
          body: "East Africa is one of the world's fastest-growing economic regions. Kenya, Tanzania, and Rwanda are attracting international investment, and Swahili is the lingua franca of business across the region. Whether you're managing a team in Nairobi, negotiating partnerships in Dar es Salaam, or expanding into East African markets, Business Swahili helps you build trust, close deals, and navigate professional culture.",
        },
        {
          heading: "What You'll Learn",
          body: "Business Swahili lessons cover formal greetings and introductions, meeting and presentation language, email and letter writing conventions, negotiation and persuasion phrases, telephone etiquette, and industry-specific terminology. You'll also learn the unspoken cultural rules — like the importance of relationship-building before business discussions — that are essential for success in East African markets.",
        },
        {
          heading: "Tailored to Your Industry",
          body: "Our tutors can customise lessons for your specific industry — from development and NGO work to finance, technology, tourism, and trade. Real-world role-plays and case studies help you apply what you learn immediately. Many of our students report using new Swahili phrases in meetings within the same week they learn them.",
        },
      ]}
      faqs={[
        { q: "Is Business Swahili different from everyday Swahili?", a: "Yes. Business Swahili uses more formal vocabulary, polite verb forms, and industry-specific terminology. Our tutors teach you the register appropriate for professional settings." },
        { q: "I already speak basic Swahili. Can I go straight to business topics?", a: "Absolutely. Your tutor will assess your level and start from where you are. No need to repeat basics if you're already conversational." },
        { q: "Do you offer lessons for corporate teams?", a: "Yes! Contact us about group rates for corporate teams expanding into East African markets." },
        { q: "How quickly can I become functional in Business Swahili?", a: "With prior Swahili knowledge, most professionals achieve working proficiency in business contexts within 2-3 months of regular lessons." },
      ]}
    />
  );
}
