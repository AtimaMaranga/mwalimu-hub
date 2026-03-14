import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Users,
  Award,
  Globe,
  PlayCircle,
  ArrowLeft,
  Mail,
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import StarRating from "@/components/ui/StarRating";
import TeacherContactModal from "./TeacherContactModal";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import JsonLd from "@/components/seo/JsonLd";
import ChatWidget from "@/components/chat/ChatWidget";
import EnterClassroomButton from "@/components/classroom/EnterClassroomButton";
import BookLessonButton from "@/components/booking/BookLessonButton";
import { getTeacherBySlug, getTeacherSlugs, getTeacherReviews } from "@/lib/supabase/queries";
import { formatCurrency, getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://swahili-tutors.com";

export async function generateStaticParams() {
  const teachers = await getTeacherSlugs();
  return teachers.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);
  if (!teacher) return { title: "Teacher Not Found" };
  const nativeLabel = teacher.is_native_speaker ? "Native Swahili Speaker & " : "";
  const desc =
    teacher.tagline ||
    `Learn Swahili with ${teacher.name}, a ${teacher.is_native_speaker ? "native Swahili speaker" : "qualified Swahili teacher"} with ${teacher.experience_years ?? "extensive"} years of experience. Book 1-on-1 online lessons today.`;
  return {
    title: `${teacher.name} — ${nativeLabel}Swahili Teacher Online`,
    description: desc,
    alternates: { canonical: `${BASE}/teachers/${teacher.slug}` },
    openGraph: {
      title: `${teacher.name} — ${nativeLabel}Swahili Teacher`,
      description: desc,
      images: teacher.profile_image_url ? [{ url: teacher.profile_image_url, alt: teacher.name }] : ["/og-image.png"],
      type: "profile",
    },
  };
}

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);
  if (!teacher) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name, teacher_id").eq("id", user.id).single()
    : { data: null };

  const isOwnProfile = profile?.teacher_id === teacher.id;

  const [reviews] = await Promise.all([getTeacherReviews(teacher.id)]);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : teacher.rating;

  const languages = teacher.languages_spoken || [];

  const teacherSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: teacher.name,
    jobTitle: "Swahili Teacher",
    description:
      teacher.tagline ||
      `${teacher.is_native_speaker ? "Native Swahili speaker" : "Qualified Swahili teacher"} offering 1-on-1 online lessons.`,
    url: `${BASE}/teachers/${teacher.slug}`,
    ...(teacher.profile_image_url && { image: teacher.profile_image_url }),
    knowsAbout: ["Swahili", "Kiswahili", "East African culture", ...(teacher.specializations ?? [])],
    ...(teacher.rating && teacher.total_students && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: teacher.rating.toFixed(1),
        reviewCount: teacher.total_students,
        bestRating: "5",
        worstRating: "1",
      },
    }),
    ...(teacher.hourly_rate && {
      offers: {
        "@type": "Offer",
        price: teacher.hourly_rate.toString(),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        description: "1-on-1 online Swahili lesson (per hour)",
      },
    }),
  };

  return (
    <PageWrapper>
      <JsonLd data={teacherSchema} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link
          href="/teachers"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to all teachers
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Photo */}
                <div className="relative shrink-0">
                  {teacher.profile_image_url ? (
                    <Image
                      src={teacher.profile_image_url}
                      alt={`${teacher.name} profile photo`}
                      width={128}
                      height={128}
                      className="rounded-2xl object-cover w-32 h-32"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-4xl">
                      {getInitials(teacher.name)}
                    </div>
                  )}
                  {teacher.is_native_speaker && (
                    <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full border-2 border-white font-medium">
                      Native
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900">
                      {teacher.name}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        teacher.is_online
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          teacher.is_online
                            ? "bg-emerald-500 shadow-[0_0_6px_#34d399] animate-pulse"
                            : "bg-slate-400"
                        }`}
                      />
                      {teacher.is_online ? "Online now" : "Offline"}
                    </span>
                  </div>
                  {teacher.tagline && (
                    <p className="text-slate-500 mb-3">{teacher.tagline}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <StarRating rating={teacher.rating} size="md" />
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {teacher.total_students} students taught
                    </span>
                    {teacher.experience_years && (
                      <span className="text-sm text-slate-400 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {teacher.experience_years} years experience
                      </span>
                    )}
                    {teacher.timezone && (
                      <span className="text-sm text-slate-400 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {teacher.timezone}
                      </span>
                    )}
                  </div>

                  {teacher.specializations && teacher.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {teacher.specializations.map((spec) => (
                        <Badge key={spec} variant="primary">{spec}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            {teacher.bio && (
              <section aria-labelledby="about-heading" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
                <h2 id="about-heading" className="text-xl font-bold font-heading text-slate-900 mb-4">
                  About {teacher.name}
                </h2>
                <div className="prose-custom">
                  {teacher.bio.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Teaching Approach */}
            {teacher.teaching_approach && (
              <section aria-labelledby="approach-heading" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
                <h2 id="approach-heading" className="text-xl font-bold font-heading text-slate-900 mb-4">
                  Teaching Approach
                </h2>
                <div className="prose-custom">
                  <p>{teacher.teaching_approach}</p>
                </div>
              </section>
            )}

            {/* Qualifications */}
            <section aria-labelledby="quals-heading" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <h2 id="quals-heading" className="text-xl font-bold font-heading text-slate-900 mb-4">
                Experience & Qualifications
              </h2>
              <div className="space-y-3">
                {teacher.qualifications && (
                  <div className="flex gap-3">
                    <Award className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-slate-900 text-sm">Education</p>
                      <p className="text-sm text-slate-500">{teacher.qualifications}</p>
                    </div>
                  </div>
                )}
                {teacher.certifications && teacher.certifications.length > 0 && (
                  <div className="flex gap-3">
                    <Award className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-slate-900 text-sm">Certifications</p>
                      <ul className="mt-1 space-y-1">
                        {teacher.certifications.map((cert) => (
                          <li key={cert} className="text-sm text-slate-500 flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                            {cert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Languages */}
            {languages.length > 0 && (
              <section aria-labelledby="langs-heading" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
                <h2 id="langs-heading" className="text-xl font-bold font-heading text-slate-900 mb-4">
                  Languages Spoken
                </h2>
                <div className="flex flex-wrap gap-3">
                  {languages.map((lang) => (
                    <div key={lang.language} className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2">
                      <Globe className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                      <span className="font-medium text-sm text-slate-800">{lang.language}</span>
                      <span className="text-xs text-slate-400">· {lang.level}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Video intro */}
            {teacher.video_intro_url && (
              <section aria-labelledby="video-heading" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
                <h2 id="video-heading" className="text-xl font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  Video Introduction
                </h2>
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                  <iframe
                    src={teacher.video_intro_url.replace("watch?v=", "embed/")}
                    title={`${teacher.name} introduction video`}
                    className="w-full h-full"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </section>
            )}

            {/* Reviews */}
            <section aria-labelledby="reviews-heading" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <h2 id="reviews-heading" className="text-xl font-bold font-heading text-slate-900 mb-6">
                Student Reviews
              </h2>
              <ReviewList reviews={reviews} averageRating={avgRating} />
            </section>

            {/* Leave a review */}
            <section aria-labelledby="review-form-heading" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <h2 id="review-form-heading" className="text-xl font-bold font-heading text-slate-900 mb-1">
                Leave a Review
              </h2>
              <ReviewForm teacherId={teacher.id} teacherName={teacher.name} />
            </section>
          </div>

          {/* Right: Booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-indigo-700">
                    {teacher.hourly_rate ? formatCurrency(teacher.hourly_rate) : "Free"}
                  </p>
                  <p className="text-slate-400 text-sm">per hour</p>
                </div>

                <TeacherContactModal teacher={teacher} />

                {!isOwnProfile && user && (
                  <div className="mt-3">
                    {teacher.is_online ? (
                      <EnterClassroomButton
                        teacherId={teacher.id}
                        teacherName={teacher.name}
                        size="md"
                      />
                    ) : (
                      <BookLessonButton
                        teacherId={teacher.id}
                        teacherName={teacher.name}
                        hourlyRate={teacher.hourly_rate}
                        size="md"
                      />
                    )}
                  </div>
                )}

                {!isOwnProfile && (
                  <ChatWidget
                    teacher={{ id: teacher.id, name: teacher.name, slug: teacher.slug, is_online: teacher.is_online }}
                    currentUserId={user?.id ?? null}
                    currentUserName={profile?.full_name ?? user?.email?.split("@")[0] ?? null}
                    currentUserEmail={user?.email ?? null}
                  />
                )}

                <p className="text-xs text-slate-400 text-center mt-3">
                  No payment required now. Discuss directly with your teacher.
                </p>
              </div>

              {/* Availability */}
              {teacher.availability_description && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                    Availability
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {teacher.availability_description}
                  </p>
                </div>
              )}

              {/* Quick facts */}
              <div className="bg-indigo-50 rounded-2xl p-5">
                <h3 className="font-semibold text-indigo-900 mb-3 text-sm">Quick Facts</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-indigo-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                    {teacher.is_native_speaker ? "Native Swahili speaker" : "Qualified Swahili teacher"}
                  </li>
                  {teacher.experience_years && (
                    <li className="flex items-center gap-2 text-indigo-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                      {teacher.experience_years} years teaching
                    </li>
                  )}
                  <li className="flex items-center gap-2 text-indigo-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                    {teacher.total_students} students taught
                  </li>
                  <li className="flex items-center gap-2 text-indigo-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                    Lessons via video call
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
