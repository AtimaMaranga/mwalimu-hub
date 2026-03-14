"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, ChevronDown, X, Users } from "lucide-react";
import type { Teacher } from "@/types";
import { SPECIALIZATIONS, DIALECTS } from "@/types";
import TeacherCard from "@/components/sections/TeacherCard";
import Button from "@/components/ui/Button";

interface TeachersClientProps {
  initialTeachers: Teacher[];
}

const TEACHERS_PER_PAGE = 10;

/* ─── Dropdown filter button ─── */
function FilterDropdown({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
          value
            ? "border-indigo-300 bg-indigo-50 text-indigo-700"
            : "border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      >
        {value || label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 max-h-72 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}

export default function TeachersClient({ initialTeachers }: TeachersClientProps) {
  const [search, setSearch] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [nativeOnly, setNativeOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(50);
  const [selectedDialects, setSelectedDialects] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"rating" | "price_asc" | "price_desc" | "newest">("rating");
  const [page, setPage] = useState(1);

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
      result = result.filter((t) =>
        selectedSpecs.some((s) => t.specializations?.includes(s))
      );
    }

    if (selectedDialects.length > 0) {
      result = result.filter((t) => t.dialect && selectedDialects.includes(t.dialect));
    }

    if (nativeOnly) {
      result = result.filter((t) => t.is_native_speaker);
    }

    result = result.filter((t) => !t.hourly_rate || t.hourly_rate <= maxPrice);

    result.sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price_asc") return (a.hourly_rate ?? 0) - (b.hourly_rate ?? 0);
      if (sortBy === "price_desc") return (b.hourly_rate ?? 0) - (a.hourly_rate ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [initialTeachers, search, selectedSpecs, selectedDialects, nativeOnly, maxPrice, sortBy]);

  const totalPages = Math.ceil(filtered.length / TEACHERS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * TEACHERS_PER_PAGE, page * TEACHERS_PER_PAGE);
  const listRef = useRef<HTMLDivElement>(null);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
    setPage(1);
  };

  const toggleDialect = (dialect: string) => {
    setSelectedDialects((prev) =>
      prev.includes(dialect) ? prev.filter((d) => d !== dialect) : [...prev, dialect]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedSpecs([]);
    setSelectedDialects([]);
    setNativeOnly(false);
    setMaxPrice(50);
    setSortBy("rating");
    setPage(1);
  };

  const hasActiveFilters =
    search || selectedSpecs.length > 0 || selectedDialects.length > 0 || nativeOnly || maxPrice < 50 || sortBy !== "rating";

  const priceLabel = maxPrice < 50 ? `Up to $${maxPrice}/hr` : undefined;
  const specLabel = selectedSpecs.length > 0
    ? selectedSpecs.length === 1 ? selectedSpecs[0] : `${selectedSpecs.length} selected`
    : undefined;
  const dialectLabel = selectedDialects.length > 0
    ? selectedDialects.length === 1 ? selectedDialects[0] : `${selectedDialects.length} selected`
    : undefined;

  return (
    <>
      {/* Page heading */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
          {filtered.length} Swahili tutor{filtered.length !== 1 ? "s" : ""} to help you reach fluency
        </h1>
      </div>

      {/* ── Filter bar ── */}
      <div className="sticky top-16 z-40 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Row 1: Primary filters */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <FilterDropdown label="Specialties" value={specLabel}>
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

            <FilterDropdown label="Dialect" value={dialectLabel}>
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

            <FilterDropdown label="Native speaker" value={nativeOnly ? "Native only" : undefined}>
              <label className="flex items-center gap-2.5 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={nativeOnly}
                  onChange={(e) => { setNativeOnly(e.target.checked); setPage(1); }}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700">Native speakers only</span>
              </label>
            </FilterDropdown>

            <FilterDropdown label="Price per lesson" value={priceLabel}>
              <div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>$5</span>
                  <span className="font-semibold text-indigo-700">${maxPrice}/hr</span>
                  <span>$50+</span>
                </div>
              </div>
            </FilterDropdown>

            {/* Sort + Search — right side */}
            <div className="flex items-center gap-2 ml-auto">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setPage(1); }}
                className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                aria-label="Sort teachers"
              >
                <option value="rating">Sort by: Top rated</option>
                <option value="price_asc">Sort by: Price low → high</option>
                <option value="price_desc">Sort by: Price high → low</option>
                <option value="newest">Sort by: Newest</option>
              </select>

              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search by name or keyword"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9 pr-8 py-2.5 w-56 rounded-lg border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  aria-label="Search teachers"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(""); setPage(1); }}
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
            <div className="flex flex-wrap items-center gap-2">
              {selectedSpecs.map((spec) => (
                <button
                  key={spec}
                  onClick={() => toggleSpec(spec)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-colors"
                >
                  {spec}
                  <X className="h-3 w-3" />
                </button>
              ))}
              {selectedDialects.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDialect(d)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-colors"
                >
                  {d}
                  <X className="h-3 w-3" />
                </button>
              ))}
              {nativeOnly && (
                <button
                  onClick={() => { setNativeOnly(false); setPage(1); }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-colors"
                >
                  Native only
                  <X className="h-3 w-3" />
                </button>
              )}
              {maxPrice < 50 && (
                <button
                  onClick={() => { setMaxPrice(50); setPage(1); }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition-colors"
                >
                  ≤ ${maxPrice}/hr
                  <X className="h-3 w-3" />
                </button>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Mobile search (visible on small screens only) */}
          <div className="sm:hidden mt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search by name or keyword"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2.5 w-full rounded-lg border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                aria-label="Search teachers"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Teacher list ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6" ref={listRef}>
        {paginated.length > 0 ? (
          <>
            <div className="space-y-4">
              {paginated.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} variant="list" />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Previous
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                      aria-label={`Page ${p}`}
                      aria-current={p === page ? "page" : undefined}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Users className="h-16 w-16 mx-auto mb-4 text-slate-200" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No teachers found</h3>
            <p className="text-slate-400 mb-6">
              Try adjusting your filters or search terms.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
