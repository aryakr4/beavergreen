import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import LocationMap from "@/components/Map";
import type { Location } from "@/lib/types";

const locations: Location[] = [
  {
    id: "a", name: "Spot A", state: "OR", category: "hike", difficulty: "easy",
    lat: 45.5, lng: -122.5, description: "", photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
  },
  {
    id: "b", name: "Spot B", state: "WA", category: "lake", difficulty: "moderate",
    lat: 47.6, lng: -122.3, description: "", photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
  },
];

// Leaflet's marker icons render as <img class="leaflet-marker-icon" alt="Marker">
// in jsdom rather than as accessibly-named buttons (Leaflet manages hit-testing
// and pointer events itself, outside of standard ARIA semantics), so the DOM is
// queried directly by Leaflet's own marker class instead of by role/name.
describe("LocationMap", () => {
  it("renders a marker for each location", () => {
    const { container } = render(<LocationMap locations={locations} />);
    const markers = container.querySelectorAll(".leaflet-marker-icon");
    expect(markers.length).toBe(2);
  });

  it("calls onSelect when a marker is activated", () => {
    const onSelect = vi.fn();
    const { container } = render(<LocationMap locations={locations} onSelect={onSelect} />);
    const markers = container.querySelectorAll(".leaflet-marker-icon");
    expect(markers.length).toBe(2);
    fireEvent.click(markers[0]);
    expect(onSelect).toHaveBeenCalledWith("a");
  });
});
