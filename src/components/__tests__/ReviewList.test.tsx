import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ReviewList from "@/components/ReviewList";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

describe("ReviewList", () => {
  it("renders fetched reviews", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, locationId: "multnomah-falls", rating: 5, text: "Great!", authorName: "Alex", createdAt: "2026-08-19T00:00:00.000Z" },
      ],
    });

    render(<ReviewList locationId="multnomah-falls" />);

    await waitFor(() => expect(screen.getByText("Great!")).toBeInTheDocument());
    expect(screen.getByText(/Alex/)).toBeInTheDocument();
  });

  it("shows an empty state when there are no reviews", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, json: async () => [] });

    render(<ReviewList locationId="multnomah-falls" />);

    await waitFor(() => expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument());
  });
});
