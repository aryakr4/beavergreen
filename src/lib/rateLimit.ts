import { countRecentReviewsFromIp } from "@/lib/db";

const MAX_REVIEWS_PER_HOUR = 5;

export async function isRateLimited(ipAddress: string): Promise<boolean> {
  const count = await countRecentReviewsFromIp(ipAddress, 60);
  return count >= MAX_REVIEWS_PER_HOUR;
}
