"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Search,
  ChevronDown,
  X,
  Users,
  SlidersHorizontal,
  Heart,
  Star,
  Globe,
  Languages,
  CheckCircle,
  Play,
  TrendingUp,
  Zap,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Teacher } from "@/types";
import { SPECIALIZATIONS, DIALECTS } from "@/types";
import { formatCurrency, getInitials, getTutorDisplayName } from "@/lib/utils";
import { DEFAULT_HOURLY_RATE, MAX_HOURLY_RATE } from "@/lib/pricing";
import BookLessonButton from "@/components/booking/BookLessonButton";
import Button from "@/components/ui/Button";

interface TeachersClientProps {
  initialTeachers: Teacher[];
}

const TEACHERS_PER_PAGE = 12;

/* ─── Helper: avatar gradient from name hash ─── */
function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 45) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 62%, 52%), hsl(${h2}, 72%, 62%))`;
}

/* ─── Helper: computed teacher stats ─── */
function isSuperTutor(t: Teacher) {
  return t.rating >= 4.9 && t.total_students >= 20;
}
function isProfessional(t: Teacher) {
  return (t.certifications && t.certifications.length > 0) || (t.experience_years && t.experience_years >= 3);
}
function getPopularityTier(t: Teacher): "super" | "popular" | "new" | null {
  if (t.total_students >= 30) return "super";
  if (t.total_students >= 10) return "popular";
  const created = new Date(t.created_at);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  if (created > thirtyDaysAgo) return "new";
  return null;
}
function getRecentBookings(t: Teacher) {
  return Math.min(Math.floor(t.total_students * 0.3), 20);
}
function getTotalLessons(t: Teacher) {
  return t.total_students * 8;
}

/* ─── Dropdown filter (reusable) ─── */
function FilterDropdown({
  label,
  value,
  pill,
  children,
}: {
  label: string;
  value?: string;
  pill?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (pill) {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm transition-colors ${
            value
              ? "bg-slate-100 border-slate-400 font-medium text-slate-900"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {value || label}
          {value ? (
            <X className="h-3 w-3 ml-0.5" />
          ) : (
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          )}
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 max-h-72 overflow-y-auto">
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex-1 min-w-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-colors ${
          open
            ? "border-indigo-500 ring-1 ring-indigo-500"
            : value
            ? "border-indigo-300 bg-indigo-50"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="min-w-0">
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-sm font-medium text-slate-900 truncate">{value || `Any ${label.toLowerCase()}`}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 ml-2 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 max-h-80 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Mobile filter drawer ─── */
function MobileFilterDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-slate-900">Filters</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─── Tutor List Card ─── */
function TutorCard({
  teacher,
  isFeatured,
}: {
  teacher: Teacher;
  isFeatured?: boolean;
}) {
  const avatarGradient = getAvatarGradient(teacher.name);
  const languages = teacher.languages_spoken || [];
  const langSummary =
    languages.length > 0
      ? languages
          .slice(0, 2)
          .map((l) => `${l.language} (${l.level})`)
          .join(", ") + (languages.length > 2 ? ` +${languages.length - 2}` : "")
      : null;

  const displayName = getTutorDisplayName(teacher.name, false);
  const firstName = teacher.name.split(" ")[0];
  const popularity = getPopularityTier(teacher);
  const totalLessons = getTotalLessons(teacher);
  const recentBookings = getRecentBookings(teacher);
  const superTutor = isSuperTutor(teacher);
  const professional = isProfessional(teacher);

  return (
    <article className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Popularity banner */}
      {popularity && (
        <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50">
          <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            {popularity === "super" && (
              <>
                <Zap className="h-4 w-4 text-amber-500" />
                Super popular · {recentBookings}+ recent bookings
              </>
            )}
            {popularity === "popular" && (
              <>
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                Popular · {recentBookings} recent bookings
              </>
            )}
            {popularity === "new" && (
              <>
                <Sparkles className="h-4 w-4 text-emerald-500" />
                New tutor
              </>
            )}
          </span>
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className={`flex flex-col sm:flex-row gap-5 ${isFeatured ? "lg:flex-row" : ""}`}>
          {/* Col 1: Photo */}
          <Link href={`/teachers/${teacher.slug}`} className="shrink-0">
            <div className="relative w-full sm:w-[180px] h-[200px] sm:h-[200px] rounded-lg overflow-hidden">
              {teacher.profile_image_url ? (
                <Image
                  src={teacher.profile_image_url}
                  alt={`Swahili tutor ${teacher.name}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 180px"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white font-bold text-4xl"
                  style={{ background: avatarGradient }}
                >
                  {getInitials(teacher.name)}
                </div>
              )}
              {teacher.video_intro_url && (
                <span className="absolute bottom-2 right-2 flex items-center justify-center h-8 w-8 rounded-full bg-black/60 text-white">
                  <Play className="h-3.5 w-3.5 fill-white" />
                </span>
              )}
            </div>
          </Link>

          {/* Col 2: Info */}
          <div className="flex-1 min-w-0">
            {/* Name + verified + flag */}
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/teachers/${teacher.slug}`}>
                <h3 className="text-xl font-bold text-slate-900 hover:underline">{displayName}</h3>
              </Link>
              {(teacher.certifications && teacher.certifications.length > 0) && (
                <CheckCircle className="h-5 w-5 text-blue-500 shrink-0" />
              )}
              {teacher.is_online && (
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#34d399] animate-pulse shrink-0" />
              )}
            </div>

            {/* Category badges */}
            <div className="flex items-center gap-2 mt-1">
              {superTutor && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  Super Tutor
                </span>
              )}
              {professional && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  Professional
                </span>
              )}
              {teacher.is_native_speaker && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Native Speaker
                </span>
              )}
            </div>

            {/* Subject */}
            <div className="flex items-center gap-2 mt-2.5 text-sm text-slate-600">
              <Globe className="h-4 w-4 shrink-0" />
              <span>Swahili</span>
            </div>

            {/* Languages spoken */}
            {langSummary && (
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                <Languages className="h-4 w-4 shrink-0" />
                <span>Speaks {langSummary}</span>
              </div>
            )}

            {/* Bio excerpt */}
            {(teacher.tagline || teacher.bio) && (
              <p className="mt-3 text-sm text-slate-700 line-clamp-3 leading-relaxed">
                {teacher.tagline || teacher.bio}
              </p>
            )}
            <Link
              href={`/teachers/${teacher.slug}`}
              className="text-sm font-medium text-slate-900 underline mt-1 inline-block hover:text-indigo-700"
            >
              Learn more
            </Link>
          </div>

          {/* Col 3: Price + Stats + Actions */}
          <div className="sm:w-[200px] shrink-0 flex flex-col">
            {/* Price + heart */}
            <div className="flex items-start justify-between sm:justify-end gap-3">
              <div className="sm:text-right">
                <span className="text-2xl font-bold text-slate-900">
                  {formatCurrency(teacher.hourly_rate || DEFAULT_HOURLY_RATE)}
                </span>
                <p className="text-xs text-slate-500 mt-0.5">50-min lesson</p>
              </div>
              <button
                className="text-slate-300 hover:text-red-400 transition-colors mt-1"
                aria-label={`Save ${teacher.name}`}
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 mt-4 sm:justify-end">
              {teacher.rating > 0 && (
                <div className="text-center">
                  <div className="flex items-center gap-0.5">
                    <span className="text-base font-bold text-slate-900">{teacher.rating.toFixed(1)}</span>
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  </div>
                  <p className="text-[10px] text-slate-500">reviews</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-base font-bold text-slate-900">{teacher.total_students}</p>
                <p className="text-[10px] text-slate-500">students</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-slate-900">{totalLessons}</p>
                <p className="text-[10px] text-slate-500">lessons</p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="mt-4 space-y-2 sm:mt-auto">
              <BookLessonButton
                teacherId={teacher.id}
                teacherName={teacher.name}
                hourlyRate={teacher.hourly_rate}
                size="md"
              />
              <Link
                href={`/teachers/${teacher.slug}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors text-sm"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Send message
              </Link>
            </div>
          </div>
        </div>

        {/* Featured card sidebar (first card only) */}
        {isFeatured && teacher.video_intro_url && (
          <div className="hidden lg:block mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <Link
                href={`/teachers/${teacher.slug}`}
                className="relative w-64 aspect-video rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center group"
              >
                <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center group-hover:bg-indigo-700 transition-colors">
                  <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                </div>
                <span className="absolute bottom-2 left-2 text-xs text-white/80">Watch introduction</span>
              </Link>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/teachers/${teacher.slug}`}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-center"
                >
                  See {firstName}&apos;s profile
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main TeachersClient component
   ═══════════════════════════════════════════════════════════════ */
export default function TeachersClient({ initialTeachers }: TeachersClientProps) {
  /* ── State ── */
  const [search, setSearch] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [nativeFilter, setNativeFilter] = useState<"all" | "native" | "non-native">("all");
  const [minPrice, setMinPrice] = useState(DEFAULT_HOURLY_RATE);
  const [maxPrice, setMaxPrice] = useState(MAX_HOURLY_RATE);
  const [selectedDialects, setSelectedDialects] = useState<string[]>([]);
  const [tutorCategory, setTutorCategory] = useState<"all" | "professional" | "super">("all");
  const [sortBy, setSortBy] = useState<"top" | "price_asc" | "price_desc" | "most_students" | "newest">("top");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /* ── Filter logic ── */
  const filtered = useMemo(() => {
    let result = [...initialTeachers];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tagline?.toLowerCase().includes(q) ||
          t.bio?.toLowerCase().includes(q)
      );
    }

    if (selectedSpecs.length > 0) {
      result = result.filter((t) => selectedSpecs.some((s) => t.specializations?.includes(s)));
    }

    if (selectedDialects.length > 0) {
      result = result.filter((t) => t.dialect && selectedDialects.includes(t.dialect));
    }

    if (nativeFilter === "native") {
      result = result.filter((t) => t.is_native_speaker);
    } else if (nativeFilter === "non-native") {
      result = result.filter((t) => !t.is_native_speaker);
    }

    result = result.filter((t) => {
      const rate = t.hourly_rate ?? 0;
      return rate >= minPrice && (maxPrice >= MAX_HOURLY_RATE || rate <= maxPrice);
    });

    if (tutorCategory === "professional") {
      result = result.filter((t) => isProfessional(t));
    } else if (tutorCategory === "super") {
      result = result.filter((t) => isSuperTutor(t));
    }

    result.sort((a, b) => {
      if (sortBy === "top") {
        const scoreA = a.rating * Math.log2(a.total_students + 1);
        const scoreB = b.rating * Math.log2(b.total_students + 1);
        return scoreB - scoreA;
      }
      if (sortBy === "price_asc") return (a.hourly_rate ?? 0) - (b.hourly_rate ?? 0);
      if (sortBy === "price_desc") return (b.hourly_rate ?? 0) - (a.hourly_rate ?? 0);
      if (sortBy === "most_students") return b.total_students - a.total_students;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [initialTeachers, search, selectedSpecs, selectedDialects, nativeFilter, minPrice, maxPrice, tutorCategory, sortBy]);

  const totalPages = Math.ceil(filtered.length / TEACHERS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * TEACHERS_PER_PAGE, page * TEACHERS_PER_PAGE);
  const listRef = useRef<HTMLDivElement>(null);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  /* Reset page on filter change */
  const resetPage = useCallback(() => setPage(1), []);

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) => (prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]));
    resetPage();
  };

  const toggleDialect = (dialect: string) => {
    setSelectedDialects((prev) => (prev.includes(dialect) ? prev.filter((d) => d !== dialect) : [...prev, dialect]));
    resetPage();
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedSpecs([]);
    setSelectedDialects([]);
    setNativeFilter("all");
    setMinPrice(DEFAULT_HOURLY_RATE);
    setMaxPrice(MAX_HOURLY_RATE);
    setTutorCategory("all");
    setSortBy("top");
    setPage(1);
  };

  const hasActiveFilters =
    search ||
    selectedSpecs.length > 0 ||
    selectedDialects.length > 0 ||
    nativeFilter !== "all" ||
    minPrice > DEFAULT_HOURLY_RATE ||
    maxPrice < MAX_HOURLY_RATE ||
    tutorCategory !== "all" ||
    sortBy !== "top";

  const priceLabel = minPrice > DEFAULT_HOURLY_RATE || maxPrice < MAX_HOURLY_RATE ? `$${minPrice} – $${maxPrice}${maxPrice >= MAX_HOURLY_RATE ? "+" : ""}` : undefined;
  const specLabel =
    selectedSpecs.length > 0
      ? selectedSpecs.length === 1
        ? selectedSpecs[0]
        : `${selectedSpecs.length} selected`
      : undefined;
  const nativeLabel = nativeFilter === "native" ? "Native only" : nativeFilter === "non-native" ? "Non-native" : undefined;
  const categoryLabel = tutorCategory === "professional" ? "Professional" : tutorCategory === "super" ? "Super Tutor" : undefined;

  /* ── Render ── */
  return (
    <>
      {/* Page heading */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          {hasActiveFilters
            ? `${filtered.length} Swahili tutor${filtered.length !== 1 ? "s" : ""} matching your filters`
            : `${initialTeachers.length} Swahili tutors to help you speak confidently`}
        </h1>
      </div>

      {/* ═══ Filter bar ═══ */}
      <div className="sticky top-16 z-40 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Row 1: Primary filters (desktop) */}
          <div className="hidden lg:grid grid-cols-4 gap-3 mb-3">
            <FilterDropdown label="Price per lesson" value={priceLabel}>
              <div>
                <p className="text-xs text-slate-500 mb-3">Price range (per hour)</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500">Min: ${minPrice}</label>
                    <input
                      type="range"
                      min={DEFAULT_HOURLY_RATE}
                      max={MAX_HOURLY_RATE - 2}
                      step={1}
                      value={minPrice}
                      onChange={(e) => { setMinPrice(Number(e.target.value)); resetPage(); }}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Max: ${maxPrice}{maxPrice >= MAX_HOURLY_RATE ? "+" : ""}</label>
                    <input
                      type="range"
                      min={DEFAULT_HOURLY_RATE + 1}
                      max={MAX_HOURLY_RATE}
                      step={1}
                      value={maxPrice}
                      onChange={(e) => { setMaxPrice(Number(e.target.value)); resetPage(); }}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
                <p className="text-center text-sm font-semibold text-indigo-700 mt-2">
                  ${minPrice} – ${maxPrice}{maxPrice >= MAX_HOURLY_RATE ? "+" : ""} / hr
                </p>
              </div>
            </FilterDropdown>

            <FilterDropdown label="Dialect" value={selectedDialects.length > 0 ? selectedDialects.join(", ") : undefined}>
              <div className="space-y-1.5">
                {DIALECTS.map((dialect) => (
                  <label key={dialect} className="flex items-center gap-2.5 cursor-pointer py-1 hover:bg-slate-50 px-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedDialects.includes(dialect)}
                      onChange={() => toggleDialect(dialect)}
                      className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">{dialect}</span>
                  </label>
                ))}
              </div>
            </FilterDropdown>

            <FilterDropdown label="Also speaks" value={undefined}>
              <p className="text-xs text-slate-400 mb-2">Language filters coming soon</p>
              <p className="text-sm text-slate-500">All tutors speak Swahili and English</p>
            </FilterDropdown>

            <FilterDropdown label="Availability" value={undefined}>
              <p className="text-xs text-slate-400 mb-2">Availability filters coming soon</p>
              <p className="text-sm text-slate-500">Contact tutors directly about scheduling</p>
            </FilterDropdown>
          </div>

          {/* Row 2: Secondary filters + sort + search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Mobile filter button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
              )}
            </button>

            {/* Pill filters (desktop) */}
            <div className="hidden lg:contents">
              <FilterDropdown label="Specialties" value={specLabel} pill>
                <div className="space-y-1.5">
                  {SPECIALIZATIONS.map((spec) => (
                    <label key={spec} className="flex items-center gap-2.5 cursor-pointer py-1 hover:bg-slate-50 px-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedSpecs.includes(spec)}
                        onChange={() => toggleSpec(spec)}
                        className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">{spec}</span>
                    </label>
                  ))}
                </div>
              </FilterDropdown>

              <FilterDropdown label="Native speaker" value={nativeLabel} pill>
                <div className="space-y-1.5">
                  {[
                    { value: "all" as const, label: "All tutors" },
                    { value: "native" as const, label: "Native speakers only" },
                    { value: "non-native" as const, label: "Non-native speakers" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer py-1 hover:bg-slate-50 px-1 rounded">
                      <input
                        type="radio"
                        name="native"
                        checked={nativeFilter === opt.value}
                        onChange={() => { setNativeFilter(opt.value); resetPage(); }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </FilterDropdown>

              <FilterDropdown label="Tutor categories" value={categoryLabel} pill>
                <div className="space-y-1.5">
                  {[
                    { value: "all" as const, label: "All" },
                    { value: "professional" as const, label: "Professional" },
                    { value: "super" as const, label: "Super Tutor" },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer py-1 hover:bg-slate-50 px-1 rounded">
                      <input
                        type="radio"
                        name="category"
                        checked={tutorCategory === opt.value}
                        onChange={() => { setTutorCategory(opt.value); resetPage(); }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </FilterDropdown>
            </div>

            {/* Right: Sort + Search */}
            <div className="flex items-center gap-2 ml-auto">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as typeof sortBy); resetPage(); }}
                className="px-3 py-2 rounded-full border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                aria-label="Sort teachers"
              >
                <option value="top">Sort by: Our top picks</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="most_students">Most students</option>
                <option value="newest">Newest</option>
              </select>

              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search by name or keyword"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                  className="pl-9 pr-8 py-2 w-56 rounded-full border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  aria-label="Search teachers"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(""); resetPage(); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {selectedSpecs.map((spec) => (
                <button
                  key={spec}
                  onClick={() => toggleSpec(spec)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-colors"
                >
                  {spec} <X className="h-3 w-3" />
                </button>
              ))}
              {selectedDialects.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDialect(d)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-colors"
                >
                  {d} <X className="h-3 w-3" />
                </button>
              ))}
              {nativeFilter !== "all" && (
                <button
                  onClick={() => { setNativeFilter("all"); resetPage(); }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-colors"
                >
                  {nativeLabel} <X className="h-3 w-3" />
                </button>
              )}
              {(minPrice > DEFAULT_HOURLY_RATE || maxPrice < MAX_HOURLY_RATE) && (
                <button
                  onClick={() => { setMinPrice(3); setMaxPrice(60); resetPage(); }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-colors"
                >
                  {priceLabel} <X className="h-3 w-3" />
                </button>
              )}
              {tutorCategory !== "all" && (
                <button
                  onClick={() => { setTutorCategory("all"); resetPage(); }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-colors"
                >
                  {categoryLabel} <X className="h-3 w-3" />
                </button>
              )}
              <button onClick={clearFilters} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold ml-1">
                Clear all
              </button>
            </div>
          )}

          {/* Mobile search */}
          <div className="sm:hidden mt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search by name or keyword"
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                className="pl-9 pr-4 py-2.5 w-full rounded-full border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                aria-label="Search teachers"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Mobile filter drawer ═══ */}
      <MobileFilterDrawer open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)}>
        {/* Price */}
        <div>
          <p className="text-sm font-medium text-slate-900 mb-2">Price per lesson</p>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-slate-500">Min: ${minPrice}</label>
              <input type="range" min={DEFAULT_HOURLY_RATE} max={MAX_HOURLY_RATE - 2} step={1} value={minPrice} onChange={(e) => { setMinPrice(Number(e.target.value)); resetPage(); }} className="w-full accent-indigo-600" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Max: ${maxPrice}{maxPrice >= MAX_HOURLY_RATE ? "+" : ""}</label>
              <input type="range" min={DEFAULT_HOURLY_RATE + 1} max={MAX_HOURLY_RATE} step={1} value={maxPrice} onChange={(e) => { setMaxPrice(Number(e.target.value)); resetPage(); }} className="w-full accent-indigo-600" />
            </div>
          </div>
        </div>
        {/* Specialties */}
        <div>
          <p className="text-sm font-medium text-slate-900 mb-2">Specialties</p>
          <div className="space-y-1.5">
            {SPECIALIZATIONS.map((spec) => (
              <label key={spec} className="flex items-center gap-2.5 cursor-pointer py-1">
                <input type="checkbox" checked={selectedSpecs.includes(spec)} onChange={() => toggleSpec(spec)} className="h-4 w-4 rounded text-indigo-600" />
                <span className="text-sm text-slate-700">{spec}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Dialect */}
        <div>
          <p className="text-sm font-medium text-slate-900 mb-2">Dialect</p>
          <div className="space-y-1.5">
            {DIALECTS.map((dialect) => (
              <label key={dialect} className="flex items-center gap-2.5 cursor-pointer py-1">
                <input type="checkbox" checked={selectedDialects.includes(dialect)} onChange={() => toggleDialect(dialect)} className="h-4 w-4 rounded text-indigo-600" />
                <span className="text-sm text-slate-700">{dialect}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Native speaker */}
        <div>
          <p className="text-sm font-medium text-slate-900 mb-2">Native speaker</p>
          <div className="space-y-1.5">
            {[
              { value: "all" as const, label: "All tutors" },
              { value: "native" as const, label: "Native speakers only" },
              { value: "non-native" as const, label: "Non-native speakers" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer py-1">
                <input type="radio" name="native-mobile" checked={nativeFilter === opt.value} onChange={() => { setNativeFilter(opt.value); resetPage(); }} className="h-4 w-4 text-indigo-600" />
                <span className="text-sm text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Category */}
        <div>
          <p className="text-sm font-medium text-slate-900 mb-2">Tutor categories</p>
          <div className="space-y-1.5">
            {[
              { value: "all" as const, label: "All" },
              { value: "professional" as const, label: "Professional" },
              { value: "super" as const, label: "Super Tutor" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer py-1">
                <input type="radio" name="category-mobile" checked={tutorCategory === opt.value} onChange={() => { setTutorCategory(opt.value); resetPage(); }} className="h-4 w-4 text-indigo-600" />
                <span className="text-sm text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button onClick={clearFilters} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Clear all
          </button>
          <button onClick={() => setMobileFiltersOpen(false)} className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700">
            Show {filtered.length} results
          </button>
        </div>
      </MobileFilterDrawer>

      {/* ═══ Teacher list ═══ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6" ref={listRef}>
        {paginated.length > 0 ? (
          <>
            <div className="space-y-4">
              {paginated.map((teacher, index) => (
                <TutorCard
                  key={teacher.id}
                  teacher={teacher}
                  isFeatured={page === 1 && index === 0}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-10">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  ← Previous
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    // Show first, last, current, and neighbors
                    if (totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                            p === page ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
                          }`}
                          aria-label={`Page ${p}`}
                          aria-current={p === page ? "page" : undefined}
                        >
                          {p}
                        </button>
                      );
                    }
                    // Show ellipsis
                    if (p === 2 || p === totalPages - 1) {
                      return (
                        <span key={p} className="h-9 w-9 flex items-center justify-center text-slate-400 text-sm">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next →
                </Button>
              </nav>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Search className="h-16 w-16 mx-auto mb-4 text-slate-200" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No Swahili tutors match your filters
            </h3>
            <p className="text-slate-400 mb-6">Try adjusting your filters or</p>
            <Button variant="outline" onClick={clearFilters}>
              Browse all tutors
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
