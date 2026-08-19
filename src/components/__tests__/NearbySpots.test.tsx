import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NearbySpots from "@/components/NearbySpots";
import type { Location } from "@/lib/types";

const target: Location = {
  id: "a", name: "Target", state: "OR", category: "hike", difficulty: "easy",
  lat: 45.5, lng: -122.5, description: "", photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
};
const near: Location = { ...target, id: "b", name: "Nearby Spot", lat: 45.51, lng: -122.51 };
const far: Location = { ...target, id: "c", name: "Far Spot", lat: 47.6, lng: -122.33 };

describe("NearbySpots", () => {
  it("lists only spots within range, excluding the target", () => {
    render(<NearbySpots location={target} allLocations={[target, near, far]} maxMiles={10} />);
    expect(screen.getByText("Nearby Spot")).toBeInTheDocument();
    expect(screen.queryByText("Far Spot")).not.toBeInTheDocument();
    expect(screen.queryByText("Target")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing is nearby", () => {
    render(<NearbySpots location={target} allLocations={[target, far]} maxMiles={10} />);
    expect(screen.getByText(/no nearby spots/i)).toBeInTheDocument();
  });
});
