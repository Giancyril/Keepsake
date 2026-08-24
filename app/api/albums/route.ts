import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { albums, albumPhotos, photos } from "@/lib/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { generatePhotoUrls } from "@/lib/s3/presign";
import { z } from "zod";

const createAlbumSchema = z.object({
  name: z.string().min(1, "Album name is required").max(100),
  description: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all albums belonging to user
    const albumRows = await db
      .select()
      .from(albums)
      .where(eq(albums.userId, session.user.id))
      .orderBy(desc(albums.createdAt));

    // For each album, get count of photos and the latest photo for cover thumbnail
    const albumsWithCovers = await Promise.all(
      albumRows.map(async (alb) => {
        const [countRow] = await db
          .select({ value: count() })
          .from(albumPhotos)
          .where(eq(albumPhotos.albumId, alb.id));

        // Get latest photo added to album
        const [latestPhotoRow] = await db
          .select({
            s3Key: photos.s3Key,
            s3KeySm: photos.s3KeySm,
            s3KeyMd: photos.s3KeyMd,
          })
          .from(albumPhotos)
          .innerJoin(photos, eq(albumPhotos.photoId, photos.id))
          .where(eq(albumPhotos.albumId, alb.id))
          .orderBy(desc(albumPhotos.addedAt))
          .limit(1);

        let coverPhotoUrl: string | null = null;
        if (latestPhotoRow) {
          try {
            const urls = await generatePhotoUrls(
              latestPhotoRow.s3Key,
              latestPhotoRow.s3KeySm,
              latestPhotoRow.s3KeyMd
            );
            coverPhotoUrl = urls.thumbnailSmUrl || urls.thumbnailMdUrl || urls.originalUrl;
          } catch (e) {
            console.warn(`[Cover URL] Failed for album ${alb.id}:`, e);
          }
        }

        return {
          id: alb.id,
          name: alb.name,
          description: alb.description,
          createdAt: alb.createdAt.toISOString(),
          updatedAt: alb.updatedAt.toISOString(),
          photoCount: countRow?.value ?? 0,
          coverPhotoUrl,
        };
      })
    );

    return NextResponse.json({ albums: albumsWithCovers });
  } catch (err) {
    console.error("[GET /api/albums]", err);
    return NextResponse.json(
      { error: "Failed to list albums" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createAlbumSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const { name, description } = parsed.data;

    const [album] = await db
      .insert(albums)
      .values({
        userId: session.user.id,
        name,
        description,
      })
      .returning();

    return NextResponse.json({ album }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/albums]", err);
    return NextResponse.json(
      { error: "Failed to create album" },
      { status: 500 }
    );
  }
}
