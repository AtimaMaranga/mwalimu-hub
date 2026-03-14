import Link from "next/link";
import Image from "next/image";
import { Users, Clock, MapPin } from "lucide-react";
import type { Teacher } from "@/types";
import { formatCurrency, getInitials } from "@/lib/utils";
import { getTutorDisplayName } from "@/lib/displayName";
import StarRating from "@/components/ui/StarRating";
import EnterClassroomButton from "@/components/classroom/EnterClassroomButton";
import BookLessonButton from "@/components/booking/BookLessonButton";

interface TeacherCardProps {
  teacher: Teacher;
  isAuthenticated?: boolean;
}

/** Generate a unique teal-range gradient for each teacher avatar fallback */
function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = 160 + (Math.abs(hash) % 40); // teal range: 160-200
  const h2 = (h1 + 30) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 55%, 42%), hsl(${h2}, 60%, 52%))`;
}

export default function TeacherCard({ teacher, isAuthenticated = false }: TeacherCardProps) {
  const avatarGradient = getAvatarGradient(teacher.name);
  const displayName = getTutorDisplayName(teacher, isAuthenticated);

  return (
    <article className="group bg-white rounded-xl border border-slate-200 card-shadow flex flex-col h-full overflow-hidden">
      {/* Top section: Avatar + Info */}
      <div className="p-5 pb-0 flex gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          {teacher.profile_image_url ? (
            <Image
              src={teacher.profile_image_url}
              alt={`${displayName} profile photo`}
              width={80}
              height={80}
              className="rounded-full object-cover w-20 h-20 ring-2 ring-teal-100"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl ring-2 ring-teal-100"
              style={{ background: avatarGradient }}
              aria-hidden="true"
            >
              {getInitials(teacher.name)}
            </div>
          )}
          {/* Online indicator */}
          {teacher.is_online && (
            <span
              className="absolute bottom-0.5 right-0.5 h-4 w-4 bg-emerald-500 rounded-full border-[2.5px] border-white"
              title="Online now"
              aria-label="Online now"
            />
          )}
        </div>

        {/* Name + rating + tagline */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">
              {displayName}
            </h3>
            {teacher.is_native_speaker && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                Native
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1">
            <StarRating rating={teacher.rating} size="sm" />
            <span className="text-sm font-semibold text-slate-800">{teacher.rating.toFixed(1)}</span>
            {teacher.total_students > 0 && (
              <span className="text-xs text-slate-400">({teacher.total_students} students)</span>
            )}
          </div>

          {/* Tagline */}
          {teacher.tagline && (
            <p className="text-sm text-slate-500 mt-1.5 line-clamp-1 leading-snug">
              {teacher.tagline}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-3 flex-1">
        {/* Bio excerpt */}
        {teacher.bio && (
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {teacher.bio}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
          {teacher.experience_years !== undefined && teacher.experience_years > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {teacher.experience_years} yrs exp
            </span>
          )}
          {teacher.timezone && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              East Africa
            </span>
          )}
        </div>

        {/* Specializations */}
        {teacher.specializations && teacher.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {teacher.specializations.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="bg-teal-50 text-teal-700 rounded-full px-3 py-1 text-xs font-medium"
              >
                {spec}
              </span>
            ))}
            {teacher.specializations.length > 3 && (
              <span className="bg-slate-100 text-slate-500 rounded-full px-3 py-1 text-xs font-medium">
                +{teacher.specializations.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Price + CTAs */}
      <div className="px-5 pb-5 pt-4 mt-auto">
        {/* Price + action row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xl font-bold text-slate-900">
              {teacher.hourly_rate ? formatCurrency(teacher.hourly_rate) : "Free"}
            </span>
            <span className="text-sm text-slate-400 ml-1">/hr</span>
          </div>
          {!teacher.is_online && (
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">Offline</span>
          )}
        </div>

        <div className="space-y-2">
          <Link href={`/teachers/${teacher.slug}`} className="block">
            <button className="w-full bg-teal-600 text-white font-semibold text-sm py-3 rounded-lg hover:bg-teal-700 transition-all shadow-sm hover:shadow-md min-h-[44px]">
              View Profile
            </button>
          </Link>
          {teacher.is_online ? (
            <EnterClassroomButton teacherId={teacher.id} teacherName={teacher.name} />
          ) : (
            <BookLessonButton teacherId={teacher.id} teacherName={teacher.name} hourlyRate={teacher.hourly_rate} />
          )}
        </div>
      </div>
    </article>
  );
}
