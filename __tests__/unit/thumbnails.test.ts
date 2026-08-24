import { describe, it, expect } from "vitest";
import { generateThumbnails } from "@/lib/processing/thumbnails";
import sharp from "sharp";

describe("Thumbnail Processing Pipeline", () => {
  it("generates 320x320 small cover and 1200px max preview from a raw image", async () => {
    // Generate a test image in memory with sharp
    const testBuffer = await sharp({
      create: {
        width: 1600,
        height: 1200,
        channels: 3,
        background: { r: 79, g: 110, b: 247 },
      },
    })
      .jpeg()
      .toBuffer();

    const thumbs = await generateThumbnails(testBuffer);

    expect(thumbs.sm).toBeDefined();
    expect(thumbs.md).toBeDefined();
    expect(thumbs.width).toBe(1600);
    expect(thumbs.height).toBe(1200);

    // Verify small thumbnail dimensions
    const smMeta = await sharp(thumbs.sm).metadata();
    expect(smMeta.width).toBe(320);
    expect(smMeta.height).toBe(320);
    expect(smMeta.format).toBe("jpeg");

    // Verify medium thumbnail dimensions (fit inside 1200x1200 maintaining 4:3 aspect ratio)
    const mdMeta = await sharp(thumbs.md).metadata();
    expect(mdMeta.width).toBe(1200);
    expect(mdMeta.height).toBe(900);
    expect(mdMeta.format).toBe("jpeg");
  });
});
