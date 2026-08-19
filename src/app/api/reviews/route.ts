import { NextResponse } from "next/server";
import { insertReview, listReviewsForLocation, type ReviewRow } from "@/lib/db";
import { isRateLimited } from "@/lib/rateLimit";
import { getLocationById } from "@/data/locations";

const MAX_TEXT_LENGTH = 2000;
const MAX_AUTHOR_NAME_LENGTH = 80;

function toApiShape(row: ReviewRow) {
  return {
    id: row.id,
    locationId: row.location_id,
    rating: row.rating,
    text: row.text,
    authorName: row.author_name ?? undefined,
    createdAt: row.created_at,
  };
}

export async function GET(request: Request) {
  const locationId = new URL(request.url).searchParams.get("locationId");
  if (!locationId) {
    return NextResponse.json({ error: "locationId is required" }, { status: 400 });
  }

  const rows = await listReviewsForLocation(locationId);
  return NextResponse.json(rows.map(toApiShape));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid review submission" }, { status: 400 });
  }

  const { locationId, rating, text, authorName, honeypot } = (body ?? {}) as Record<string, unknown>;

  // Bots that fill the hidden honeypot field get a fake success so they
  // don't learn to leave it blank, but nothing is written.
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  if (
    typeof locationId !== "string" ||
    typeof text !== "string" ||
    text.trim().length === 0 ||
    text.length > MAX_TEXT_LENGTH ||
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    (typeof authorName === "string" && authorName.length > MAX_AUTHOR_NAME_LENGTH)
  ) {
    return NextResponse.json({ error: "Invalid review submission" }, { status: 400 });
  }

  if (!getLocationById(locationId)) {
    return NextResponse.json({ error: "Invalid review submission" }, { status: 400 });
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (await isRateLimited(ipAddress)) {
    return NextResponse.json({ error: "Too many reviews submitted recently" }, { status: 429 });
  }

  const row = await insertReview({
    locationId,
    rating,
    text,
    authorName: typeof authorName === "string" && authorName.trim() ? authorName.trim() : undefined,
    ipAddress,
  });

  return NextResponse.json(toApiShape(row), { status: 201 });
}
