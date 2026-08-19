import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Location } from "@/lib/types";

const location: Location = {
  id: "multnomah-falls", name: "Multnomah Falls", state: "OR", category: "waterfall",
  difficulty: "easy", lat: 45.5762, lng: -122.1158, description: "",
  photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
};

vi.mock("@/hooks/useGeolocation", () => ({
  useGeolocation: () => ({ coords: { lat: 45.5152, lng: -122.6784 }, loading: false, error: null }),
}));

import DistanceInfo from "@/components/DistanceInfo";

describe("DistanceInfo", () => {
  it("shows distance from the visitor when geolocation succeeds", () => {
    render(<DistanceInfo location={location} />);
    expect(screen.getByText(/mi from you/i)).toBeInTheDocument();
  });

  it("lists distances to major cities", () => {
    render(<DistanceInfo location={location} />);
    expect(screen.getByText(/Portland/)).toBeInTheDocument();
    expect(screen.getByText(/Seattle/)).toBeInTheDocument();
  });
});
