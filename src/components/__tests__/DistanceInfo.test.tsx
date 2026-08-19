import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Location } from "@/lib/types";
import type { GeolocationState } from "@/hooks/useGeolocation";

const location: Location = {
  id: "multnomah-falls", name: "Multnomah Falls", state: "OR", category: "waterfall",
  difficulty: "easy", lat: 45.5762, lng: -122.1158, description: "",
  photos: ["/images/placeholder.svg"], createdAt: "2026-08-19",
};

let mockUseGeolocation: GeolocationState = {
  coords: { lat: 45.5152, lng: -122.6784 },
  loading: false,
  error: null,
};

vi.mock("@/hooks/useGeolocation", () => ({
  useGeolocation: () => mockUseGeolocation,
}));

import DistanceInfo from "@/components/DistanceInfo";

describe("DistanceInfo", () => {
  beforeEach(() => {
    mockUseGeolocation = {
      coords: { lat: 45.5152, lng: -122.6784 },
      loading: false,
      error: null,
    };
  });

  it("shows distance from the visitor when geolocation succeeds", () => {
    render(<DistanceInfo location={location} />);
    expect(screen.getByText(/mi from you/i)).toBeInTheDocument();
  });

  it("lists distances to major cities", () => {
    render(<DistanceInfo location={location} />);
    expect(screen.getByText(/Portland/)).toBeInTheDocument();
    expect(screen.getByText(/Seattle/)).toBeInTheDocument();
  });

  it("shows error message when geolocation is denied", () => {
    mockUseGeolocation = {
      coords: null,
      loading: false,
      error: "Enable location access to see distance from you.",
    };
    render(<DistanceInfo location={location} />);
    expect(screen.getByText(/enable location access/i)).toBeInTheDocument();
    expect(screen.queryByText(/mi from you/i)).not.toBeInTheDocument();
  });
});
