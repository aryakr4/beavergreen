import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/components/Map", () => ({
  default: ({ locations }: { locations: { id: string }[] }) => (
    <div data-testid="map" data-count={locations.length} />
  ),
}));

import Home from "@/app/page";

describe("Home page", () => {
  it("renders every seed location by default", () => {
    render(<Home />);
    expect(screen.getAllByRole("link").length).toBeGreaterThanOrEqual(5);
  });

  it("narrows the list and the map when a filter is applied", () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: "waterfall" } });

    const map = screen.getByTestId("map");
    expect(Number(map.dataset.count)).toBeGreaterThan(0);
    expect(Number(map.dataset.count)).toBeLessThan(5);
  });
});
