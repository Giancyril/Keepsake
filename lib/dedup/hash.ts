import crypto from "crypto";

/**
 * Computes SHA-256 hash of a file buffer for deduplication detection.
 */
export function computeSha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export interface DuplicateGroup {
  hash: string;
  count: number;
  totalWastedBytes: number;
  sampleFilename: string;
  photoIds: string[];
}
