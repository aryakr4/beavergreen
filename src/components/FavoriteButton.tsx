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
          ? "bevel-raised rounded-full border border-gold-dark bg-gradient-to-b from-gold-light via-gold to-gold-dark px-4 py-2 text-sm font-bold text-oregon-blue-dark"
          : "bevel-raised rounded-full border border-oregon-blue-dark bg-gradient-to-b from-oregon-blue-light to-oregon-blue-dark px-4 py-2 text-sm font-bold text-gold-light"
      }
    >
      {saved ? "Saved" : "Save"}
    </button>
  );
}
