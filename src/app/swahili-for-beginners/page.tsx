import type { Metadata } from "next";
import NicheLandingPage from "@/components/seo/NicheLandingPage";
import { getTeachersBySpecialization, getFeaturedTeachers } from "@/lib/supabase/queries";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://swahili-tutors.com";

export const metadata: Metadata = {
  title: "Swahili Lessons for Beginners | Start from Zero",
  description:
    "Start learning Swahili from scratch with expert native tutors. Personalized beginner lessons covering greetings, grammar basics, and everyday conversation. Book a trial lesson today.",
  alternates: { canonical: `${BASE}/swahili-for-beginners` },
  openGraph: {
    title: "Swahili Lessons for Beginners | Start from Zero | Swahili Tutors",
    description: "Start learning Swahili from scratch with personalized 1-on-1 lessons from native speakers.",
  },
};

export default async function SwahiliForBeginnersPage() {
  let teachers = await getTeachersBySpecialization("Conversational");
  if (teachers.length === 0) teachers = await getFeaturedTeachers();

  return (
    <NicheLandingPage
      title="Swahili Lessons for Beginners"
      subtitle="No prior knowledge needed — start from zero with a patient native speaker."
      slug="swahili-for-beginners"
      teachers={teachers}
      contentSections={[
        {
          heading: "Why Learn Swahili with a Tutor?",
          body: "Learning Swahili from scratch can feel overwhelming when you try to do it alone. A dedicated tutor gives you a structured learning path tailored to your pace. You'll learn correct pronunciation from day one, build confidence with real conversation practice, and get instant feedback — something no app or textbook can provide. Our tutors specialise in taking complete beginners from 'Habari' to full conversations.",
        },
        {
          heading: "What Beginner Lessons Cover",
          body: "Your first lessons will introduce you to Swahili greetings, common phrases, and the building blocks of grammar. You'll learn the noun class system (simpler than it sounds!), basic sentence structure, numbers, and everyday vocabulary. Most importantly, you'll start speaking from lesson one. Our tutors use immersive techniques to build your listening comprehension and speaking confidence simultaneously.",
        },
        {
          heading: "How Fast Can Beginners Progress?",
          body: "With consistent weekly lessons, most beginners can hold basic conversations within 8-12 weeks. Swahili has remarkably regular grammar and phonetic spelling, making it one of the easiest African languages for English speakers to learn. Many students are surprised at how quickly they progress compared to other languages they've tried.",
        },
      ]}
      faqs={[
        { q: "Do I need any prior Swahili knowledge?", a: "Not at all. Our beginner-friendly tutors start from absolute zero — greetings, alphabet, and basic phrases. No experience required." },
        { q: "How long does it take to learn basic Swahili?", a: "With 2-3 lessons per week, most students can hold simple conversations in 2-3 months. Swahili has regular grammar and phonetic spelling, making it faster to learn than many other languages." },
        { q: "What materials do I need?", a: "Just a computer or tablet with internet access. Your tutor will provide all learning materials, vocabulary lists, and exercises." },
        { q: "Can I try a lesson before committing?", a: "Yes! Most of our tutors offer a discounted trial lesson so you can find the right fit before committing to regular sessions." },
      ]}
    />
  );
}
