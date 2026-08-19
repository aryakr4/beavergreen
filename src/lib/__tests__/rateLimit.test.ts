import { describe, it, expect, vi, beforeEach } from "vitest";

const countRecentReviewsFromIp = vi.fn();
vi.mock("@/lib/db", () => ({ countRecentReviewsFromIp }));

beforeEach(() => countRecentReviewsFromIp.mockReset());

describe("isRateLimited", () => {
  it("returns false when under the hourly threshold", async () => {
    countRecentReviewsFromIp.mockResolvedValueOnce(2);
    const { isRateLimited } = await import("@/lib/rateLimit");
    expect(await isRateLimited("1.2.3.4")).toBe(false);
  });

  it("returns true when at or over the hourly threshold", async () => {
    countRecentReviewsFromIp.mockResolvedValueOnce(5);
    const { isRateLimited } = await import("@/lib/rateLimit");
    expect(await isRateLimited("1.2.3.4")).toBe(true);
  });
});
