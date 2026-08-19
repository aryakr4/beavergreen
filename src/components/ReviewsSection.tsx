"use client";

import { useState } from "react";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";

export default function ReviewsSection({ locationId }: { locationId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-stone-900">Reviews</h2>
      <ReviewList locationId={locationId} refreshKey={refreshKey} />
      <ReviewForm locationId={locationId} onSubmitted={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
}
