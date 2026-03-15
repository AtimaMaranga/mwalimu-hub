import Link from "next/link";

export default function BlogCTA() {
  return (
    <div className="bg-indigo-50 rounded-2xl p-8 my-12 text-center border border-indigo-100">
      <h3 className="text-2xl font-bold font-heading text-slate-900 mb-3">
        Ready to Start Speaking Swahili?
      </h3>
      <p className="text-slate-600 mb-6 max-w-lg mx-auto">
        Connect with a native Swahili tutor for personalized 1-on-1 lessons.
        Your first trial lesson helps you find the perfect teacher.
      </p>
      <Link
        href="/teachers"
        className="inline-block bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
      >
        Find a Swahili Tutor &rarr;
      </Link>
    </div>
  );
}
