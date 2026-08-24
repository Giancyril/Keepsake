import crypto from "crypto";
import { db } from "@/lib/db/client";
import { shares } from "@/lib/db/schema";
import { eq, and, isNull, gt, or } from "drizzle-orm";
import type { Share } from "@/lib/db/schema";

/**
 * Generate a cryptographically secure random token.
 * 32 bytes → 64 hex characters → 128 bits of entropy (brute-force infeasible).
 */
export function generateShareToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validate a share token, returning the share record if valid.
 * A share is INVALID if:
 *   - Token does not exist
 *   - revoked_at IS NOT NULL (revoked by owner)
 *   - expires_at IS NOT NULL AND expires_at < NOW() (expired)
 *
 * Returns null if invalid; throws distinguishable error types for
 * expired vs. revoked vs. not-found for proper HTTP response codes.
 */
export type ShareValidationResult =
  | { valid: true; share: Share }
  | { valid: false; reason: "not_found" | "revoked" | "expired" };

export async function validateShareToken(
  token: string
): Promise<ShareValidationResult> {
  const [share] = await db
    .select()
    .from(shares)
    .where(eq(shares.token, token))
    .limit(1);

  if (!share) {
    return { valid: false, reason: "not_found" };
  }

  if (share.revokedAt !== null) {
    return { valid: false, reason: "revoked" };
  }

  if (share.expiresAt !== null && share.expiresAt < new Date()) {
    return { valid: false, reason: "expired" };
  }

  // Increment view counter (fire-and-forget, non-critical)
  db.update(shares)
    .set({ viewCount: (share.viewCount ?? 0) + 1 })
    .where(eq(shares.id, share.id))
    .catch(console.error);

  return { valid: true, share };
}

/**
 * Revoke a share token. Only the owning user should call this.
 * Returns true if the share was found and revoked, false if not found.
 */
export async function revokeShare(
  token: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .update(shares)
    .set({ revokedAt: new Date() })
    .where(and(eq(shares.token, token), eq(shares.userId, userId)));

  return (result.rowCount ?? 0) > 0;
}
