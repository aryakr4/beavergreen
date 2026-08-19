import { describe, it, expect, vi, beforeEach } from "vitest";

const insertReview = vi.fn();
const listReviewsForLocation = vi.fn();
vi.mock("@/lib/db", () => ({ insertReview, listReviewsForLocation }));

const isRateLimited = vi.fn();
vi.mock("@/lib/rateLimit", () => ({ isRateLimited }));

beforeEach(() => {
  insertReview.mockReset();
  listReviewsForLocation.mockReset();
  isRateLimited.mockReset();
});

describe("GET /api/reviews", () => {
  it("returns reviews for the given locationId", async () => {
    listReviewsForLocation.mockResolvedValueOnce([
      { id: 1, location_id: "multnomah-falls", rating: 5, text: "Great!", author_name: "Alex", ip_address: "1.2.3.4", created_at: "2026-08-19T00:00:00.000Z" },
    ]);
    const { GET } = await import("@/app/api/reviews/route");

    const res = await GET(new Request("http://localhost/api/reviews?locationId=multnomah-falls"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([
      { id: 1, locationId: "multnomah-falls", rating: 5, text: "Great!", authorName: "Alex", createdAt: "2026-08-19T00:00:00.000Z" },
    ]);
  });

  it("returns 400 when locationId is missing", async () => {
    const { GET } = await import("@/app/api/reviews/route");
    const res = await GET(new Request("http://localhost/api/reviews"));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/reviews", () => {
  const validBody = {
    locationId: "multnomah-falls",
    rating: 5,
    text: "Beautiful spot!",
    authorName: "Alex",
    honeypot: "",
  };

  function post(body: unknown) {
    return new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4" },
      body: JSON.stringify(body),
    });
  }

  it("inserts a valid review and returns it", async () => {
    isRateLimited.mockResolvedValueOnce(false);
    insertReview.mockResolvedValueOnce({
      id: 1, location_id: "multnomah-falls", rating: 5, text: "Beautiful spot!", author_name: "Alex", ip_address: "1.2.3.4", created_at: "2026-08-19T00:00:00.000Z",
    });

    const { POST } = await import("@/app/api/reviews/route");
    const res = await POST(post(validBody));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.locationId).toBe("multnomah-falls");
    expect(insertReview).toHaveBeenCalledWith({
      locationId: "multnomah-falls", rating: 5, text: "Beautiful spot!", authorName: "Alex", ipAddress: "1.2.3.4",
    });
  });

  it("silently rejects submissions with a filled honeypot field", async () => {
    const { POST } = await import("@/app/api/reviews/route");
    const res = await POST(post({ ...validBody, honeypot: "bot filled this in" }));

    expect(res.status).toBe(201);
    expect(insertReview).not.toHaveBeenCalled();
  });

  it("rejects an invalid rating", async () => {
    isRateLimited.mockResolvedValueOnce(false);
    const { POST } = await import("@/app/api/reviews/route");
    const res = await POST(post({ ...validBody, rating: 7 }));
    expect(res.status).toBe(400);
    expect(insertReview).not.toHaveBeenCalled();
  });

  it("returns 429 when rate-limited", async () => {
    isRateLimited.mockResolvedValueOnce(true);
    const { POST } = await import("@/app/api/reviews/route");
    const res = await POST(post(validBody));
    expect(res.status).toBe(429);
    expect(insertReview).not.toHaveBeenCalled();
  });
});
