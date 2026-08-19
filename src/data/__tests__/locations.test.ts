import { describe, it, expect } from "vitest";
import { getAllLocations, getLocationById } from "@/data/locations";

describe("locations data loader", () => {
  it("returns all seed locations with required fields", () => {
    const locations = getAllLocations();
    expect(locations.length).toBeGreaterThanOrEqual(5);
    for (const loc of locations) {
      expect(loc.id).toBeTruthy();
      expect(loc.name).toBeTruthy();
      expect(["OR", "WA"]).toContain(loc.state);
      expect(typeof loc.lat).toBe("number");
      expect(typeof loc.lng).toBe("number");
      expect(loc.photos.length).toBeGreaterThan(0);
    }
  });

  it("finds a location by id", () => {
    const loc = getLocationById("multnomah-falls");
    expect(loc?.name).toBe("Multnomah Falls");
  });

  it("returns undefined for an unknown id", () => {
    expect(getLocationById("nonexistent")).toBeUndefined();
  });
});
