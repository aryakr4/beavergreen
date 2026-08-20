"use client";

import { useMemo } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { getAllLocations } from "@/data/locations";
import LocationList from "@/components/LocationList";
import PassportStats from "@/components/PassportStats";

export default function PassportPage() {
  const { favoriteIds } = useFavorites();
  const allLocations = useMemo(() => getAllLocations(), []);
  const favorites = allLocations.filter((loc) => favoriteIds.includes(loc.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-basalt">Your Passport</h1>
        <p className="mt-1 text-basalt/70">Spots you&apos;ve saved to explore.</p>
      </div>

      {favorites.length === 0 ? (
        <p className="rounded-lg border border-dashed border-fog/50 p-6 text-center text-fog">
          You haven&apos;t saved any spots yet — browse the map and hit Save on ones you like.
        </p>
      ) : (
        <>
          <PassportStats locations={favorites} />
          <LocationList locations={favorites} />
        </>
      )}
    </div>
  );
}
