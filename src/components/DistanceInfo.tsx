"use client";

import { distanceToMajorCities, haversineDistanceMiles } from "@/lib/distance";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { Location } from "@/lib/types";

export interface DistanceInfoProps {
  location: Location;
}

export default function DistanceInfo({ location }: DistanceInfoProps) {
  const { coords, error } = useGeolocation();
  const cities = distanceToMajorCities(location);

  return (
    <div className="bevel-panel rounded-lg border border-steel bg-gradient-to-b from-steel-light to-white p-4">
      <h2 className="text-emboss font-semibold text-oregon-blue-dark">Distance</h2>
      {coords ? (
        <p className="bevel-inset mt-2 inline-block rounded border border-washington-green-dark bg-gradient-to-b from-washington-green-light to-washington-green px-2.5 py-1 text-sm font-bold text-white">
          {haversineDistanceMiles(coords, location).toFixed(1)} mi from you
        </p>
      ) : (
        <p className="mt-1 text-sm text-oregon-blue/50">{error ?? "Locating…"}</p>
      )}
      <ul className="mt-3 space-y-1 text-sm text-oregon-blue-dark/70">
        {cities.map(({ city, miles }) => (
          <li key={city.name} className="flex justify-between border-b border-steel/60 py-0.5 last:border-0">
            <span>{city.name}, {city.state}</span>
            <span className="font-bold text-oregon-blue-dark">{miles.toFixed(0)} mi</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
