"use client";

import { haversineDistanceMiles } from "@/lib/distance";
import LocationCard from "@/components/LocationCard";
import type { Coordinates, Location } from "@/lib/types";

export interface LocationListProps {
  locations: Location[];
  origin?: Coordinates | null;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export default function LocationList({ locations, origin, selectedId, onSelect }: LocationListProps) {
  if (locations.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-oregon-blue/25 p-6 text-center text-oregon-blue/50">
        No spots match your filters yet — try widening them.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {locations.map((location) => (
        <div
          key={location.id}
          onMouseEnter={() => onSelect?.(location.id)}
          className={selectedId === location.id ? "ring-2 ring-washington-green rounded-lg" : undefined}
        >
          <LocationCard
            location={location}
            distanceMiles={origin ? haversineDistanceMiles(origin, location) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
