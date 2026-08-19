import { MAJOR_CITIES, type MajorCity } from "@/data/majorCities";
import type { Coordinates, Location } from "@/lib/types";

const EARTH_RADIUS_MILES = 3958.8;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceMiles(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return EARTH_RADIUS_MILES * c;
}

export function distanceToMajorCities(
  point: Coordinates
): { city: MajorCity; miles: number }[] {
  return MAJOR_CITIES.map((city) => ({
    city,
    miles: haversineDistanceMiles(point, city),
  })).sort((a, b) => a.miles - b.miles);
}

export function nearbyLocations(
  target: Location,
  all: Location[],
  maxMiles: number
): { location: Location; miles: number }[] {
  return all
    .filter((loc) => loc.id !== target.id)
    .map((location) => ({
      location,
      miles: haversineDistanceMiles(target, location),
    }))
    .filter((entry) => entry.miles <= maxMiles)
    .sort((a, b) => a.miles - b.miles);
}
