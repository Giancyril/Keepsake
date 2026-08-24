import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { photos, albumPhotos } from "@/lib/db/schema";
import { eq, and, desc, lt, gte, lte, ilike, count, inArray } from "drizzle-orm";
import { generatePhotoUrls } from "@/lib/s3/presign";
import { enqueuePhotoProcessing } from "@/lib/processing/queue";
import { PhotoWithUrls } from "@/types/photo";
import { z } from "zod";

const confirmPhotoSchema = z.object({
  s3Key: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
  stripGps: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = confirmPhotoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const { s3Key, filename, mimeType, size, stripGps } = parsed.data;

    const expectedPrefix = `originals/${session.user.id}/`;
    if (!s3Key.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: "Forbidden: S3 key does not belong to user" },
        { status: 403 }
      );
    }

    const [photo] = await db
      .insert(photos)
      .values({
        userId: session.user.id,
        s3Key,
        filename,
        mimeType,
        fileSize: size,
        status: "processing",
      })
      .returning();

    enqueuePhotoProcessing({
      photoId: photo.id,
      s3Key: photo.s3Key,
      mimeType: photo.mimeType,
      stripGps,
    });

    return NextResponse.json({ photo }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/photos]", err);
    return NextResponse.json(
      { error: "Failed to confirm photo upload" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 50, 1), 100);
    const cursor = searchParams.get("cursor");
    const albumId = searchParams.get("albumId");
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const conditions = [eq(photos.userId, session.user.id)];

    if (cursor) {
      const cursorDate = new Date(cursor);
      conditions.push(lt(photos.takenAt, cursorDate));
    }

    if (dateFrom) {
      conditions.push(gte(photos.takenAt, new Date(dateFrom)));
    }

    if (dateTo) {
      conditions.push(lte(photos.takenAt, new Date(dateTo)));
    }

    if (search) {
      conditions.push(ilike(photos.filename, `%${search}%`));
    }

    if (albumId) {
      const albumPhotoRows = await db
        .select({ photoId: albumPhotos.photoId })
        .from(albumPhotos)
        .where(eq(albumPhotos.albumId, albumId));

      const photoIds = albumPhotoRows.map((r) => r.photoId);
      if (photoIds.length === 0) {
        return NextResponse.json({ photos: [], nextCursor: null, total: 0 });
      }
      conditions.push(inArray(photos.id, photoIds));
    }

    const photoRows = await db
      .select()
      .from(photos)
      .where(and(...conditions))
      .orderBy(desc(photos.takenAt), desc(photos.uploadedAt))
      .limit(limit + 1);

    const hasMore = photoRows.length > limit;
    const items = hasMore ? photoRows.slice(0, limit) : photoRows;

    const photosWithUrls: PhotoWithUrls[] = await Promise.all(
      items.map(async (p) => {
        let urls = {
          originalUrl: "",
          thumbnailSmUrl: null as string | null,
          thumbnailMdUrl: null as string | null,
        };

        try {
          urls = await generatePhotoUrls(p.s3Key, p.s3KeySm, p.s3KeyMd);
        } catch (s3Err) {
          console.warn(`[S3 Presign] Failed for photo ${p.id}:`, s3Err);
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

    const [totalCountRow] = await db
      .select({ value: count() })
      .from(photos)
      .where(eq(photos.userId, session.user.id));

    const nextCursor =
      hasMore && items.length > 0
        ? items[items.length - 1].takenAt?.toISOString() || null
        : null;

    return NextResponse.json({
      photos: photosWithUrls,
      nextCursor,
      total: totalCountRow?.value ?? 0,
    });
  } catch (err) {
    console.error("[GET /api/photos]", err);
    return NextResponse.json(
      { error: "Failed to list photos" },
      { status: 500 }
    );
  }
}
