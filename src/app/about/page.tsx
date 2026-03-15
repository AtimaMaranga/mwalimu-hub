import type { Metadata } from "next";
import Link from "next/link";
import { Target, Heart, Globe, Users } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import JsonLd from "@/components/seo/JsonLd";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://swahili-tutors.com";

export const metadata: Metadata = {
  title: "About Swahili Tutors | Our Mission to Teach Swahili Globally",
  description:
    "Swahili Tutors is the world's first platform dedicated exclusively to Swahili language instruction. Learn about our mission to connect learners with native Swahili speakers.",
  alternates: { canonical: `${BASE}/about` },
};

const values = [
  {
    icon: Heart,
    title: "Authenticity",
    desc: "We believe language is inseparable from culture. Our teachers don't just teach words — they share context, stories, and meaning.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    desc: "Quality Swahili education should be available to anyone with an internet connection, regardless of where they live.",
  },
  {
    icon: Users,
    title: "Community",
    desc: "We're building a global community of learners and teachers who are passionate about Swahili and East African culture.",
  },
  {
    icon: Target,
    title: "Excellence",
    desc: "We carefully vet every teacher on our platform to ensure learners receive the best possible educational experience.",
  },
];

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Swahili Tutors",
    description:
      "Swahili Tutors is the world's first platform dedicated exclusively to Swahili language instruction.",
    mainEntity: {
      "@type": "EducationalOrganization",
      name: "Swahili Tutors",
      url: BASE,
      description:
        "The world's first platform dedicated exclusively to connecting learners with native Swahili speakers for 1-on-1 online lessons.",
      foundingDate: "2024",
      areaServed: "Worldwide",
      knowsLanguage: ["sw", "en"],
      sameAs: [
        "https://twitter.com/swahilitutors",
        "https://www.facebook.com/swahilitutors",
      ],
    },
  };

  return (
    <PageWrapper>
      <JsonLd data={aboutSchema} />
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold font-heading mb-4">
            About Swahili Tutors
          </h1>
          <p className="text-indigo-100 text-lg">
            We are on a mission to connect every Swahili learner with the right teacher.
          </p>
        </div>
      </div>

      {/* Mission */}
      <section aria-labelledby="mission-heading" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                id="mission-heading"
                className="text-3xl font-bold font-heading text-slate-900 mb-6"
              >
                Our Mission
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Swahili Tutors was founded with a simple belief: the best
                  way to learn a language is from someone who lives and breathes
                  it.
                </p>
                <p>
                  We connect motivated learners worldwide with qualified, vetted
                  native Swahili teachers. Whether you want to prepare for a
                  trip to East Africa, expand your career opportunities,
                  reconnect with your heritage, or simply discover one of the
                  world&apos;s most beautiful languages, we have a teacher for
                  you.
                </p>
                <p>
                  Our platform was built by people who understand the
                  transformative power of language learning — and who believe
                  that Swahili deserves a global stage.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl p-8">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "200M+", label: "Swahili speakers" },
                  { value: "14+", label: "Countries served" },
                  { value: "4.9★", label: "Teacher avg rating" },
                  { value: "100%", label: "Vetted teachers" },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="text-center p-4 bg-white rounded-2xl shadow-sm"
                  >
                    <p className="text-2xl font-bold text-indigo-700">{value}</p>
                    <p className="text-xs text-slate-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section
        aria-labelledby="story-heading"
        className="py-16 bg-slate-50"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2
            id="story-heading"
            className="text-2xl font-bold font-heading text-slate-900 mb-6 text-center"
          >
            Why Swahili Matters
          </h2>
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm space-y-4 text-slate-600 leading-relaxed">
            <p>
              Swahili (Kiswahili) is spoken by over 200 million people across
              East and Central Africa. It is the official language of Kenya,
              Tanzania, Uganda, and Rwanda, and a working language of the
              African Union. Yet despite its reach and cultural richness,
              Swahili remains underrepresented in the global language learning
              market.
            </p>
            <p>
              We founded Swahili Tutors to change that. As East Africa becomes
              one of the world&apos;s most dynamic regions — economically,
              culturally, and politically — Swahili fluency is becoming an
              increasingly valuable skill. We want to be the platform that
              connects the world to East Africa through its language.
            </p>
            <p>
              At the same time, Swahili teachers across the region possess
              extraordinary knowledge and skill, but lack access to a global
              audience. Swahili Tutors gives them that access — so they can
              share their expertise and build sustainable teaching careers.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section aria-labelledby="values-heading" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            id="values-heading"
            className="text-3xl font-bold font-heading text-slate-900 text-center mb-14"
          >
            Our Values
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6">
                <div className="h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-7 w-7 text-indigo-700" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-900 to-violet-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold font-heading mb-4">
            Join Our Community
          </h2>
          <p className="text-indigo-100 mb-8">
            Whether you want to learn Swahili or share your expertise,
            there&apos;s a place for you on Swahili Tutors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/teachers">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-indigo-700 hover:bg-indigo-50"
              >
                Find a Teacher
              </Button>
            </Link>
            <Link href="/become-a-teacher">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                Become a Teacher
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
