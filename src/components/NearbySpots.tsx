import { nearbyLocations } from "@/lib/distance";
import LocationCard from "@/components/LocationCard";
import type { Location } from "@/lib/types";

export interface NearbySpotsProps {
  location: Location;
  allLocations: Location[];
  maxMiles?: number;
}

export default function NearbySpots({ location, allLocations, maxMiles = 50 }: NearbySpotsProps) {
  const nearby = nearbyLocations(location, allLocations, maxMiles);

  if (nearby.length === 0) {
    return <p className="text-sm text-oregon-blue/50">No nearby spots within {maxMiles} miles yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {nearby.map(({ location: loc, miles }) => (
        <LocationCard key={loc.id} location={loc} distanceMiles={miles} />
      ))}
    </div>
  );
}
