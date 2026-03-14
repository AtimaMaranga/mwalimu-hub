export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="h-10 w-10 bg-slate-100 rounded-xl animate-pulse mb-4" />
              <div className="h-7 w-16 bg-slate-100 rounded-lg animate-pulse mb-1" />
              <div className="h-4 w-28 bg-slate-50 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="h-5 w-32 bg-slate-100 rounded-lg animate-pulse mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-slate-50 rounded-lg animate-pulse" />
                <div className="h-4 w-3/4 bg-slate-50 rounded-lg animate-pulse" />
                <div className="h-4 w-1/2 bg-slate-50 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="h-5 w-32 bg-slate-100 rounded-lg animate-pulse mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-9 w-9 bg-slate-100 rounded-xl animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-3 w-20 bg-slate-50 rounded-lg animate-pulse" />
                </div>
                <div className="h-6 w-16 bg-slate-50 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
