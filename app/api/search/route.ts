import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { photos, albums, albumPhotos } from "@/lib/db/schema";
import { eq, and, or, ilike, gte, lte, isNotNull, inArray, desc } from "drizzle-orm";
import { generatePhotoUrls } from "@/lib/s3/presign";
import { PhotoWithUrls } from "@/types/photo";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const hasGps = searchParams.get("hasGps") === "true";
    const camera = searchParams.get("camera");
    const albumId = searchParams.get("albumId");

    const conditions = [eq(photos.userId, session.user.id)];

    // Free text query across filename and camera info
    if (q) {
      conditions.push(
        or(
          ilike(photos.filename, `%${q}%`),
          ilike(photos.cameraInfo, `%${q}%`)
        )!
      );
    }

    // Specific camera model filter
    if (camera) {
      conditions.push(ilike(photos.cameraInfo, `%${camera}%`));
    }

    // Date range filter
    if (dateFrom) {
      conditions.push(gte(photos.takenAt, new Date(dateFrom)));
    }
    if (dateTo) {
      conditions.push(lte(photos.takenAt, new Date(dateTo)));
    }

    // Location tag filter
    if (hasGps) {
      conditions.push(isNotNull(photos.gpsLat));
    }

    // Album filter
    if (albumId) {
      const albumRows = await db
        .select({ photoId: albumPhotos.photoId })
        .from(albumPhotos)
        .where(eq(albumPhotos.albumId, albumId));

      const photoIds = albumRows.map((r) => r.photoId);
      if (photoIds.length === 0) {
        return NextResponse.json({ photos: [], total: 0 });
      }
      conditions.push(inArray(photos.id, photoIds));
    }

    const rows = await db
      .select()
      .from(photos)
      .where(and(...conditions))
      .orderBy(desc(photos.takenAt), desc(photos.uploadedAt))
      .limit(100);

    const photosWithUrls: PhotoWithUrls[] = await Promise.all(
      rows.map(async (p) => {
        let urls = {
          originalUrl: "",
          thumbnailSmUrl: null as string | null,
          thumbnailMdUrl: null as string | null,
        };

        try {
          urls = await generatePhotoUrls(p.s3Key, p.s3KeySm, p.s3KeyMd);
        } catch (e) {
          console.warn(`[Presign Error] Photo ${p.id}:`, e);
        }

        return {
          id: p.id,
          filename: p.filename,
          mimeType: p.mimeType,
          fileSize: p.fileSize,
          width: p.width,
          height: p.height,
          takenAt: p.takenAt ? p.takenAt.toISOString() : null,
          uploadedAt: p.uploadedAt.toISOString(),
          status: p.status as "processing" | "ready" | "error",
          cameraInfo: p.cameraInfo,
          gpsLat: p.gpsLat,
          gpsLng: p.gpsLng,
          durationSecs: p.durationSecs,
          originalUrl: urls.originalUrl,
          thumbnailSmUrl: urls.thumbnailSmUrl,
          thumbnailMdUrl: urls.thumbnailMdUrl,
        };
      })
    );

    return NextResponse.json({
      photos: photosWithUrls,
      total: photosWithUrls.length,
    });
  } catch (err) {
    console.error("[GET /api/search]", err);
    return NextResponse.json(
      { error: "Search query failed" },
      { status: 500 }
    );
  }
}
