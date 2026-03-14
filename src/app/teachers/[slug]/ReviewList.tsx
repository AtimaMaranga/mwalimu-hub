import type { Review } from "@/types";
import StarRating from "@/components/ui/StarRating";
import { getInitials } from "@/lib/utils";

interface ReviewListProps {
  reviews: Review[];
  averageRating: number;
}

export default function ReviewList({ reviews, averageRating }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-4">
        No reviews yet. Be the first to leave one!
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {/* Aggregate summary */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
        <div className="text-center">
          <p className="text-4xl font-bold text-slate-900">{averageRating.toFixed(1)}</p>
          <StarRating rating={averageRating} size="sm" className="mt-1 justify-center" />
        </div>
        <div className="text-sm text-slate-500">
          Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="flex gap-4">
            {/* Avatar */}
            <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-700 font-bold text-sm flex items-center justify-center shrink-0">
              {getInitials(review.student_name)}
            </div>
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="font-semibold text-sm text-slate-900">{review.student_name}</p>
                <time className="text-xs text-slate-400">
                  {new Date(review.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>
              <StarRating rating={review.rating} size="sm" className="mt-0.5 mb-1.5" />
              {review.comment && (
                <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
