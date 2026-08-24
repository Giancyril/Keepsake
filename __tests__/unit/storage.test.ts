import { describe, it, expect } from "vitest";
import { computeSha256 } from "@/lib/dedup/hash";
import { formatBytes } from "@/lib/utils";

describe("Deduplication & Storage Analytics", () => {
  it("computes consistent SHA-256 hashes for binary buffers", () => {
    const buf1 = Buffer.from("keepsake-photo-vault-data");
    const buf2 = Buffer.from("keepsake-photo-vault-data");
    const buf3 = Buffer.from("different-data");

    expect(computeSha256(buf1)).toBe(computeSha256(buf2));
    expect(computeSha256(buf1)).not.toBe(computeSha256(buf3));
  });

  it("formats storage sizes cleanly across bytes, KB, MB, and GB", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1024 * 1024 * 45.8)).toBe("45.8 MB");
    expect(formatBytes(1024 * 1024 * 1024 * 2.5)).toBe("2.5 GB");
  });
});
