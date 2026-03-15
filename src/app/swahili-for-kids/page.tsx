import type { Metadata } from "next";
import NicheLandingPage from "@/components/seo/NicheLandingPage";
import { getTeachersBySpecialization, getFeaturedTeachers } from "@/lib/supabase/queries";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://swahili-tutors.com";

export const metadata: Metadata = {
  title: "Swahili Lessons for Kids | Fun Online Classes",
  description:
    "Fun, engaging Swahili lessons for kids and young learners aged 5-15. Native-speaking tutors use games, songs, and stories to teach children Swahili in a safe online environment.",
  alternates: { canonical: `${BASE}/swahili-for-kids` },
  openGraph: {
    title: "Swahili Lessons for Kids & Young Learners | Swahili Tutors",
    description: "Fun, engaging Swahili lessons for children with patient native-speaking tutors.",
  },
};

export default async function SwahiliForKidsPage() {
  let teachers = await getTeachersBySpecialization("Kids & Young Learners");
  if (teachers.length === 0) teachers = await getFeaturedTeachers();

  return (
    <NicheLandingPage
      title="Swahili Lessons for Kids & Young Learners"
      subtitle="Fun, engaging lessons that help children connect with their heritage or discover a new language."
      slug="swahili-for-kids"
      teachers={teachers}
      contentSections={[
        {
          heading: "Why Children Should Learn Swahili",
          body: "Children's brains are wired for language acquisition. Starting Swahili early gives kids a lifelong advantage — whether they're connecting with family heritage, preparing for future travel, or simply gaining the cognitive benefits of bilingualism. Research shows that children who learn a second language develop better problem-solving skills, improved memory, and greater cultural empathy. Swahili, with its phonetic spelling and regular grammar, is an ideal first foreign language for young learners.",
        },
        {
          heading: "Our Teaching Approach for Children",
          body: "Our kid-friendly tutors make learning Swahili an adventure. Lessons for young learners (ages 5-15) include Swahili songs and rhymes, interactive games and storytelling, colourful visual aids and flashcards, role-playing everyday scenarios, and age-appropriate cultural lessons about East Africa. Sessions are shorter (25-30 minutes for younger children) to match attention spans, and tutors adjust their pace and energy to keep kids engaged and excited about learning.",
        },
        {
          heading: "For Heritage Speakers and New Learners",
          body: "Many families in the diaspora want their children to speak Swahili to stay connected to their roots. Our tutors are experienced in working with heritage speakers who may understand some Swahili but need help with speaking and literacy. We also welcome children with no Swahili background at all — our tutors know how to make the language accessible and fun regardless of starting point.",
        },
      ]}
      faqs={[
        { q: "What age can children start Swahili lessons?", a: "We recommend starting from age 5 for structured lessons. Children aged 5-8 typically do 25-minute sessions, while older children (9-15) can handle standard 45-60 minute lessons." },
        { q: "Do parents need to be present during lessons?", a: "For children under 8, we recommend a parent nearby. Older children can participate independently. All sessions take place via video call so parents can observe if they wish." },
        { q: "My child understands some Swahili but doesn't speak it. Can you help?", a: "Absolutely! This is very common with heritage speakers. Our tutors are experienced at building speaking confidence in children who have passive understanding of Swahili." },
        { q: "Are the tutors experienced with children?", a: "Yes. We specifically filter for tutors who have experience teaching children and young learners. They use age-appropriate methods, games, and positive reinforcement." },
      ]}
    />
  );
}
