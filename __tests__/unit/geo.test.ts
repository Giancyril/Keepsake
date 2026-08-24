import { describe, it, expect } from "vitest";
import { reverseGeocode } from "@/lib/geo/reverse";

describe("Reverse Geocoding Utility", () => {
  it("resolves known major cities within bounding boxes", async () => {
    // Kyoto coordinates
    const kyoto = await reverseGeocode(35.0116, 135.7681);
    expect(kyoto.city).toBe("Kyoto");
    expect(kyoto.country).toBe("Japan");
    expect(kyoto.countryCode).toBe("JP");
    expect(kyoto.locationName).toBe("Kyoto, Japan");

    // San Francisco coordinates
    const sf = await reverseGeocode(37.7749, -122.4194);
    expect(sf.city).toBe("San Francisco");
    expect(sf.country).toBe("United States");
  });

  it("formats arbitrary coordinates gracefully as fallback", async () => {
    const remote = await reverseGeocode(12.3456, -45.6789);
    expect(remote.city).toBeUndefined();
    expect(remote.locationName).toBe("12.346° N, 45.679° W");
  });
});
