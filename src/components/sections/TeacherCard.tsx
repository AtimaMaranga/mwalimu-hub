import Link from "next/link";
import Image from "next/image";
import { Star, Users, BookOpen, CheckCircle, MessageCircle } from "lucide-react";
import type { Teacher } from "@/types";
import { formatCurrency, getInitials } from "@/lib/utils";
import BookLessonButton from "@/components/booking/BookLessonButton";

interface TeacherCardProps {
  teacher: Teacher;
  /** Compact grid card (used on landing page) vs full list card (used on /teachers) */
  variant?: "grid" | "list";
}

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 45) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 62%, 52%), hsl(${h2}, 72%, 62%))`;
}

/* ─── Compact grid card (landing page, featured teachers) ─── */
function GridCard({ teacher }: { teacher: Teacher }) {
  const avatarGradient = getAvatarGradient(teacher.name);

  return (
    <Link href={`/teachers/${teacher.slug}`}>
      <article className="group bg-white rounded-xl border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden h-full flex flex-col">
        {/* Avatar + price header */}
        <div className="p-5 pb-0 flex items-start gap-4">
          <div className="relative shrink-0">
            {teacher.profile_image_url ? (
              <Image
                src={teacher.profile_image_url}
                alt={`Swahili tutor ${teacher.name}`}
                width={64}
                height={64}
                className="rounded-lg object-cover w-16 h-16"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ background: avatarGradient }}
              >
                {getInitials(teacher.name)}
              </div>
            )}
            {teacher.is_online && (
              <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-900 text-sm truncate">{teacher.name}</h3>
              {teacher.is_native_speaker && (
                <CheckCircle className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              )}
            </div>
            {teacher.tagline && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{teacher.tagline}</p>
            )}
          </div>
        </div>

        {/* Stats + price */}
        <div className="p-5 pt-3 mt-auto">
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
            {teacher.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-slate-700">{teacher.rating.toFixed(1)}</span>
              </span>
            )}
            {teacher.total_students > 0 && (
              <span>{teacher.total_students} students</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">
              {teacher.hourly_rate ? formatCurrency(teacher.hourly_rate) : "Free"}
              <span className="text-xs font-normal text-slate-400"> /hr</span>
            </span>
            <span className="text-xs font-medium text-indigo-600 group-hover:underline">
              View profile →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ─── Full list card (teacher listing page — Preply style) ─── */
function ListCard({ teacher }: { teacher: Teacher }) {
  const avatarGradient = getAvatarGradient(teacher.name);
  const languages = teacher.languages_spoken || [];
  const langSummary = languages.length > 0
    ? languages.slice(0, 2).map(l => `${l.language} (${l.level})`).join(", ") + (languages.length > 2 ? ` +${languages.length - 2}` : "")
    : null;

  return (
    <article className="bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow overflow-hidden">
      {/* Popularity badge */}
      {teacher.total_students >= 10 && (
        <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            {teacher.total_students >= 20 ? "Super popular" : "Popular"} · {teacher.total_students} students taught
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col sm:flex-row gap-5">
        {/* Photo */}
        <Link href={`/teachers/${teacher.slug}`} className="shrink-0">
          <div className="relative w-full sm:w-44 h-48 sm:h-44 rounded-lg overflow-hidden">
            {teacher.profile_image_url ? (
              <Image
                src={teacher.profile_image_url}
                alt={`Swahili tutor ${teacher.name}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 176px"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold text-4xl"
                style={{ background: avatarGradient }}
              >
                {getInitials(teacher.name)}
              </div>
            )}
            {teacher.is_online && (
              <span className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-[10px] font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            )}
          </div>
        </Link>

        {/* Info — middle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/teachers/${teacher.slug}`}>
              <h3 className="font-bold text-slate-900 text-lg hover:underline">
                {teacher.name}
              </h3>
            </Link>
            {teacher.is_native_speaker && (
              <span title="Verified"><CheckCircle className="h-4 w-4 text-indigo-500 shrink-0" /></span>
            )}
          </div>

          {/* Type + Specializations */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mb-2">
            {teacher.is_native_speaker && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                Native Speaker
              </span>
            )}
            {teacher.specializations && teacher.specializations.length > 0 && (
              <span>
                {teacher.specializations.slice(0, 2).join(", ")}
                {teacher.specializations.length > 2 && ` +${teacher.specializations.length - 2}`}
              </span>
            )}
          </div>

          {/* Languages */}
          {langSummary && (
            <p className="text-sm text-slate-500 mb-2 flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/></svg>
              Speaks {langSummary}
            </p>
          )}

          {/* Bio excerpt */}
          {(teacher.tagline || teacher.bio) && (
            <p className="text-sm text-slate-600 line-clamp-2 mb-2 leading-relaxed">
              {teacher.tagline || teacher.bio}
            </p>
          )}

          <Link
            href={`/teachers/${teacher.slug}`}
            className="text-sm font-semibold text-slate-900 hover:underline"
          >
            Learn more
          </Link>
        </div>

        {/* Right — price, stats, CTA */}
        <div className="sm:w-48 shrink-0 flex flex-col items-end sm:items-stretch gap-3">
          {/* Price */}
          <div className="sm:text-right">
            <p className="text-2xl font-bold text-slate-900">
              {teacher.hourly_rate ? formatCurrency(teacher.hourly_rate) : "Free"}
            </p>
            <p className="text-xs text-slate-400">per hour</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-slate-500 sm:justify-end">
            {teacher.rating > 0 && (
              <div className="text-center">
                <span className="flex items-center gap-0.5 font-bold text-sm text-slate-800">
                  {teacher.rating.toFixed(1)}
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                </span>
              </div>
            )}
            {teacher.total_students > 0 && (
              <div className="text-center">
                <p className="font-bold text-sm text-slate-800">{teacher.total_students}</p>
                <p className="text-[10px]">students</p>
              </div>
            )}
            {teacher.experience_years && teacher.experience_years > 0 && (
              <div className="text-center">
                <p className="font-bold text-sm text-slate-800">{teacher.experience_years}</p>
                <p className="text-[10px]">years</p>
              </div>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-2 w-full mt-auto">
            <BookLessonButton
              teacherId={teacher.id}
              teacherName={teacher.name}
              hourlyRate={teacher.hourly_rate}
              size="md"
            />
            <Link
              href={`/teachers/${teacher.slug}`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function TeacherCard({ teacher, variant = "grid" }: TeacherCardProps) {
  if (variant === "list") return <ListCard teacher={teacher} />;
  return <GridCard teacher={teacher} />;
}
