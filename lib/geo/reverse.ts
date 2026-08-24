/**
 * Reverse Geocoding Utility for Keepsake.
 * Fast, offline-first coordinate resolution with high-accuracy bounding boxes for world cities & regions.
 */

interface GeocodedLocation {
  city?: string;
  country?: string;
  countryCode?: string;
  locationName?: string;
}

interface KnownLocation {
  city: string;
  country: string;
  countryCode: string;
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
}

// Curated bounding box database of top destinations and metropolitan areas worldwide
const KNOWN_BOUNDS: KnownLocation[] = [
  // Japan
  { city: "Kyoto", country: "Japan", countryCode: "JP", latMin: 34.9, latMax: 35.15, lngMin: 135.65, lngMax: 135.85 },
  { city: "Tokyo", country: "Japan", countryCode: "JP", latMin: 35.5, latMax: 35.85, lngMin: 139.5, lngMax: 140.0 },
  { city: "Osaka", country: "Japan", countryCode: "JP", latMin: 34.55, latMax: 34.8, lngMin: 135.4, lngMax: 135.6 },
  { city: "Sapporo", country: "Japan", countryCode: "JP", latMin: 42.9, latMax: 43.2, lngMin: 141.2, lngMax: 141.5 },

  // USA
  { city: "San Francisco", country: "United States", countryCode: "US", latMin: 37.68, latMax: 37.85, lngMin: -122.55, lngMax: -122.35 },
  { city: "New York", country: "United States", countryCode: "US", latMin: 40.5, latMax: 40.92, lngMin: -74.05, lngMax: -73.7 },
  { city: "Los Angeles", country: "United States", countryCode: "US", latMin: 33.7, latMax: 34.35, lngMin: -118.68, lngMax: -118.15 },
  { city: "Seattle", country: "United States", countryCode: "US", latMin: 47.45, latMax: 47.75, lngMin: -122.45, lngMax: -122.25 },
  { city: "Honolulu", country: "United States", countryCode: "US", latMin: 21.25, latMax: 21.4, lngMin: -157.92, lngMax: -157.75 },
  { city: "Chicago", country: "United States", countryCode: "US", latMin: 41.6, latMax: 42.1, lngMin: -87.9, lngMax: -87.5 },

  // Europe
  { city: "Paris", country: "France", countryCode: "FR", latMin: 48.8, latMax: 48.92, lngMin: 2.2, lngMax: 2.45 },
  { city: "London", country: "United Kingdom", countryCode: "GB", latMin: 51.3, latMax: 51.7, lngMin: -0.5, lngMax: 0.3 },
  { city: "Rome", country: "Italy", countryCode: "IT", latMin: 41.75, latMax: 42.0, lngMin: 12.35, lngMax: 12.65 },
  { city: "Amsterdam", country: "Netherlands", countryCode: "NL", latMin: 52.3, latMax: 52.45, lngMin: 4.8, lngMax: 5.0 },
  { city: "Berlin", country: "Germany", countryCode: "DE", latMin: 52.35, latMax: 52.65, lngMin: 13.1, lngMax: 13.75 },
  { city: "Barcelona", country: "Spain", countryCode: "ES", latMin: 41.3, latMax: 41.48, lngMin: 2.05, lngMax: 2.25 },
  { city: "Reykjavik", country: "Iceland", countryCode: "IS", latMin: 64.08, latMax: 64.2, lngMin: -21.98, lngMax: -21.75 },
  { city: "Zurich", country: "Switzerland", countryCode: "CH", latMin: 47.3, latMax: 47.45, lngMin: 8.45, lngMax: 8.6 },

  // Asia / Oceania
  { city: "Singapore", country: "Singapore", countryCode: "SG", latMin: 1.2, latMax: 1.48, lngMin: 103.6, lngMax: 104.05 },
  { city: "Sydney", country: "Australia", countryCode: "AU", latMin: -34.05, latMax: -33.65, lngMin: 151.0, lngMax: 151.35 },
  { city: "Seoul", country: "South Korea", countryCode: "KR", latMin: 37.4, latMax: 37.7, lngMin: 126.75, lngMax: 127.2 },
  { city: "Bangkok", country: "Thailand", countryCode: "TH", latMin: 13.6, latMax: 13.95, lngMin: 100.35, lngMax: 100.8 },
  { city: "Hong Kong", country: "Hong Kong", countryCode: "HK", latMin: 22.15, latMax: 22.55, lngMin: 113.85, lngMax: 114.4 },
  { city: "Dubai", country: "United Arab Emirates", countryCode: "AE", latMin: 24.95, latMax: 25.35, lngMin: 55.05, lngMax: 55.55 },
  { city: "Auckland", country: "New Zealand", countryCode: "NZ", latMin: -37.05, latMax: -36.75, lngMin: 174.6, lngMax: 174.95 },
  { city: "Toronto", country: "Canada", countryCode: "CA", latMin: 43.55, latMax: 43.85, lngMin: -79.65, lngMax: -79.15 },
  { city: "Vancouver", country: "Canada", countryCode: "CA", latMin: 49.15, latMax: 49.35, lngMin: -123.25, lngMax: -123.0 },
];

/**
 * Resolves GPS latitude & longitude to city, country, and formatted place name.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedLocation> {
  // 1. Fast match against known bounding boxes
  for (const loc of KNOWN_BOUNDS) {
    if (lat >= loc.latMin && lat <= loc.latMax && lng >= loc.lngMin && lng <= loc.lngMax) {
      return {
        city: loc.city,
        country: loc.country,
        countryCode: loc.countryCode,
        locationName: `${loc.city}, ${loc.country}`,
      };
    }
  }

  // 2. Approximate regional hemisphere fallback
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  const formattedCoords = `${Math.abs(lat).toFixed(3)}° ${latDir}, ${Math.abs(lng).toFixed(3)}° ${lngDir}`;

  return {
    locationName: formattedCoords,
  };
}
