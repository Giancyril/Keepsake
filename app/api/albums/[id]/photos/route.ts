import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { albums, albumPhotos, photos } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";

const photosPayloadSchema = z.object({
  photoIds: z.array(z.string().uuid()).min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: albumId } = await params;
    const body = await req.json();
    const parsed = photosPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    // Verify user owns the album
    const [album] = await db
      .select()
      .from(albums)
      .where(and(eq(albums.id, albumId), eq(albums.userId, session.user.id)))
      .limit(1);

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    // Verify all photoIds belong to the user
    const validUserPhotos = await db
      .select({ id: photos.id })
      .from(photos)
      .where(
        and(
          inArray(photos.id, parsed.data.photoIds),
          eq(photos.userId, session.user.id)
        )
      );

    const validIds = validUserPhotos.map((p) => p.id);
    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "No valid user photos to add" },
        { status: 400 }
      );
    }

    // Insert associations (ignoring duplicates via conflict or insert)
    for (const photoId of validIds) {
      await db
        .insert(albumPhotos)
        .values({
          albumId,
          photoId,
        })
        .onConflictDoNothing()
        .catch(console.error);
    }

    return NextResponse.json({ added: validIds.length }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/albums/:id/photos]", err);
    return NextResponse.json(
      { error: "Failed to add photos to album" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: albumId } = await params;
    const body = await req.json();
    const parsed = photosPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    // Verify user owns the album
    const [album] = await db
      .select()
      .from(albums)
      .where(and(eq(albums.id, albumId), eq(albums.userId, session.user.id)))
      .limit(1);

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }

    await db
      .delete(albumPhotos)
      .where(
        and(
          eq(albumPhotos.albumId, albumId),
          inArray(albumPhotos.photoId, parsed.data.photoIds)
        )
      );

    return NextResponse.json({ removed: parsed.data.photoIds.length });
  } catch (err) {
    console.error("[DELETE /api/albums/:id/photos]", err);
    return NextResponse.json(
      { error: "Failed to remove photos from album" },
      { status: 500 }
    );
  }
}
