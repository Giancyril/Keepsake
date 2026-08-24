import exifr from "exifr";

export interface ExtractedMetadata {
  takenAt: Date | null;
  width?: number;
  height?: number;
  cameraInfo?: string;
  gpsLat?: number;
  gpsLng?: number;
}

/**
 * Extract EXIF metadata from an image buffer (supports JPEG, PNG, HEIC, TIFF).
 * Parses:
 * - takenAt (DateTimeOriginal or CreateDate)
 * - cameraInfo (Make and Model)
 * - GPS latitude & longitude
 * - Dimensions (ImageWidth, ImageHeight)
 */
export async function extractMetadata(
  buffer: Buffer,
  stripGps = false
): Promise<ExtractedMetadata> {
  try {
    const raw = await exifr.parse(buffer, {
      tiff: true,
      xmp: true,
      icc: false,
      iptc: false,
      jfif: false,
      gps: true,
    });

    if (!raw) {
      return { takenAt: null };
    }

    // Determine takenAt with fallback cascade
    let takenAt: Date | null = null;
    if (raw.DateTimeOriginal instanceof Date) {
      takenAt = raw.DateTimeOriginal;
    } else if (raw.CreateDate instanceof Date) {
      takenAt = raw.CreateDate;
    } else if (typeof raw.DateTimeOriginal === "string") {
      const parsed = new Date(raw.DateTimeOriginal);
      if (!isNaN(parsed.getTime())) takenAt = parsed;
    }

    // Determine camera make/model
    let cameraInfo: string | undefined;
    if (raw.Make || raw.Model) {
      const make = (raw.Make || "").trim();
      const model = (raw.Model || "").trim();
      cameraInfo = model.startsWith(make)
        ? model
        : [make, model].filter(Boolean).join(" ");
    }

    // Dimensions
    const width = raw.ImageWidth || raw.ExifImageWidth;
    const height = raw.ImageHeight || raw.ExifImageHeight;

    // GPS
    let gpsLat: number | undefined;
    let gpsLng: number | undefined;

    if (!stripGps && typeof raw.latitude === "number" && typeof raw.longitude === "number") {
      gpsLat = raw.latitude;
      gpsLng = raw.longitude;
    }

    return {
      takenAt,
      width,
      height,
      cameraInfo,
      gpsLat,
      gpsLng,
    };
  } catch (err) {
    console.warn("[EXIF] Metadata extraction failed:", err);
    return { takenAt: null };
  }
}
