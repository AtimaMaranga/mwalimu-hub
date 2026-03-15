import type { Metadata } from "next";
import NicheLandingPage from "@/components/seo/NicheLandingPage";
import { getTeachersBySpecialization, getFeaturedTeachers } from "@/lib/supabase/queries";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://swahili-tutors.com";

export const metadata: Metadata = {
  title: "Conversational Swahili Classes Online | Speak with Confidence",
  description:
    "Build real Swahili speaking confidence with conversational lessons from native tutors. Practice everyday dialogue, improve pronunciation, and think in Swahili through immersive 1-on-1 sessions.",
  alternates: { canonical: `${BASE}/conversational-swahili` },
  openGraph: {
    title: "Conversational Swahili: Speak Fluently | Swahili Tutors",
    description: "Build real speaking confidence with native Swahili tutors through immersive conversational practice.",
  },
};

export default async function ConversationalSwahiliPage() {
  let teachers = await getTeachersBySpecialization("Conversational");
  if (teachers.length === 0) teachers = await getFeaturedTeachers();

  return (
    <NicheLandingPage
      title="Conversational Swahili: Speak Fluently"
      subtitle="Stop studying grammar in isolation — start having real conversations with native speakers."
      slug="conversational-swahili"
      teachers={teachers}
      contentSections={[
        {
          heading: "Why Conversation Practice Is Essential",
          body: "You can study Swahili grammar for years and still freeze up in a real conversation. The gap between textbook knowledge and real-world fluency can only be bridged by speaking practice with a native speaker. Our conversational Swahili lessons are designed to get you talking from day one. You'll build the muscle memory, listening skills, and confidence that come only from real dialogue — not drills and worksheets.",
        },
        {
          heading: "What Conversational Lessons Include",
          body: "Each lesson is a guided conversation on topics that matter to you — travel, culture, daily life, current events, or your specific interests. Your tutor will introduce new vocabulary naturally, correct your pronunciation in real time, teach you colloquial expressions and slang that textbooks miss, and help you develop the ability to think in Swahili rather than translating from English. You'll also learn to navigate common social situations like greetings, small talk, and expressing opinions.",
        },
        {
          heading: "From Intermediate to Fluent",
          body: "Conversational lessons are perfect for learners who already know some Swahili basics but feel stuck at the intermediate plateau. Our tutors know exactly how to push you past that plateau — through varied conversation topics, increasing complexity, reduced English usage, and exposure to different Swahili dialects and accents. Many students report a breakthrough in fluency within their first month of regular conversational practice.",
        },
      ]}
      faqs={[
        { q: "Do I need to know some Swahili already?", a: "Conversational lessons work best with at least basic Swahili knowledge. If you're a complete beginner, we recommend starting with beginner lessons first, then transitioning to conversational practice after 4-6 weeks." },
        { q: "What topics will we discuss?", a: "Anything you like! Common topics include daily life, travel experiences, news, culture, food, family, and hobbies. Your tutor will also introduce topics designed to expand your vocabulary in useful areas." },
        { q: "Will the tutor correct my mistakes?", a: "Yes, but naturally. Your tutor will prioritise communication flow while noting errors for gentle correction. The goal is to build confidence, not create anxiety about making mistakes." },
        { q: "How often should I take conversational lessons?", a: "For best results, 2-3 sessions per week. Consistency is more important than session length — regular short sessions build fluency faster than occasional long ones." },
      ]}
    />
  );
}
