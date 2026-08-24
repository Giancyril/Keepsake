import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { validateShareToken, revokeShare } from "@/lib/shares";
import { db } from "@/lib/db/client";
import { photos, albums, albumPhotos } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { generatePhotoUrls } from "@/lib/s3/presign";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const result = await validateShareToken(token);

    if (!result.valid) {
      if (result.reason === "revoked") {
        return NextResponse.json(
          { error: "This share link has been revoked by the owner." },
          { status: 410 }
        );
      }
      if (result.reason === "expired") {
        return NextResponse.json(
          { error: "This share link has expired." },
          { status: 410 }
        );
      }
      return NextResponse.json({ error: "Share not found" }, { status: 404 });
    }

    const { share } = result;

    if (share.targetType === "photo") {
      const [photo] = await db
        .select()
        .from(photos)
        .where(eq(photos.id, share.targetId))
        .limit(1);

      if (!photo) {
        return NextResponse.json({ error: "Photo not found" }, { status: 404 });
      }

      const urls = await generatePhotoUrls(photo.s3Key, photo.s3KeySm, photo.s3KeyMd);

      return NextResponse.json({
        targetType: "photo",
        expiresAt: share.expiresAt ? share.expiresAt.toISOString() : null,
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
          durationSecs: photo.durationSecs,
          originalUrl: urls.originalUrl,
          thumbnailSmUrl: urls.thumbnailSmUrl,
          thumbnailMdUrl: urls.thumbnailMdUrl,
        },
      });
    }

    if (share.targetType === "album") {
      const [album] = await db
        .select()
        .from(albums)
        .where(eq(albums.id, share.targetId))
        .limit(1);

      if (!album) {
        return NextResponse.json({ error: "Album not found" }, { status: 404 });
      }

      const albumPhotoRows = await db
        .select({
          id: photos.id,
          s3Key: photos.s3Key,
          s3KeySm: photos.s3KeySm,
          s3KeyMd: photos.s3KeyMd,
          filename: photos.filename,
          mimeType: photos.mimeType,
          fileSize: photos.fileSize,
          width: photos.width,
          height: photos.height,
          takenAt: photos.takenAt,
          uploadedAt: photos.uploadedAt,
          status: photos.status,
          cameraInfo: photos.cameraInfo,
          durationSecs: photos.durationSecs,
        })
        .from(albumPhotos)
        .innerJoin(photos, eq(albumPhotos.photoId, photos.id))
        .where(eq(albumPhotos.albumId, album.id))
        .orderBy(desc(albumPhotos.addedAt));

      const photosWithUrls = await Promise.all(
        albumPhotoRows.map(async (p) => {
          let urls = {
            originalUrl: "",
            thumbnailSmUrl: null as string | null,
            thumbnailMdUrl: null as string | null,
          };
          try {
            urls = await generatePhotoUrls(p.s3Key, p.s3KeySm, p.s3KeyMd);
          } catch (e) {
            console.warn(e);
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
            status: p.status,
            cameraInfo: p.cameraInfo,
            durationSecs: p.durationSecs,
            originalUrl: urls.originalUrl,
            thumbnailSmUrl: urls.thumbnailSmUrl,
            thumbnailMdUrl: urls.thumbnailMdUrl,
          };
        })
      );

      return NextResponse.json({
        targetType: "album",
        expiresAt: share.expiresAt ? share.expiresAt.toISOString() : null,
        album: {
          id: album.id,
          name: album.name,
          description: album.description,
        },
        photos: photosWithUrls,
      });
    }

    return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
  } catch (err) {
    console.error("[GET /api/shares/:token]", err);
    return NextResponse.json(
      { error: "Failed to resolve share link" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await params;
    const revoked = await revokeShare(token, session.user.id);

    if (!revoked) {
      return NextResponse.json(
        { error: "Share link not found or not owned by you" },
        { status: 404 }
      );
    }

    return NextResponse.json({ revoked: true });
  } catch (err) {
    console.error("[DELETE /api/shares/:token]", err);
    return NextResponse.json(
      { error: "Failed to revoke share link" },
      { status: 500 }
    );
  }
}
