import { describe, it, expect } from "vitest";
import { formatVideoDuration } from "@/lib/video/metadata";
import { calculateInitialCrop } from "@/lib/editor/crop";

describe("Video Metadata & Duration Formatting", () => {
  it("formats standard video durations properly", () => {
    expect(formatVideoDuration(0)).toBe("0:00");
    expect(formatVideoDuration(9)).toBe("0:09");
    expect(formatVideoDuration(45)).toBe("0:45");
    expect(formatVideoDuration(65)).toBe("1:05");
    expect(formatVideoDuration(3665)).toBe("61:05");
  });

  it("handles negative or NaN inputs safely", () => {
    expect(formatVideoDuration(-10)).toBe("0:00");
    expect(formatVideoDuration(NaN)).toBe("0:00");
  });
});

describe("Photo Editor Crop Math", () => {
  it("calculates centered 1:1 square crop correctly on landscape photo", () => {
    const crop = calculateInitialCrop(1920, 1080, 1);
    expect(crop.width).toBe(1080);
    expect(crop.height).toBe(1080);
    expect(crop.x).toBe((1920 - 1080) / 2);
    expect(crop.y).toBe(0);
  });

  it("returns full bounds when aspect ratio is freeform (null)", () => {
    const crop = calculateInitialCrop(1920, 1080, null);
    expect(crop).toEqual({ x: 0, y: 0, width: 1920, height: 1080 });
  });
});
