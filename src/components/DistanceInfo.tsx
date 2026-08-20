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
    <div className="rounded-lg border border-oregon-blue/15 bg-white p-4">
      <h2 className="font-semibold text-oregon-blue">Distance</h2>
      {coords ? (
        <p className="mt-1 text-washington-green">
          {haversineDistanceMiles(coords, location).toFixed(1)} mi from you
        </p>
      ) : (
        <p className="mt-1 text-sm text-oregon-blue/50">{error ?? "Locating…"}</p>
      )}
      <ul className="mt-3 space-y-1 text-sm text-oregon-blue/70">
        {cities.map(({ city, miles }) => (
          <li key={city.name}>
            {city.name}, {city.state} &mdash; {miles.toFixed(0)} mi
          </li>
        ))}
      </ul>
    </div>
  );
}
