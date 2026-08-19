import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/hooks/useGeolocation", () => ({
  useGeolocation: () => ({ coords: null, loading: false, error: "Locating disabled in test" }),
}));

import LocationPage, { generateStaticParams } from "@/app/locations/[id]/page";

describe("Location detail page", () => {
  it("renders the location name and description for a known id", async () => {
    const ui = await LocationPage({ params: Promise.resolve({ id: "multnomah-falls" }) });
    render(ui);
    expect(screen.getByRole("heading", { name: /multnomah falls/i })).toBeInTheDocument();
    expect(screen.getByText(/waterfall/i)).toBeInTheDocument();
  });

  it("generates static params for every seed location", async () => {
    const params = await generateStaticParams();
    expect(params.length).toBeGreaterThanOrEqual(5);
    expect(params.map((p) => p.id)).toContain("multnomah-falls");
  });
});
