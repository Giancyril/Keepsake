import { describe, it, expect } from "vitest";
import { extractMetadata } from "@/lib/processing/exif";
import sharp from "sharp";

describe("EXIF Metadata Extraction", () => {
  it("handles images without EXIF gracefully without throwing", async () => {
    const rawBuffer = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 10, g: 10, b: 11 },
      },
    })
      .jpeg()
      .toBuffer();

    const result = await extractMetadata(rawBuffer);
    expect(result).toBeDefined();
    expect(result.takenAt).toBeNull();
  });

  it("respects the stripGps flag when extracting metadata", async () => {
    const rawBuffer = await sharp({
      create: {
        width: 400,
        height: 400,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .jpeg()
      .toBuffer();

    const result = await extractMetadata(rawBuffer, true);
    expect(result.gpsLat).toBeUndefined();
    expect(result.gpsLng).toBeUndefined();
  });
});
