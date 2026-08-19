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

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (reviews === null) return <p className="text-sm text-stone-400">Loading reviews…</p>;
  if (reviews.length === 0) return <p className="text-sm text-stone-500">No reviews yet — be the first.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-lg border border-stone-200 bg-white p-3">
          <p className="text-sm font-medium text-stone-900">
            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
            {review.authorName && <span className="ml-2 font-normal text-stone-500">by {review.authorName}</span>}
          </p>
          <p className="mt-1 text-stone-700">{review.text}</p>
        </li>
      ))}
    </ul>
  );
}
