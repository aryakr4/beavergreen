"use client";

import { useFavorites } from "@/hooks/useFavorites";

export interface FavoriteButtonProps {
  locationId: string;
}

export default function FavoriteButton({ locationId }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(locationId);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(locationId)}
      className={
        saved
          ? "rounded-full bg-gold px-4 py-2 text-sm font-medium text-oregon-blue"
          : "rounded-full border border-oregon-blue px-4 py-2 text-sm font-medium text-oregon-blue"
      }
    >
      {saved ? "Saved" : "Save"}
    </button>
  );
}
