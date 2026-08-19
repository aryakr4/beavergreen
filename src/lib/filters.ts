import { haversineDistanceMiles } from "@/lib/distance";
import type { Category, Coordinates, Difficulty, Location, USState } from "@/lib/types";

export interface LocationFilters {
  category?: Category;
  state?: USState;
  difficulty?: Difficulty;
  maxDistanceMiles?: number;
  origin?: Coordinates;
}

export function filterLocations(
  locations: Location[],
  filters: LocationFilters
): Location[] {
  return locations.filter((loc) => {
    if (filters.category && loc.category !== filters.category) return false;
    if (filters.state && loc.state !== filters.state) return false;
    if (filters.difficulty && loc.difficulty !== filters.difficulty) return false;
    if (filters.maxDistanceMiles != null && filters.origin) {
      const miles = haversineDistanceMiles(filters.origin, loc);
      if (miles > filters.maxDistanceMiles) return false;
    }
    return true;
  });
}
