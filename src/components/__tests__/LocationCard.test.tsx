import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LocationCard from "@/components/LocationCard";
import type { Location } from "@/lib/types";

const location: Location = {
  id: "multnomah-falls", name: "Multnomah Falls", state: "OR", category: "waterfall",
  difficulty: "easy", lat: 45.5762, lng: -122.1158, description: "A tall waterfall.",
  photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
};

describe("LocationCard", () => {
  it("renders the location name, state, and category", () => {
    render(<LocationCard location={location} />);
    expect(screen.getByText("Multnomah Falls")).toBeInTheDocument();
    expect(screen.getByText(/OR/)).toBeInTheDocument();
    expect(screen.getByText(/waterfall/i)).toBeInTheDocument();
  });

  it("shows the estimated drive time when a distance is provided", () => {
    render(<LocationCard location={location} distanceMiles={12.345} />);
    expect(screen.getByText(/min drive/i)).toBeInTheDocument();
  });

  it("omits drive time text when not provided", () => {
    render(<LocationCard location={location} />);
    expect(screen.queryByText(/drive/i)).not.toBeInTheDocument();
  });

  it("swaps to the placeholder if the photo fails to load", () => {
    render(<LocationCard location={location} />);
    const img = screen.getByRole("img");
    fireEvent.error(img);
    expect(img).toHaveAttribute("src", expect.stringContaining("placeholder"));
  });
});
