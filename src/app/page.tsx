import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import {
  Search,
  MessageCircle,
  Video,
  Globe,
  TrendingUp,
  Heart,
  Briefcase,
  GraduationCap,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Play,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import AnimatedStat from "@/components/ui/AnimatedStat";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TeacherCard from "@/components/sections/TeacherCard";
import BlogCard from "@/components/sections/BlogCard";
import { getFeaturedTeachers, getBlogPosts } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Mwalimu Wangu — Your Gateway to Swahili Fluency",
  description:
    "Connect with qualified native Swahili teachers for personalised online lessons. Learn Swahili for travel, business, culture, or family. Start your journey today.",
};

const stats = [
  { value: "200M+", label: "Swahili speakers worldwide" },
  { value: "5+",    label: "Expert native teachers" },
  { value: "98%",   label: "Student satisfaction" },
  { value: "14",    label: "Countries reached" },
];

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Browse Teachers",
    desc: "Explore profiles of verified native Swahili teachers. Filter by specialisation, price, and availability.",
  },
  {
    step: "02",
    icon: MessageCircle,
    title: "Contact & Schedule",
    desc: "Send a message to your preferred teacher, discuss your goals, and agree on a schedule that works for you.",
  },
  {
    step: "03",
    icon: Video,
    title: "Start Learning",
    desc: "Begin your personalised Swahili lessons via video call. Track your progress and build real fluency.",
  },
];

const reasons = [
  {
    icon: Globe,
    title: "200M+ Speakers",
    desc: "Swahili is Africa's most widely spoken language — the gateway to 14 East and Central African countries.",
  },
  {
    icon: Briefcase,
    title: "Business Advantage",
    desc: "East Africa is one of the world's fastest-growing economic regions. Swahili fluency is a career differentiator.",
  },
  {
    icon: Heart,
    title: "Rich Culture",
    desc: "Unlock centuries of Swahili literature, music, poetry, and oral tradition — inaccessible in translation.",
  },
  {
    icon: TrendingUp,
    title: "Fast to Learn",
    desc: "Swahili has no tones and a phonetic spelling system. Most learners reach conversational level in 3–6 months.",
  },
  {
    icon: Users,
    title: "Diaspora Connection",
    desc: "Reconnect with your East African heritage, family, and community through the language of your roots.",
  },
  {
    icon: GraduationCap,
    title: "Academic Value",
    desc: "Swahili is an official African Union language and increasingly offered in universities worldwide.",
  },
];

const testimonials = [
  {
    quote:
      "Within three months of lessons with my Mwalimu Wangu teacher, I was ordering food and navigating Nairobi without relying on anyone. Absolutely life-changing.",
    name: "James T.",
    role: "Traveller, United Kingdom",
    initials: "JT",
    rating: 5,
  },
  {
    quote:
      "As a diaspora Kenyan, I had always felt disconnected from my heritage. Learning Swahili through this platform helped me rebuild that bond with my family.",
    name: "Aisha N.",
    role: "Software Engineer, USA",
    initials: "AN",
    rating: 5,
  },
  {
    quote:
      "My company expanded into East Africa and I needed business Swahili fast. The teachers here understood exactly what I needed — professional, focused, and effective.",
    name: "Marcus L.",
    role: "Business Development, Netherlands",
    initials: "ML",
    rating: 5,
  },
];

const goals = ["Travel", "Business", "Culture", "Family", "Academic"];

const heroTeachers = [
  {
    initial: "A",
    name: "Amina Odhiambo",
    spec: "Business Swahili",
    location: "Mombasa, Kenya",
    rating: 4.9,
    reviews: 124,
    price: "$25",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    initial: "D",
    name: "David Kariuki",
    spec: "Conversational",
    location: "Nairobi, Kenya",
    rating: 5.0,
    reviews: 89,
    price: "$20",
    gradient: "from-emerald-400 to-teal-600",
  },
  {
    initial: "F",
    name: "Fatuma Mwangi",
    spec: "Kids & Beginners",
    location: "Dar es Salaam",
    rating: 4.8,
    reviews: 201,
    price: "$18",
    gradient: "from-violet-400 to-purple-600",
  },
];

export default async function HomePage() {
  const [featuredTeachers, latestPosts] = await Promise.all([
    getFeaturedTeachers(),
    getBlogPosts(3),
  ]);

  return (
    <PageWrapper>

      {/* ─────────────────────────────────────────────── HERO ── */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-900 text-white"
        aria-label="Hero"
      >
        {/* Dot grid texture */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots)" />
          </svg>
          {/* Glow orbs */}
          <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* ── Left column ── */}
            <div>
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 bg-white/8 rounded-full px-4 py-2 text-sm text-indigo-200 mb-8 border border-white/10">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
                <span className="font-medium">Trusted by learners in 14+ countries</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] xl:text-7xl font-bold font-heading leading-[1.05] tracking-tight mb-6">
                Learn Swahili<br />
                from{" "}
                <em className="text-amber-400 not-italic">Native<br />Speakers</em>
              </h1>

              <p className="text-lg text-indigo-200 leading-relaxed mb-8 max-w-md">
                Connect with qualified native Swahili teachers for personalised online lessons — anytime, anywhere.
              </p>

              {/* Goal selector */}
              <div className="mb-10">
                <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest mb-3">
                  I want to learn for
                </p>
                <div className="flex flex-wrap gap-2">
                  {goals.map((goal) => (
                    <Link
                      key={goal}
                      href="/teachers"
                      className="px-4 py-2 bg-white/8 hover:bg-white/15 border border-white/15 hover:border-white/30 rounded-full text-sm text-indigo-100 hover:text-white transition-all duration-200 font-medium"
                    >
                      {goal}
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/teachers">
                  <Button variant="accent" size="lg" className="active:scale-95 font-semibold">
                    Find a Teacher
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/become-a-teacher">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/25 text-white hover:bg-white/8 active:scale-95"
                  >
                    Become a Teacher
                  </Button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2" aria-hidden="true">
                  {["#818cf8", "#a78bfa", "#f472b6", "#fbbf24", "#34d399"].map((color) => (
                    <div
                      key={color}
                      className="h-8 w-8 rounded-full ring-2 ring-indigo-900"
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <p className="text-sm text-indigo-300">
                  <span className="text-white font-semibold">2,000+</span> learners already started
                </p>
              </div>
            </div>

            {/* ── Right column — teacher preview cards ── */}
            <div className="hidden lg:flex justify-center items-center" aria-hidden="true">
              <div className="relative w-80 h-[460px]">
                {/* Glow behind cards */}
                <div className="absolute inset-0 bg-indigo-400/15 rounded-full blur-3xl scale-90" />

                {/* Card 1 */}
                <div className="absolute top-0 left-2 w-64 bg-white rounded-2xl shadow-2xl p-4 rotate-[-3deg] z-30">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${heroTeachers[0].gradient} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                      {heroTeachers[0].initial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">{heroTeachers[0].name}</p>
                      <p className="text-xs text-slate-500 truncate">{heroTeachers[0].spec} · {heroTeachers[0].location}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-800">{heroTeachers[0].rating}</span>
                        <span className="text-xs text-slate-400">({heroTeachers[0].reviews})</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs bg-indigo-50 text-indigo-700 rounded-full px-2.5 py-1 font-medium">Native speaker</span>
                    <span className="text-sm font-bold text-slate-900">{heroTeachers[0].price}<span className="text-xs font-normal text-slate-400">/hr</span></span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="absolute top-40 right-0 w-64 bg-white rounded-2xl shadow-2xl p-4 rotate-[2.5deg] z-20">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${heroTeachers[1].gradient} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                      {heroTeachers[1].initial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">{heroTeachers[1].name}</p>
                      <p className="text-xs text-slate-500 truncate">{heroTeachers[1].spec} · {heroTeachers[1].location}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-800">{heroTeachers[1].rating}</span>
                        <span className="text-xs text-slate-400">({heroTeachers[1].reviews})</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs bg-indigo-50 text-indigo-700 rounded-full px-2.5 py-1 font-medium">Native speaker</span>
                    <span className="text-sm font-bold text-slate-900">{heroTeachers[1].price}<span className="text-xs font-normal text-slate-400">/hr</span></span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="absolute top-[308px] left-4 w-64 bg-white rounded-2xl shadow-2xl p-4 rotate-[-1deg] z-10">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${heroTeachers[2].gradient} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                      {heroTeachers[2].initial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">{heroTeachers[2].name}</p>
                      <p className="text-xs text-slate-500 truncate">{heroTeachers[2].spec} · {heroTeachers[2].location}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-800">{heroTeachers[2].rating}</span>
                        <span className="text-xs text-slate-400">({heroTeachers[2].reviews})</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs bg-indigo-50 text-indigo-700 rounded-full px-2.5 py-1 font-medium">Native speaker</span>
                    <span className="text-sm font-bold text-slate-900">{heroTeachers[2].price}<span className="text-xs font-normal text-slate-400">/hr</span></span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ─────────────────────────────────────────── STATS BAND ── */}
      <section className="bg-white border-b border-slate-100" aria-label="Platform statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-0 lg:divide-x lg:divide-slate-200">
            {stats.map(({ value, label }, i) => (
              <ScrollReveal
                key={label}
                delay={i * 80}
                className={`text-center ${i > 0 ? "lg:pl-10" : ""}`}
              >
                <AnimatedStat
                  value={value}
                  label={label}
                  valueClassName="text-4xl sm:text-5xl font-bold text-indigo-600 font-heading"
                  labelClassName="text-slate-500 text-sm mt-2 font-medium"
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────── HOW IT WORKS ── */}
      <section className="py-28 bg-white" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
              Simple process
            </span>
            <h2
              id="how-it-works-heading"
              className="text-4xl sm:text-5xl font-bold font-heading text-slate-900 mb-5"
            >
              Start Learning in 3 Simple Steps
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Getting started on Mwalimu Wangu is effortless. Find your perfect teacher and begin your Swahili journey today.
            </p>
          </ScrollReveal>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-0">
            {steps.map(({ step, icon: Icon, title, desc }, index) => (
              <Fragment key={step}>
                <ScrollReveal delay={index * 120} className="text-center flex-1 group px-6">
                  {/* Large editorial step number */}
                  <div className="relative mb-1">
                    <span className="block text-[5.5rem] font-black leading-none text-indigo-50 select-none font-heading" aria-hidden="true">
                      {step}
                    </span>
                    <div className="-mt-9 relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200/80 group-hover:scale-110 group-hover:shadow-indigo-300/60 transition-all duration-300">
                      <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 mt-5">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </ScrollReveal>

                {index < steps.length - 1 && (
                  <div className="hidden md:flex shrink-0 items-center justify-center self-start mt-20" aria-hidden="true">
                    <ArrowRight className="h-5 w-5 text-slate-200" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link href="/how-it-works">
              <Button variant="outline">Learn how it works →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────── FEATURED TEACHERS ── */}
      <section
        className={featuredTeachers.length > 0 ? "py-28 bg-slate-50" : "py-16 bg-slate-50"}
        aria-labelledby="teachers-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mb-14">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
              <div>
                <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
                  Expert teachers
                </span>
                <h2
                  id="teachers-heading"
                  className="text-4xl sm:text-5xl font-bold font-heading text-slate-900"
                >
                  Meet Our Teachers
                </h2>
                <p className="text-slate-500 mt-3 text-lg">
                  Qualified, experienced, and passionate about Swahili
                </p>
              </div>
              <Link href="/teachers" className="shrink-0">
                <Button variant="outline">Browse all teachers →</Button>
              </Link>
            </div>
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
            <div className="text-center py-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 mb-4">
                <Users className="h-7 w-7 text-indigo-300" aria-hidden="true" />
              </div>
              <p className="text-lg font-semibold text-slate-600 mb-1">Teachers coming soon</p>
              <p className="text-sm text-slate-400 max-w-xs mx-auto mb-6">
                We are currently onboarding our first teachers. Check back shortly.
              </p>
              <Link href="/become-a-teacher">
                <Button variant="outline" size="sm">Become one of our first teachers →</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ───────────────────────────── WHY LEARN SWAHILI ── */}
      <section className="py-28 bg-white" aria-labelledby="why-swahili-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <span className="inline-block bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
              Why Swahili
            </span>
            <h2
              id="why-swahili-heading"
              className="text-4xl sm:text-5xl font-bold font-heading text-slate-900 mb-5"
            >
              Why Learn Swahili?
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Swahili is more than a language — it is a key to one of the world&apos;s most dynamic regions and cultures.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map(({ icon: Icon, title, desc }, i) => (
              <ScrollReveal key={title} delay={i * 70}>
                <div className="group relative bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden h-full">
                  {/* Faint background number */}
                  <span className="absolute -top-3 -right-2 text-8xl font-black text-slate-50 leading-none select-none font-heading" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 group-hover:bg-indigo-100 transition-colors duration-200">
                    <Icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-base">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                  {/* Hover accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────── TESTIMONIALS ── */}
      <section className="py-28 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 relative overflow-hidden" aria-labelledby="testimonials-heading">
        {/* Background texture */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="test-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#test-dots)" />
          </svg>
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <span className="inline-block bg-white/8 text-indigo-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-white/10 mb-5">
              Student stories
            </span>
            <h2
              id="testimonials-heading"
              className="text-4xl sm:text-5xl font-bold font-heading text-white mb-5"
            >
              What Our Students Say
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Real stories from learners around the world who transformed their lives with Swahili.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, role, initials, rating }, i) => (
              <ScrollReveal key={name} delay={i * 100}>
                <blockquote className="bg-white/5 border border-white/8 rounded-2xl p-7 backdrop-blur-sm h-full flex flex-col hover:bg-white/8 transition-colors duration-200">
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-1 italic">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <footer className="flex items-center gap-3 pt-5 border-t border-white/10">
                    <div className="h-10 w-10 rounded-full bg-indigo-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {initials}
                    </div>
                    <div>
                      <cite className="not-italic font-semibold text-white text-sm block">{name}</cite>
                      <span className="text-xs text-slate-500">{role}</span>
                    </div>
                  </footer>
                </blockquote>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────── BLOG POSTS ── */}
      {latestPosts.length > 0 && (
        <section className="py-28 bg-white" aria-labelledby="blog-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mb-14">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
                <div>
                  <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
                    From the blog
                  </span>
                  <h2
                    id="blog-heading"
                    className="text-4xl sm:text-5xl font-bold font-heading text-slate-900"
                  >
                    From Our Blog
                  </h2>
                  <p className="text-slate-500 mt-3 text-lg">
                    Tips, guides, and stories to fuel your Swahili journey
                  </p>
                </div>
                <Link href="/blog" className="shrink-0">
                  <Button variant="outline">Read all articles →</Button>
                </Link>
              </div>
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

      {/* ─────────────────────────────────── FINAL CTA ── */}
      <section className="py-32 bg-indigo-600 relative overflow-hidden" aria-labelledby="cta-heading">
        {/* Background texture */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cta-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-dots)" />
          </svg>
          <div className="absolute -top-32 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 left-0 w-80 h-80 bg-indigo-800/40 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <ScrollReveal>
            <h2
              id="cta-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-white mb-6 leading-tight"
            >
              Ready to speak Swahili<em className="not-italic text-amber-300"> fluently?</em>
            </h2>
            <p className="text-indigo-100 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
              Join thousands of learners worldwide discovering the beauty of Swahili with expert native teachers on Mwalimu Wangu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/teachers">
                <Button variant="accent" size="lg" className="active:scale-95 font-semibold">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  Find My Teacher
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/8 active:scale-95"
                >
                  Contact Us
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-indigo-200">
              {[
                "No subscription required",
                "Pay per lesson",
                "Free trial lesson available",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-400" aria-hidden="true" />
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
