import type { USState } from "@/lib/types";

export interface MajorCity {
  name: string;
  state: USState;
  lat: number;
  lng: number;
}

export const MAJOR_CITIES: MajorCity[] = [
  { name: "Portland", state: "OR", lat: 45.5152, lng: -122.6784 },
  { name: "Seattle", state: "WA", lat: 47.6062, lng: -122.3321 },
  { name: "Eugene", state: "OR", lat: 44.0521, lng: -123.0868 },
  { name: "Bend", state: "OR", lat: 44.0582, lng: -121.3153 },
  { name: "Spokane", state: "WA", lat: 47.6588, lng: -117.4260 },
  { name: "Vancouver", state: "WA", lat: 45.6387, lng: -122.6615 },
  { name: "Tacoma", state: "WA", lat: 47.2529, lng: -122.4443 },
  { name: "Salem", state: "OR", lat: 44.9429, lng: -123.0351 },
];
