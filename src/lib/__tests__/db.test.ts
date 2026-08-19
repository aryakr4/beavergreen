import { describe, it, expect, vi, beforeEach } from "vitest";

const queryMock = vi.fn();

vi.mock("pg", () => ({
  Pool: vi.fn().mockImplementation(function () {
    return { query: queryMock };
  }),
}));

beforeEach(() => {
  queryMock.mockReset();
});

describe("db access layer", () => {
  it("insertReview inserts and returns the created row", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [{ id: 1, location_id: "multnomah-falls", rating: 5, text: "Great!", author_name: "Alex", ip_address: "1.2.3.4", created_at: "2026-08-19T00:00:00.000Z" }],
    });

    const { insertReview } = await import("@/lib/db");
    const row = await insertReview({ locationId: "multnomah-falls", rating: 5, text: "Great!", authorName: "Alex", ipAddress: "1.2.3.4" });

    expect(row.id).toBe(1);
    expect(row.location_id).toBe("multnomah-falls");
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO reviews"),
      ["multnomah-falls", 5, "Great!", "Alex", "1.2.3.4"]
    );
  });

  it("listReviewsForLocation returns rows ordered newest-first", async () => {
    queryMock.mockResolvedValueOnce({
      rows: [{ id: 2, location_id: "multnomah-falls", rating: 4, text: "Nice", author_name: null, ip_address: "1.2.3.4", created_at: "2026-08-19T00:00:00.000Z" }],
    });

    const { listReviewsForLocation } = await import("@/lib/db");
    const rows = await listReviewsForLocation("multnomah-falls");

    expect(rows).toHaveLength(1);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("ORDER BY created_at DESC"),
      ["multnomah-falls"]
    );
  });

  it("countRecentReviewsFromIp returns the row count", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ count: "3" }] });

    const { countRecentReviewsFromIp } = await import("@/lib/db");
    const count = await countRecentReviewsFromIp("1.2.3.4", 60);

    expect(count).toBe(3);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("ip_address = $1"),
      ["1.2.3.4", 60]
    );
  });
});
