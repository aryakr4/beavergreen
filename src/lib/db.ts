import { Pool } from "pg";

export interface ReviewRow {
  id: number;
  location_id: string;
  rating: number;
  text: string;
  author_name: string | null;
  ip_address: string;
  created_at: string;
}

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function insertReview(input: {
  locationId: string;
  rating: number;
  text: string;
  authorName?: string;
  ipAddress: string;
}): Promise<ReviewRow> {
  const result = await getPool().query(
    `INSERT INTO reviews (location_id, rating, text, author_name, ip_address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [input.locationId, input.rating, input.text, input.authorName ?? null, input.ipAddress]
  );
  return result.rows[0];
}

export async function listReviewsForLocation(locationId: string): Promise<ReviewRow[]> {
  const result = await getPool().query(
    `SELECT * FROM reviews WHERE location_id = $1 ORDER BY created_at DESC`,
    [locationId]
  );
  return result.rows;
}

export async function countRecentReviewsFromIp(ipAddress: string, sinceMinutes: number): Promise<number> {
  const result = await getPool().query(
    `SELECT COUNT(*) FROM reviews WHERE ip_address = $1 AND created_at > now() - ($2 || ' minutes')::interval`,
    [ipAddress, sinceMinutes]
  );
  return Number(result.rows[0].count);
}
