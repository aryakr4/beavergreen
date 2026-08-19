import { describe, it, expect } from "vitest";
import { filterLocations } from "@/lib/filters";
import type { Location } from "@/lib/types";

const locations: Location[] = [
  {
    id: "a", name: "A", state: "OR", category: "hike", difficulty: "easy",
    lat: 45.5, lng: -122.5, description: "", photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
  },
  {
    id: "b", name: "B", state: "WA", category: "waterfall", difficulty: "hard",
    lat: 47.6, lng: -122.3, description: "", photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
  },
  {
    id: "c", name: "C", state: "OR", category: "waterfall", difficulty: "moderate",
    lat: 45.51, lng: -122.51, description: "", photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
  },
];

describe("filterLocations", () => {
  it("returns all locations when no filters are set", () => {
    expect(filterLocations(locations, {})).toHaveLength(3);
  });

  it("filters by category", () => {
    const result = filterLocations(locations, { category: "waterfall" });
    expect(result.map((l) => l.id)).toEqual(["b", "c"]);
  });

  it("filters by state", () => {
    const result = filterLocations(locations, { state: "OR" });
    expect(result.map((l) => l.id)).toEqual(["a", "c"]);
  });

  it("filters by difficulty", () => {
    const result = filterLocations(locations, { difficulty: "hard" });
    expect(result.map((l) => l.id)).toEqual(["b"]);
  });

  it("filters by max distance from an origin", () => {
    const result = filterLocations(locations, {
      origin: { lat: 45.5, lng: -122.5 },
      maxDistanceMiles: 10,
    });
    expect(result.map((l) => l.id).sort()).toEqual(["a", "c"]);
  });

  it("combines multiple filters", () => {
    const result = filterLocations(locations, { state: "OR", category: "waterfall" });
    expect(result.map((l) => l.id)).toEqual(["c"]);
  });
});
