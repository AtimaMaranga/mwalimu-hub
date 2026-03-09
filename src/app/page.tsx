import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { Search, MessageCircle, Video, Globe, TrendingUp, Heart, Briefcase, GraduationCap, Users, Star, ArrowRight, CheckCircle } from "@/components/ui/icons";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import AnimatedStat from "@/components/ui/AnimatedStat";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TeacherCard from "@/components/sections/TeacherCard";
import BlogCard from "@/components/sections/BlogCard";
import JsonLd from "@/components/seo/JsonLd";
import { getFeaturedTeachers, getBlogPosts } from "@/lib/supabase/queries";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://swahili-tutors.com";

export const metadata: Metadata = {
  title: "Learn Swahili Online with Native Teachers | Swahili Tutors",
  description:
    "Connect with verified native Swahili teachers for personalised 1-on-1 online lessons. Learn Swahili for travel, business, family or culture — from $15/hour. Start today.",
  alternates: { canonical: BASE },
};

const stats = [
  { value: "200M+", label: "Swahili speakers worldwide" },
  { value: "5+",    label: "Expert native teachers" },
  { value: "98%",   label: "Student satisfaction" },
  { value: "14",    label: "Countries reached" },
];

const goals = ["Travel", "Business", "Culture", "Family & Roots", "Academic", "Beginners", "Kids", "Advanced"];

const steps = [
  { step: "01", icon: Search,        title: "Browse Teachers",      desc: "Explore verified native Swahili teachers. Filter by specialisation, price, and availability to find your perfect match." },
  { step: "02", icon: MessageCircle, title: "Contact & Schedule",   desc: "Message your preferred teacher, share your goals, and agree on a schedule that works around your life." },
  { step: "03", icon: Video,         title: "Start Learning",       desc: "Begin personalised lessons via video call. Track your progress and build real Swahili fluency fast." },
];

const testimonials = [
  { quote: "Within three months I was ordering food and navigating Nairobi without relying on anyone. Absolutely life-changing.", name: "James T.", role: "Traveller, United Kingdom", initials: "JT", color: "bg-amber-300" },
  { quote: "As a diaspora Kenyan, learning Swahili here helped me rebuild that bond with my family I had lost for years.", name: "Aisha N.", role: "Software Engineer, USA", initials: "AN", color: "bg-violet-300" },
  { quote: "My company expanded into East Africa and I needed business Swahili fast. Professional, focused, and effective.", name: "Marcus L.", role: "Business Development, Netherlands", initials: "ML", color: "bg-indigo-300" },
];

const heroTeachers = [
  { initial: "A", name: "Amina Odhiambo", spec: "Business Swahili", rating: 4.9, reviews: 124, price: "$25", gradient: "from-amber-400 to-orange-500" },
  { initial: "D", name: "David Kariuki",  spec: "Conversational",   rating: 5.0, reviews: 89,  price: "$20", gradient: "from-emerald-400 to-teal-600" },
  { initial: "F", name: "Fatuma Mwangi", spec: "Kids & Beginners", rating: 4.8, reviews: 201, price: "$18", gradient: "from-violet-400 to-purple-600" },
];

export default async function HomePage() {
  const [featuredTeachers, latestPosts] = await Promise.all([
    getFeaturedTeachers(),
    getBlogPosts(3),
  ]);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Swahili Tutors",
    url: BASE,
    logo: `${BASE}/og-image.png`,
    description:
      "Online marketplace connecting Swahili language learners with verified native Swahili teachers for personalised 1-on-1 online lessons.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@swahili-tutors.com",
      contactType: "customer service",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Swahili Tutors",
    url: BASE,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE}/teachers?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Online Swahili Lessons",
    description:
      "Personalised 1-on-1 Swahili lessons with verified native Swahili teachers via video call — for beginners, travellers, business professionals, and diaspora learners.",
    provider: { "@type": "Organization", name: "Swahili Tutors", url: BASE },
    serviceType: "Language Tutoring",
    areaServed: "Worldwide",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "15",
      highPrice: "50",
      offerCount: "5",
    },
  };

  return (
    <PageWrapper>
      <JsonLd data={orgSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={serviceSchema} />

      {/* ── HERO ── */}
      <section className="relative bg-[#f0ebe3] overflow-hidden" aria-label="Hero">
        {/* Decorative shapes */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-amber-300/50" />
          <div className="absolute top-20 right-48 w-64 h-64 rounded-full bg-violet-300/40" />
          <div className="absolute -bottom-24 right-24 w-80 h-80 rounded-full bg-indigo-200/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 lg:pt-24 lg:pb-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left */}
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black font-heading leading-[1.0] tracking-[-0.03em] text-slate-900 mb-6">
                Learn Swahili<br />
                from{" "}
                <span className="text-indigo-600">Native<br />Speakers</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
                Connect with qualified native Swahili teachers for personalised online lessons — anytime, anywhere in the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/teachers">
                  <button className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-xl transition-all active:scale-95 flex items-center gap-2">
                    Find a Teacher <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/become-a-teacher">
                  <button className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base rounded-xl border border-slate-200 transition-all">
                    Become a Teacher
                  </button>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2" aria-hidden="true">
                  {["#818cf8","#a78bfa","#f472b6","#fbbf24","#34d399"].map((c) => (
                    <div key={c} className="h-8 w-8 rounded-full ring-2 ring-[#f0ebe3]" style={{ background: c }} />
                  ))}
                </div>
                <p className="text-sm text-slate-500"><span className="text-slate-900 font-semibold">2,000+</span> learners already started</p>
              </div>
            </div>

            {/* Right — teacher cards with decorative shapes */}
            <div className="hidden lg:flex justify-center items-center" aria-hidden="true">
              <div className="relative w-80 h-[460px]">
                <div className="absolute inset-0 bg-violet-200/20 rounded-full blur-3xl scale-90" />
                {heroTeachers.map((t, i) => (
                  <div
                    key={t.name}
                    className="absolute w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/80 p-4"
                    style={{ top: i === 0 ? 0 : i === 1 ? 160 : 310, left: i === 1 ? "auto" : 8, right: i === 1 ? 0 : "auto", rotate: i === 0 ? "-3deg" : i === 1 ? "2.5deg" : "-1deg", zIndex: 30 - i * 10 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold shrink-0`}>{t.initial}</div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.spec}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-slate-800">{t.rating}</span>
                          <span className="text-xs text-slate-400">({t.reviews})</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs bg-indigo-50 text-indigo-700 rounded-full px-2.5 py-1 font-medium">Native speaker</span>
                      <span className="text-sm font-bold text-slate-900">{t.price}<span className="text-xs font-normal text-slate-400">/hr</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-white border-y border-slate-100" aria-label="Platform statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-slate-100">
            {stats.map(({ value, label }, i) => (
              <ScrollReveal key={label} delay={i * 80} className={`text-center ${i > 0 ? "lg:pl-8" : ""}`}>
                <AnimatedStat
                  value={value}
                  label={label}
                  valueClassName="text-3xl sm:text-4xl font-black font-heading text-slate-900"
                  labelClassName="text-slate-500 text-sm mt-1"
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── GOALS / SPECIALISATIONS ── */}
      <section className="py-24 bg-[#f0ebe3]" aria-labelledby="goals-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 id="goals-heading" className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-slate-900 tracking-[-0.03em] mb-12">
              Pick a goal to get started
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <div className="flex flex-wrap gap-3 justify-center">
              {goals.map((goal) => (
                <Link
                  key={goal}
                  href="/teachers"
                  className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 hover:border-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 transition-all text-sm"
                >
                  {goal}
                </Link>
              ))}
              <Link
                href="/teachers"
                className="px-6 py-3 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm"
              >
                All specialisations →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-[#f0ebe3]" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mb-14">
            <h2 id="testimonials-heading" className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-slate-900 tracking-[-0.03em] leading-tight max-w-2xl">
              Learners around the world have rated us 4.9/5
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, role, initials, color }, i) => (
              <ScrollReveal key={name} delay={i * 100}>
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
                  {/* Colored shape + avatar */}
                  <div className={`relative h-40 ${color} flex items-end justify-center pb-0 overflow-hidden`}>
                    <div className="absolute bottom-0 translate-y-1/2 h-20 w-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg z-10">
                      {initials}
                    </div>
                  </div>
                  <div className="pt-14 pb-8 px-6 text-center flex flex-col flex-1">
                    <p className="font-bold text-slate-900 text-lg">{name}</p>
                    <p className="text-slate-500 text-sm mb-5">{role}</p>
                    <div className="flex gap-1 justify-center mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-white" aria-labelledby="steps-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-14">
            <h2 id="steps-heading" className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-slate-900 tracking-[-0.03em]">
              Start learning in 3 steps
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map(({ step, icon: Icon, title, desc }, i) => (
              <ScrollReveal key={step} delay={i * 120}>
                <div className="bg-[#f0ebe3] rounded-3xl p-8 h-full">
                  {/* Visual area */}
                  <div className="h-40 mb-8 flex items-center justify-center relative">
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center ${
                      i === 0 ? "bg-amber-300" : i === 1 ? "bg-indigo-300" : "bg-violet-300"
                    }`}>
                      <Icon className="h-12 w-12 text-white" strokeWidth={1.5} />
                    </div>
                    <span className="absolute top-0 right-0 text-7xl font-black text-slate-200 leading-none font-heading select-none">{step}</span>
                  </div>
                  <h3 className="text-xl font-bold font-heading text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-600 leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/how-it-works">
              <button className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm">
                Learn how it works →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED TEACHERS ── */}
      <section className={`bg-[#f0ebe3] ${featuredTeachers.length > 0 ? "py-24" : "py-16"}`} aria-labelledby="teachers-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
            <div>
              <h2 id="teachers-heading" className="text-4xl sm:text-5xl font-black font-heading text-slate-900 tracking-[-0.03em]">
                Meet our teachers
              </h2>
              <p className="text-slate-600 mt-2 text-lg">Verified, native, and passionate about Swahili</p>
            </div>
            <Link href="/teachers">
              <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm shrink-0">
                Browse all teachers →
              </button>
            </Link>
          </ScrollReveal>

          {featuredTeachers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredTeachers.map((teacher, i) => (
                <ScrollReveal key={teacher.id} delay={i * 80}>
                  <TeacherCard teacher={teacher} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 mb-5">
                <Users className="h-8 w-8 text-indigo-300" />
              </div>
              <p className="text-xl font-bold text-slate-700 mb-2">Teachers coming soon</p>
              <p className="text-slate-500 max-w-xs mx-auto mb-6">We are onboarding our first teachers. Check back shortly.</p>
              <Link href="/become-a-teacher">
                <button className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all text-sm">
                  Become one of our first teachers →
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURE: NATIVE TEACHERS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: visual */}
            <ScrollReveal className="relative">
              <div className="relative h-80 flex items-center justify-center">
                <div className="absolute w-72 h-72 rounded-full bg-amber-200/60" />
                <div className="absolute w-48 h-48 rounded-full bg-violet-200/50 translate-x-16 translate-y-8" />
                <div className="relative z-10 bg-white rounded-2xl shadow-xl p-6 max-w-xs">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shrink-0">A</div>
                    <div>
                      <p className="font-bold text-slate-900">Amina Odhiambo</p>
                      <p className="text-xs text-slate-500">Business Swahili · Mombasa</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {Array.from({length: 5}).map((_,j) => <Star key={j} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-xs text-slate-500 italic">&ldquo;Amina is fantastic — I went from zero to holding business meetings in 6 months.&rdquo;</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs bg-indigo-50 text-indigo-600 rounded-full px-3 py-1 font-medium">Native speaker</span>
                    <span className="font-bold text-slate-900 text-sm">$25/hr</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            {/* Right: text */}
            <ScrollReveal delay={100}>
              <h2 className="text-4xl sm:text-5xl font-black font-heading text-slate-900 tracking-[-0.03em] leading-tight mb-6">
                Handpicked native teachers from $15/hour
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6 text-lg">
                We are very selective about who we accept as teachers — only qualified, native Swahili speakers who are passionate educators make it onto our platform.
              </p>
              <div className="space-y-3 mb-8">
                {["All teachers are verified native Swahili speakers", "Flexible scheduling around your timezone", "One-on-one personalised lessons", "No subscription — pay per lesson"].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle className="h-5 w-5 text-indigo-600 shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/teachers">
                <button className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 text-sm">
                  Find a teacher <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── BLOG POSTS ── */}
      {latestPosts.length > 0 && (
        <section className="py-24 bg-[#f0ebe3]" aria-labelledby="blog-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
              <div>
                <h2 id="blog-heading" className="text-4xl sm:text-5xl font-black font-heading text-slate-900 tracking-[-0.03em]">From our blog</h2>
                <p className="text-slate-600 mt-2 text-lg">Tips, guides, and stories to fuel your Swahili journey</p>
              </div>
              <Link href="/blog">
                <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm shrink-0">
                  Read all articles →
                </button>
              </Link>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((post, i) => (
                <ScrollReveal key={post.id} delay={i * 90}>
                  <BlogCard post={post} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FINAL CTA ── */}
      <section className="py-32 bg-[#f0ebe3] relative overflow-hidden" aria-labelledby="cta-heading">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -left-20 top-0 w-80 h-80 rounded-full bg-violet-300/40" />
          <div className="absolute -right-20 bottom-0 w-96 h-96 rounded-full bg-amber-300/40" />
          <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-indigo-200/30" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <ScrollReveal>
            <h2 id="cta-heading" className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-slate-900 tracking-[-0.03em] leading-tight mb-6">
              Find your teacher and start today
            </h2>
            <p className="text-slate-600 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
              Join thousands of learners worldwide discovering the beauty of Swahili with expert native teachers on Swahili Tutors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link href="/teachers">
                <button className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-xl transition-all active:scale-95 flex items-center gap-2 justify-center">
                  Find a Teacher <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="px-10 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base rounded-xl border border-slate-200 transition-all">
                  Contact Us
                </button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
              {["No subscription required", "Pay per lesson", "Free first consultation"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-indigo-500" />
                  {item}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

    </PageWrapper>
  );
}
