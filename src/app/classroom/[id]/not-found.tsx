import Link from "next/link";

export default function ClassroomNotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 mb-6">
          <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Lesson Not Found</h1>
        <p className="text-slate-400 text-sm mb-6">
          This lesson doesn&apos;t exist or has already ended.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-teal-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
