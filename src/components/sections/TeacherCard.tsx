import Link from "next/link";
import Image from "next/image";
import { Users, Clock } from "lucide-react";
import type { Teacher } from "@/types";
import { formatCurrency, getInitials } from "@/lib/utils";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface TeacherCardProps {
  teacher: Teacher;
}

/** Generate a unique gradient for each teacher based on their name */
function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 45) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 62%, 52%), hsl(${h2}, 72%, 62%))`;
}

export default function TeacherCard({ teacher }: TeacherCardProps) {
  const bandGradient = getAvatarGradient(teacher.name);
  const avatarGradient = getAvatarGradient(teacher.name + "av");

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full">
      {/* Coloured header band */}
      <div
        className="relative h-24 shrink-0"
        style={{ background: bandGradient }}
      >
        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm">
          <span className="font-bold text-slate-800 text-sm">
            {teacher.hourly_rate ? formatCurrency(teacher.hourly_rate) : "Free"}
          </span>
          <span className="text-slate-400 text-xs">/hr</span>
        </div>
      </div>

      {/* Avatar — overlaps the band */}
      <div className="px-5 -mt-8 flex items-end gap-3 mb-1">
        <div className="relative shrink-0">
          {teacher.profile_image_url ? (
            <Image
              src={teacher.profile_image_url}
              alt={`${teacher.name} profile photo`}
              width={64}
              height={64}
              className="rounded-xl object-cover w-16 h-16 ring-4 ring-white shadow-md"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl ring-4 ring-white shadow-md"
              style={{ background: avatarGradient }}
              aria-hidden="true"
            >
              {getInitials(teacher.name)}
            </div>
          )}
          {teacher.is_native_speaker && (
            <span
              className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm"
              title="Native speaker"
              aria-label="Native Swahili speaker"
            >
              <svg
                className="h-2.5 w-2.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
        </div>
        {/* Star rating beside avatar at band base */}
        <div className="pb-1">
          <StarRating rating={teacher.rating} size="sm" />
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-2 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 text-base leading-tight">
            {teacher.name}
          </h3>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              teacher.is_online
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-400"
            }`}
            title={teacher.is_online ? "Online now" : "Offline"}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                teacher.is_online ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {teacher.is_online ? "Online" : "Offline"}
          </span>
        </div>
        {teacher.tagline && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {teacher.tagline}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
          {teacher.total_students > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" aria-hidden="true" />
              {teacher.total_students} students
            </span>
          )}
          {teacher.experience_years !== undefined && teacher.experience_years > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {teacher.experience_years}y exp.
            </span>
          )}
        </div>

        {/* Specializations */}
        {teacher.specializations && teacher.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {teacher.specializations.slice(0, 3).map((spec) => (
              <Badge key={spec} variant="primary">{spec}</Badge>
            ))}
            {teacher.specializations.length > 3 && (
              <Badge variant="default">+{teacher.specializations.length - 3}</Badge>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-4">
        <Link href={`/teachers/${teacher.slug}`} className="block">
          <Button variant="primary" fullWidth>
            View Profile
          </Button>
        </Link>
      </div>
    </article>
  );
}
