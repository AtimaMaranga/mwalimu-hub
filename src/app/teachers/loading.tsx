export default function TeachersLoading() {
  return (
    <>
      {/* Header skeleton */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
        <div className="h-10 w-96 max-w-full bg-slate-100 rounded-xl animate-pulse" />
      </div>

      {/* Filter bar skeleton */}
      <div className="border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="hidden lg:grid grid-cols-4 gap-3 mb-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-slate-50 rounded-lg border border-slate-100 animate-pulse" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-9 w-28 bg-slate-50 rounded-full animate-pulse" />
            ))}
            <div className="ml-auto flex gap-2">
              <div className="h-9 w-44 bg-slate-50 rounded-full animate-pulse" />
              <div className="h-9 w-56 bg-slate-50 rounded-full animate-pulse hidden sm:block" />
            </div>
          </div>
        </div>
      </div>

      {/* Card skeletons */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Popularity banner skeleton */}
            {i === 0 && <div className="h-10 bg-slate-50 border-b border-slate-100 animate-pulse" />}
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
              {/* Photo skeleton */}
              <div className="w-full sm:w-[180px] h-[200px] bg-slate-100 rounded-lg animate-pulse shrink-0" />
              {/* Info skeleton */}
              <div className="flex-1 space-y-3">
                <div className="h-6 w-40 bg-slate-100 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-5 w-24 bg-slate-50 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-slate-50 rounded animate-pulse" />
                </div>
                <div className="h-4 w-32 bg-slate-50 rounded animate-pulse" />
                <div className="h-4 w-48 bg-slate-50 rounded animate-pulse" />
                <div className="space-y-2 mt-2">
                  <div className="h-4 w-full bg-slate-50 rounded animate-pulse" />
                  <div className="h-4 w-4/5 bg-slate-50 rounded animate-pulse" />
                  <div className="h-4 w-3/5 bg-slate-50 rounded animate-pulse" />
                </div>
              </div>
              {/* Price + CTA skeleton */}
              <div className="sm:w-[200px] shrink-0 space-y-3">
                <div className="h-8 w-20 bg-slate-100 rounded animate-pulse sm:ml-auto" />
                <div className="h-3 w-24 bg-slate-50 rounded animate-pulse sm:ml-auto" />
                <div className="flex gap-4 mt-3 sm:justify-end">
                  <div className="h-10 w-14 bg-slate-50 rounded animate-pulse" />
                  <div className="h-10 w-14 bg-slate-50 rounded animate-pulse" />
                  <div className="h-10 w-14 bg-slate-50 rounded animate-pulse" />
                </div>
                <div className="h-11 w-full bg-indigo-50 rounded-xl animate-pulse mt-2" />
                <div className="h-11 w-full bg-slate-50 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
