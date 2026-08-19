import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PassportStats from "@/components/PassportStats";
import type { Location } from "@/lib/types";

const locations: Location[] = [
  { id: "a", name: "A", state: "OR", category: "waterfall", difficulty: "easy", lat: 0, lng: 0, description: "", photos: [], createdAt: "2026-08-19" },
  { id: "b", name: "B", state: "OR", category: "hike", difficulty: "easy", lat: 0, lng: 0, description: "", photos: [], createdAt: "2026-08-19" },
  { id: "c", name: "C", state: "WA", category: "waterfall", difficulty: "easy", lat: 0, lng: 0, description: "", photos: [], createdAt: "2026-08-19" },
];

describe("PassportStats", () => {
  it("shows the total count and breakdowns by state and category", () => {
    render(<PassportStats locations={locations} />);
    expect(screen.getByText(/3 spots saved/i)).toBeInTheDocument();
    expect(screen.getByText(/OR: 2/)).toBeInTheDocument();
    expect(screen.getByText(/WA: 1/)).toBeInTheDocument();
    expect(screen.getByText(/waterfall: 2/)).toBeInTheDocument();
  });
});
