import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { photos } from "@/lib/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { presignGetUrl } from "@/lib/s3/presign";
import { thumbnailSmKey } from "@/lib/s3/keys";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const geoPhotos = await db
      .select({
        id: photos.id,
        filename: photos.filename,
        s3Key: photos.s3Key,
        s3KeySm: photos.s3KeySm,
        gpsLat: photos.gpsLat,
        gpsLng: photos.gpsLng,
        locationName: photos.locationName,
        city: photos.city,
        country: photos.country,
        countryCode: photos.countryCode,
        takenAt: photos.takenAt,
        uploadedAt: photos.uploadedAt,
        width: photos.width,
        height: photos.height,
        mimeType: photos.mimeType,
      })
      .from(photos)
      .where(
        and(
          eq(photos.userId, userId),
          eq(photos.status, "ready"),
          isNotNull(photos.gpsLat),
          isNotNull(photos.gpsLng)
        )
      );

    // Pre-sign small thumbnails for map markers in parallel
    const features = await Promise.all(
      geoPhotos.map(async (p) => {
        const lat = parseFloat(p.gpsLat!);
        const lng = parseFloat(p.gpsLng!);

        let thumbUrl = "";
        try {
          thumbUrl = await presignGetUrl(p.s3KeySm || thumbnailSmKey(p.s3Key), 3600);
        } catch {
          // fallback
        }

        return {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [lng, lat],
          },
          properties: {
            id: p.id,
            filename: p.filename,
            thumbUrl,
            locationName: p.locationName || `${lat.toFixed(3)}, ${lng.toFixed(3)}`,
            city: p.city,
            country: p.country,
            countryCode: p.countryCode,
            takenAt: p.takenAt || p.uploadedAt,
            width: p.width,
            height: p.height,
          },
        };
      })
    );

    // Extract unique cities & countries for filter pills
    const countries = Array.from(
      new Set(geoPhotos.map((p) => p.country).filter(Boolean))
    ) as string[];

    const cities = Array.from(
      new Set(geoPhotos.map((p) => p.city).filter(Boolean))
    ) as string[];

    return NextResponse.json({
      type: "FeatureCollection",
      features,
      summary: {
        totalGeotagged: features.length,
        countries,
        cities,
      },
    });
  } catch (err: any) {
    console.error("[GET /api/photos/geo] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch geolocation data" },
      { status: 500 }
    );
  }
}
