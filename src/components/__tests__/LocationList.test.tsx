import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LocationList from "@/components/LocationList";
import type { Location } from "@/lib/types";

const locations: Location[] = [
  { id: "a", name: "Spot A", state: "OR", category: "hike", difficulty: "easy", lat: 45.5, lng: -122.5, description: "", photos: ["/images/placeholder.svg"], createdAt: "2026-08-19" },
  { id: "b", name: "Spot B", state: "WA", category: "lake", difficulty: "moderate", lat: 47.6, lng: -122.3, description: "", photos: ["/images/placeholder.svg"], createdAt: "2026-08-19" },
];

describe("LocationList", () => {
  it("renders a card per location", () => {
    render(<LocationList locations={locations} />);
    expect(screen.getByText("Spot A")).toBeInTheDocument();
    expect(screen.getByText("Spot B")).toBeInTheDocument();
  });

  it("shows an empty state when there are no locations", () => {
    render(<LocationList locations={[]} />);
    expect(screen.getByText(/no spots match/i)).toBeInTheDocument();
  });

  it("shows drive time from the origin when provided", () => {
    render(<LocationList locations={locations} origin={{ lat: 45.5, lng: -122.5 }} />);
    expect(screen.getAllByText(/drive$/i).length).toBeGreaterThan(0);
  });
});
