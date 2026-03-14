export default function TeachersLoading() {
  return (
    <>
      {/* Header skeleton */}
      <div className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-10 w-80 bg-white/10 rounded-xl mx-auto mb-4 animate-pulse" />
          <div className="h-5 w-96 bg-white/10 rounded-lg mx-auto mb-8 animate-pulse" />
          <div className="h-12 w-full max-w-xl bg-white/10 rounded-xl mx-auto animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-10 w-32 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-10 w-40 bg-slate-100 rounded-xl animate-pulse" />
        </div>

        {/* Grid skeleton */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-24 bg-slate-100 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-32 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-4 w-48 bg-slate-50 rounded-lg animate-pulse" />
                <div className="flex gap-2 mt-3">
                  <div className="h-6 w-20 bg-slate-50 rounded-full animate-pulse" />
                  <div className="h-6 w-16 bg-slate-50 rounded-full animate-pulse" />
                </div>
                <div className="h-10 w-full bg-indigo-50 rounded-xl animate-pulse mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
