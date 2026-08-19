"use client";

import { useCallback, useEffect, useState } from "react";
import { getFavoriteIds, toggleFavorite as toggleFavoriteStorage } from "@/lib/favorites";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getFavoriteIds());
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds(toggleFavoriteStorage(id));
  }, []);

  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  return { favoriteIds, isFavorite, toggleFavorite };
}
