import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { photos } from "@/lib/db/schema";
import { enqueuePhotoProcessing } from "@/lib/processing/queue";
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

    // Security check: ensure the S3 key belongs to the authenticated user
    const expectedPrefix = `originals/${session.user.id}/`;
    if (!s3Key.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: "Forbidden: S3 key does not belong to user" },
        { status: 403 }
      );
    }

    // Insert pending record in PostgreSQL
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

    // Trigger async processing pipeline (EXIF + Thumbnails + S3 upload)
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
