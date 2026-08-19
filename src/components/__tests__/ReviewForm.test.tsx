import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReviewForm from "@/components/ReviewForm";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

describe("ReviewForm", () => {
  it("submits the form and calls onSubmitted on success", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const onSubmitted = vi.fn();

    render(<ReviewForm locationId="multnomah-falls" onSubmitted={onSubmitted} />);

    fireEvent.change(screen.getByLabelText(/rating/i), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText(/your review/i), { target: { value: "Loved it" } });
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => expect(onSubmitted).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith(
      "/api/reviews",
      expect.objectContaining({ method: "POST" })
    );
    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const sentBody = JSON.parse(options.body as string);
    expect(sentBody).toMatchObject({ locationId: "multnomah-falls", rating: 4, text: "Loved it" });
  });

  it("shows an inline error when submission fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({ error: "Too many reviews" }) });

    render(<ReviewForm locationId="multnomah-falls" />);

    fireEvent.change(screen.getByLabelText(/your review/i), { target: { value: "Loved it" } });
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => expect(screen.getByText(/too many reviews/i)).toBeInTheDocument());
  });
});
