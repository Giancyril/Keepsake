import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generatePhotoUrls } from "@/lib/s3/presign";
import { s3, BUCKET } from "@/lib/s3/client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [photo] = await db
      .select()
      .from(photos)
      .where(and(eq(photos.id, id), eq(photos.userId, session.user.id)))
      .limit(1);

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const urls = await generatePhotoUrls(
      photo.s3Key,
      photo.s3KeySm,
      photo.s3KeyMd
    );

    return NextResponse.json({
      photo: {
        id: photo.id,
        filename: photo.filename,
        mimeType: photo.mimeType,
        fileSize: photo.fileSize,
        width: photo.width,
        height: photo.height,
        takenAt: photo.takenAt ? photo.takenAt.toISOString() : null,
        uploadedAt: photo.uploadedAt.toISOString(),
        status: photo.status,
        cameraInfo: photo.cameraInfo,
        gpsLat: photo.gpsLat,
        gpsLng: photo.gpsLng,
        durationSecs: photo.durationSecs,
        originalUrl: urls.originalUrl,
        thumbnailSmUrl: urls.thumbnailSmUrl,
        thumbnailMdUrl: urls.thumbnailMdUrl,
      },
    });
  } catch (err) {
    console.error("[GET /api/photos/:id]", err);
    return NextResponse.json(
      { error: "Failed to fetch photo detail" },
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

    const { id } = await params;

    const [photo] = await db
      .select()
      .from(photos)
      .where(and(eq(photos.id, id), eq(photos.userId, session.user.id)))
      .limit(1);

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Delete objects from S3
    const deleteKeys = [photo.s3Key];
    if (photo.s3KeySm) deleteKeys.push(photo.s3KeySm);
    if (photo.s3KeyMd) deleteKeys.push(photo.s3KeyMd);

    await Promise.all(
      deleteKeys.map((Key) =>
        s3
          .send(new DeleteObjectCommand({ Bucket: BUCKET, Key }))
          .catch((err) =>
            console.warn(`[S3 Delete] Warning deleting key ${Key}:`, err)
          )
      )
    );

    // Delete DB record
    await db.delete(photos).where(eq(photos.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/photos/:id]", err);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
