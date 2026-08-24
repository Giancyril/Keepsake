import { describe, it, expect } from "vitest";
import { generateShareToken } from "@/lib/shares";

describe("Share Token Utility", () => {
  it("generates a 64-character hex string (32 bytes = 128-bit entropy)", () => {
    const token = generateShareToken();
    expect(typeof token).toBe("string");
    expect(token.length).toBe(64);
    expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
  });

  it("generates unique tokens on subsequent calls", () => {
    const tokens = new Set();
    for (let i = 0; i < 100; i++) {
      const t = generateShareToken();
      expect(tokens.has(t)).toBe(false);
      tokens.add(t);
    }
    expect(tokens.size).toBe(100);
  });
});
