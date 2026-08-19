import rawLocations from "./locations.json";
import type { Location } from "@/lib/types";

const locations = rawLocations as Location[];

export function getAllLocations(): Location[] {
  return locations;
}

export function getLocationById(id: string): Location | undefined {
  return locations.find((loc) => loc.id === id);
}
