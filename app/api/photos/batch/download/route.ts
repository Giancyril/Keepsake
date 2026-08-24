import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { photos } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { s3, BUCKET } from "@/lib/s3/client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import JSZip from "jszip";

async function getS3Buffer(key: string): Promise<Buffer> {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );

  const stream = response.Body;
  if (!stream) throw new Error("Empty S3 response");

  const chunks: Uint8Array[] = [];
  // @ts-expect-error Node stream async iterator
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { photoIds } = body;

    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json({ error: "photoIds array is required" }, { status: 400 });
    }

    const selectedPhotos = await db
      .select()
      .from(photos)
      .where(and(eq(photos.userId, session.user.id), inArray(photos.id, photoIds)));

    if (selectedPhotos.length === 0) {
      return NextResponse.json({ error: "No photos found" }, { status: 404 });
    }

    const zip = new JSZip();
    const manifest: any[] = [];

    // Fetch originals and add to ZIP
    await Promise.all(
      selectedPhotos.map(async (p, idx) => {
        try {
          const buffer = await getS3Buffer(p.s3Key);
          // Handle potential filename duplicates
          const safeFilename = `${idx + 1}_${p.filename}`;
          zip.file(safeFilename, buffer);

          manifest.push({
            filename: p.filename,
            zipEntry: safeFilename,
            mimeType: p.mimeType,
            fileSize: p.fileSize,
            takenAt: p.takenAt,
            cameraInfo: p.cameraInfo,
            locationName: p.locationName,
            gpsLat: p.gpsLat,
            gpsLng: p.gpsLng,
          });
        } catch (err) {
          console.warn(`Failed to package ${p.filename} into ZIP:`, err);
        }
      })
    );

    // Add manifest.json metadata export
    zip.file("manifest.json", JSON.stringify({ exportDate: new Date().toISOString(), photos: manifest }, null, 2));

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="keepsake_export_${new Date().toISOString().split("T")[0]}.zip"`,
      },
    });
  } catch (err: any) {
    console.error("[POST /api/photos/batch/download] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate ZIP export" },
      { status: 500 }
    );
  }
}
