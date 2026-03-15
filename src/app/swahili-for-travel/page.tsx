import type { Metadata } from "next";
import NicheLandingPage from "@/components/seo/NicheLandingPage";
import { getTeachersBySpecialization, getFeaturedTeachers } from "@/lib/supabase/queries";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://swahili-tutors.com";

export const metadata: Metadata = {
  title: "Swahili for Travel & Safari | Essential Phrases & Tutors",
  description:
    "Learn essential Swahili phrases for your East African adventure. Travel-focused lessons covering safari vocabulary, bargaining, directions, and cultural etiquette with native tutors.",
  alternates: { canonical: `${BASE}/swahili-for-travel` },
  openGraph: {
    title: "Swahili for Travel & Safari | Swahili Tutors",
    description: "Learn essential Swahili for your Kenya or Tanzania trip with native-speaking tutors.",
  },
};

export default async function SwahiliForTravelPage() {
  let teachers = await getTeachersBySpecialization("Travel");
  if (teachers.length === 0) teachers = await getFeaturedTeachers();

  return (
    <NicheLandingPage
      title="Learn Swahili for Your East African Adventure"
      subtitle="Make your Kenya, Tanzania, or Zanzibar trip unforgettable by speaking the local language."
      slug="swahili-for-travel"
      teachers={teachers}
      contentSections={[
        {
          heading: "Why Learning Swahili Enhances Your Trip",
          body: "Speaking even basic Swahili transforms your travel experience in East Africa. Locals light up when they hear a visitor speak their language — prices drop at markets, invitations to meals appear, and doors open that stay closed to typical tourists. Whether you're on safari in the Serengeti, exploring Stone Town in Zanzibar, or hiking Mount Kilimanjaro, a few Swahili phrases make every interaction richer and more authentic.",
        },
        {
          heading: "Essential Phrases You'll Learn",
          body: "Our travel-focused lessons cover greetings (Habari! Mambo!), bargaining at markets (Bei gani? — How much?), ordering food (Nataka chakula — I want food), asking for directions, safari animal names, and cultural etiquette. You'll also learn the subtle art of Swahili politeness — knowing when to use 'Shikamoo' versus 'Habari' can make a real difference in how you're received.",
        },
        {
          heading: "Crash Course or Full Preparation",
          body: "Planning a trip in 2 weeks? Our tutors can run an intensive crash course covering survival phrases and cultural tips. Have more time? Spread lessons over a few months to build real conversational ability. Either way, you'll arrive feeling confident and prepared, with the ability to connect with local people on a human level.",
        },
      ]}
      faqs={[
        { q: "How many lessons do I need before my trip?", a: "For basic travel phrases, 4-6 lessons over 2-3 weeks is enough. For conversational ability, 12-16 lessons over 2-3 months is recommended." },
        { q: "Is Swahili spoken in both Kenya and Tanzania?", a: "Yes! Swahili is the national language of both Kenya and Tanzania, and widely spoken in Uganda, Rwanda, and parts of the DRC and Mozambique." },
        { q: "Will I learn safari-specific vocabulary?", a: "Absolutely. Your tutor can teach you animal names, nature vocabulary, and phrases useful for safari guides and camp staff." },
        { q: "Can I schedule intensive lessons before my trip?", a: "Yes, many tutors offer flexible scheduling including daily lessons for intensive preparation before a trip." },
      ]}
    />
  );
}
