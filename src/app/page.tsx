"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import FilterBar from "@/components/FilterBar";
import LocationList from "@/components/LocationList";
import { getAllLocations } from "@/data/locations";
import { filterLocations, type LocationFilters } from "@/lib/filters";
import { useGeolocation } from "@/hooks/useGeolocation";

const LocationMap = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const allLocations = useMemo(() => getAllLocations(), []);
  const [filters, setFilters] = useState<LocationFilters>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { coords, error: geoError } = useGeolocation();

  const filtered = useMemo(() => {
    const withOrigin: LocationFilters = coords ? { ...filters, origin: coords } : filters;
    return filterLocations(allLocations, withOrigin);
  }, [allLocations, filters, coords]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Where should you go this weekend?</h1>
        <p className="mt-1 text-stone-600">
          Hand-picked spots across Oregon and Washington — pictures, notes, and how far they are from you.
        </p>
        {geoError && <p className="mt-1 text-sm text-stone-400">{geoError}</p>}
      </div>

      <div>
        <FilterBar filters={filters} onChange={setFilters} disabled={!coords} />
        {!coords && (
          <p className="mt-1 text-sm text-stone-400">
            Enable location to filter by distance.
          </p>
        )}
      </div>

      <div className="h-96 overflow-hidden rounded-lg border border-stone-200">
        <LocationMap locations={filtered} selectedId={selectedId} onSelect={setSelectedId} origin={coords} />
      </div>

      <LocationList locations={filtered} origin={coords} selectedId={selectedId} onSelect={setSelectedId} />
    </div>
  );
}
