import { describe, it, expect } from "vitest";
import { haversineDistanceMiles, distanceToMajorCities, nearbyLocations } from "@/lib/distance";
import type { Location } from "@/lib/types";

const portland = { lat: 45.5152, lng: -122.6784 };
const seattle = { lat: 47.6062, lng: -122.3321 };

const makeLocation = (overrides: Partial<Location>): Location => ({
  id: "test-loc",
  name: "Test Location",
  state: "OR",
  category: "hike",
  difficulty: "easy",
  lat: 45.5,
  lng: -122.5,
  description: "test",
  photos: ["/images/placeholder.svg"],
  createdAt: "2026-08-19",
  ...overrides,
});

describe("haversineDistanceMiles", () => {
  it("returns 0 for identical points", () => {
    expect(haversineDistanceMiles(portland, portland)).toBeCloseTo(0, 5);
  });

  it("returns the known approximate distance between Portland and Seattle", () => {
    const miles = haversineDistanceMiles(portland, seattle);
    expect(miles).toBeGreaterThan(140);
    expect(miles).toBeLessThan(150);
  });
});

describe("distanceToMajorCities", () => {
  it("returns one entry per major city, sorted nearest-first", () => {
    const results = distanceToMajorCities(portland);
    expect(results.length).toBe(8);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].miles).toBeGreaterThanOrEqual(results[i - 1].miles);
    }
    expect(results[0].city.name).toBe("Portland");
    expect(results[0].miles).toBeCloseTo(0, 5);
  });
});

describe("nearbyLocations", () => {
  it("excludes the target location itself and locations beyond maxMiles", () => {
    const target = makeLocation({ id: "a", lat: 45.5, lng: -122.5 });
    const near = makeLocation({ id: "b", lat: 45.51, lng: -122.51 });
    const far = makeLocation({ id: "c", lat: 47.6, lng: -122.33 });
    const results = nearbyLocations(target, [target, near, far], 10);
    expect(results.map((r) => r.location.id)).toEqual(["b"]);
  });

  it("sorts results nearest-first", () => {
    const target = makeLocation({ id: "a", lat: 45.5, lng: -122.5 });
    const mid = makeLocation({ id: "b", lat: 45.6, lng: -122.5 });
    const near = makeLocation({ id: "c", lat: 45.51, lng: -122.5 });
    const results = nearbyLocations(target, [target, mid, near], 100);
    expect(results.map((r) => r.location.id)).toEqual(["c", "b"]);
  });
});
