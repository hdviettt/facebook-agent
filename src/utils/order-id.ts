import { v4 as uuidv4 } from "uuid";

/**
 * Generate a unique appOrderId for Nhanh.vn.
 * Format: FB_{timestamp}_{short_uuid}
 */
export function generateAppOrderId(): string {
  const timestamp = Date.now();
  const shortId = uuidv4().split("-")[0];
  return `FB_${timestamp}_${shortId}`;
}
