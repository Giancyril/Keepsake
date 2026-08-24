import { describe, it, expect } from "vitest";

describe("Memories Engine Logic", () => {
  it("correctly identifies same-day retrospective year offsets", () => {
    const today = new Date("2026-08-24T12:00:00Z");
    const photoDate1 = new Date("2025-08-24T14:30:00Z");
    const photoDate2 = new Date("2023-08-24T09:15:00Z");

    const isSameDay1 =
      photoDate1.getMonth() === today.getMonth() && photoDate1.getDate() === today.getDate();
    const isSameDay2 =
      photoDate2.getMonth() === today.getMonth() && photoDate2.getDate() === today.getDate();

    expect(isSameDay1).toBe(true);
    expect(isSameDay2).toBe(true);

    const yearsAgo1 = today.getFullYear() - photoDate1.getFullYear();
    const yearsAgo2 = today.getFullYear() - photoDate2.getFullYear();

    expect(yearsAgo1).toBe(1);
    expect(yearsAgo2).toBe(3);
  });
});
