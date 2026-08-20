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
    <div className="rounded-lg border border-fog/30 bg-white p-4">
      <h2 className="font-semibold text-basalt">Distance</h2>
      {coords ? (
        <p className="mt-1 text-glacial">
          {haversineDistanceMiles(coords, location).toFixed(1)} mi from you
        </p>
      ) : (
        <p className="mt-1 text-sm text-fog">{error ?? "Locating…"}</p>
      )}
      <ul className="mt-3 space-y-1 text-sm text-basalt/70">
        {cities.map(({ city, miles }) => (
          <li key={city.name}>
            {city.name}, {city.state} &mdash; {miles.toFixed(0)} mi
          </li>
        ))}
      </ul>
    </div>
  );
}
