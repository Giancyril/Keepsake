import { describe, it, expect } from "vitest";
import { formatBytes, isVideo, isHeic, ACCEPTED_MIME_TYPES, ACCEPTED_EXTENSIONS } from "@/lib/utils";

describe("Utility Helpers", () => {
  it("formats file sizes properly across bytes, KB, MB, and GB", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5 MB");
    expect(formatBytes(2.5 * 1024 * 1024 * 1024)).toBe("2.5 GB");
  });

  it("identifies video and HEIC mime types accurately", () => {
    expect(isVideo("video/mp4")).toBe(true);
    expect(isVideo("video/quicktime")).toBe(true);
    expect(isVideo("image/jpeg")).toBe(false);

    expect(isHeic("image/heic")).toBe(true);
    expect(isHeic("image/heif")).toBe(true);
    expect(isHeic("image/png")).toBe(false);
  });

  it("validates supported photo vault extensions and MIME types", () => {
    expect(ACCEPTED_MIME_TYPES.has("image/jpeg")).toBe(true);
    expect(ACCEPTED_MIME_TYPES.has("image/heic")).toBe(true);
    expect(ACCEPTED_MIME_TYPES.has("application/pdf")).toBe(false);

    expect(ACCEPTED_EXTENSIONS.has(".jpg")).toBe(true);
    expect(ACCEPTED_EXTENSIONS.has(".heic")).toBe(true);
    expect(ACCEPTED_EXTENSIONS.has(".exe")).toBe(false);
  });
});
