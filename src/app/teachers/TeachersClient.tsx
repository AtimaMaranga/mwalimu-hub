"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, X, Users } from "lucide-react";
import type { Teacher } from "@/types";
import { SPECIALIZATIONS, DIALECTS } from "@/types";
import TeacherCard from "@/components/sections/TeacherCard";
import Button from "@/components/ui/Button";

interface TeachersClientProps {
  initialTeachers: Teacher[];
  isAuthenticated?: boolean;
}

const TEACHERS_PER_PAGE = 12;

export default function TeachersClient({ initialTeachers, isAuthenticated = false }: TeachersClientProps) {
  const [search, setSearch] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [nativeOnly, setNativeOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(50);
  const [selectedDialects, setSelectedDialects] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"rating" | "price_asc" | "price_desc" | "newest">("rating");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

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
  const gridRef = useRef<HTMLDivElement>(null);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  // Collect active filter chips for display
  const activeChips: { label: string; onRemove: () => void }[] = [];
  selectedSpecs.forEach((s) =>
    activeChips.push({ label: s, onRemove: () => toggleSpec(s) })
  );
  selectedDialects.forEach((d) =>
    activeChips.push({ label: d, onRemove: () => toggleDialect(d) })
  );
  if (nativeOnly) activeChips.push({ label: "Native Only", onRemove: () => { setNativeOnly(false); setPage(1); } });
  if (maxPrice < 50) activeChips.push({ label: `≤ $${maxPrice}/hr`, onRemove: () => { setMaxPrice(50); setPage(1); } });

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-800 to-teal-950 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold font-heading mb-4 tracking-tight">
            Find Your Swahili Teacher
          </h1>
          <p className="text-teal-100 text-lg max-w-2xl mx-auto mb-8">
            Browse our community of verified native Swahili teachers and find the
            perfect match for your learning goals.
          </p>
          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search by name, specialisation, or keywords..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-white text-slate-900 placeholder-slate-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
              aria-label="Search teachers"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setPage(1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sticky toolbar */}
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-100 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 h-5 w-5 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center">
                    {activeChips.length}
                  </span>
                )}
              </button>

              <p className="text-sm text-slate-500 font-medium">
                Showing <span className="text-slate-900 font-semibold">{filtered.length}</span> tutor{filtered.length !== 1 ? "s" : ""}
              </p>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
              aria-label="Sort teachers"
            >
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {activeChips.map((chip) => (
                <button
                  key={chip.label}
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium hover:bg-teal-100 transition-colors group"
                >
                  {chip.label}
                  <X className="h-3 w-3 text-teal-400 group-hover:text-teal-600" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`${filtersOpen ? "block" : "hidden"} lg:block w-full lg:w-64 shrink-0`}
            aria-label="Filter options"
          >
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-36 space-y-6">
              {/* Price */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 text-sm">Max Price (USD/hour)</h3>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }}
                  className="w-full accent-teal-600"
                  aria-label={`Maximum price: $${maxPrice} per hour`}
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>$5</span>
                  <span className="font-semibold text-teal-700">${maxPrice}/hr</span>
                  <span>$50+</span>
                </div>
              </div>

              {/* Specialisations */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 text-sm">Specialisation</h3>
                <div className="space-y-2">
                  {SPECIALIZATIONS.map((spec) => (
                    <label key={spec} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedSpecs.includes(spec)}
                        onChange={() => toggleSpec(spec)}
                        className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                        {spec}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dialect */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 text-sm">Dialect</h3>
                <div className="space-y-2">
                  {DIALECTS.map((dialect) => (
                    <label key={dialect} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedDialects.includes(dialect)}
                        onChange={() => toggleDialect(dialect)}
                        className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                        {dialect}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Native Speaker */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 text-sm">Teacher Type</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nativeOnly}
                    onChange={(e) => { setNativeOnly(e.target.checked); setPage(1); }}
                    className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-slate-600">Native speakers only</span>
                </label>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                fullWidth
              >
                Reset filters
              </Button>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0" ref={gridRef}>
            {paginated.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginated.map((teacher) => (
                    <TeacherCard key={teacher.id} teacher={teacher} isAuthenticated={isAuthenticated} />
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
                              ? "bg-teal-600 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                          aria-label={`Go to page ${p}`}
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
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
                  <Users className="h-8 w-8 text-slate-300" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No tutors found</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                  No tutors match your current filters. Try adjusting your criteria.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
