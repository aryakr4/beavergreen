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
          ? "rounded-full bg-rust px-4 py-2 text-sm font-medium text-white"
          : "rounded-full border border-rust px-4 py-2 text-sm font-medium text-rust"
      }
    >
      {saved ? "Saved" : "Save"}
    </button>
  );
}
