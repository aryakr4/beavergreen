"use client";

import { useEffect, useState } from "react";

interface ApiReview {
  id: number;
  locationId: string;
  rating: number;
  text: string;
  authorName?: string;
  createdAt: string;
}

export interface ReviewListProps {
  locationId: string;
  refreshKey?: number;
}

export default function ReviewList({ locationId, refreshKey }: ReviewListProps) {
  const [reviews, setReviews] = useState<ApiReview[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // fetch result with cancellation guard, not a sync loop
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReviews(null);
    setError(null);

    fetch(`/api/reviews?locationId=${encodeURIComponent(locationId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load reviews"))))
      .then((data: ApiReview[]) => {
        if (!cancelled) setReviews(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load reviews right now.");
      });

    return () => {
      cancelled = true;
    };
  }, [locationId, refreshKey]);

  if (error) {
    return (
      <p className="bevel-inset rounded border border-gold-dark bg-gold/20 px-3 py-2 text-sm text-oregon-blue-dark">
        {error}
      </p>
    );
  }
  if (reviews === null) return <p className="text-sm text-oregon-blue/50">Loading reviews…</p>;
  if (reviews.length === 0) return <p className="text-sm text-oregon-blue/50">No reviews yet — be the first.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="card-glint bevel-panel rounded-lg border border-steel bg-gradient-to-b from-white to-steel-light p-3"
        >
          <p className="text-sm font-medium text-oregon-blue-dark">
            <span className="text-emboss text-gold-dark">{"★".repeat(review.rating)}</span>
            <span className="text-steel-dark">{"☆".repeat(5 - review.rating)}</span>
            {review.authorName && (
              <span className="ml-2 font-normal text-oregon-blue/50">by {review.authorName}</span>
            )}
          </p>
          <p className="mt-1 text-oregon-blue-dark/80">{review.text}</p>
        </li>
      ))}
    </ul>
  );
}
