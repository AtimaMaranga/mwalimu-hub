"use client";

export default function TeachersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 mb-4">
          <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to load teachers</h2>
        <p className="text-slate-500 text-sm mb-6">
          We couldn&apos;t load the teacher directory. This is usually temporary — please try again.
        </p>
        <button
          onClick={reset}
          className="bg-indigo-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
