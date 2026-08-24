import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { formatBytes } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userPhotos = await db
      .select({
        id: photos.id,
        filename: photos.filename,
        fileSize: photos.fileSize,
        mimeType: photos.mimeType,
        width: photos.width,
        height: photos.height,
        cameraInfo: photos.cameraInfo,
        takenAt: photos.takenAt,
        uploadedAt: photos.uploadedAt,
      })
      .from(photos)
      .where(and(eq(photos.userId, session.user.id), eq(photos.status, "ready")));

    let totalBytes = 0;
    const formatStats: Record<string, { count: number; bytes: number }> = {
      raw: { count: 0, bytes: 0 },
      jpeg: { count: 0, bytes: 0 },
      heic: { count: 0, bytes: 0 },
      video: { count: 0, bytes: 0 },
      other: { count: 0, bytes: 0 },
    };

    const cameraStats = new Map<string, number>();

    for (const p of userPhotos) {
      totalBytes += p.fileSize;
      const mime = p.mimeType.toLowerCase();
      const name = p.filename.toLowerCase();

      if (mime.startsWith("video/")) {
        formatStats.video.count++;
        formatStats.video.bytes += p.fileSize;
      } else if (name.endsWith(".dng") || name.endsWith(".cr2") || name.endsWith(".arw") || name.endsWith(".raw")) {
        formatStats.raw.count++;
        formatStats.raw.bytes += p.fileSize;
      } else if (mime.includes("heic") || mime.includes("heif") || name.endsWith(".heic")) {
        formatStats.heic.count++;
        formatStats.heic.bytes += p.fileSize;
      } else if (mime.includes("jpeg") || mime.includes("jpg") || mime.includes("png") || mime.includes("webp")) {
        formatStats.jpeg.count++;
        formatStats.jpeg.bytes += p.fileSize;
      } else {
        formatStats.other.count++;
        formatStats.other.bytes += p.fileSize;
      }

      const camera = p.cameraInfo || "Unknown Device";
      cameraStats.set(camera, (cameraStats.get(camera) || 0) + 1);
    }

    const cameras = Array.from(cameraStats.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      summary: {
        totalPhotos: userPhotos.length,
        totalBytes,
        formattedTotalBytes: formatBytes(totalBytes),
      },
      formats: [
        { label: "RAW Digital Negatives", count: formatStats.raw.count, bytes: formatStats.raw.bytes, formatted: formatBytes(formatStats.raw.bytes), color: "#EC4899" },
        { label: "High Efficiency (HEIC)", count: formatStats.heic.count, bytes: formatStats.heic.bytes, formatted: formatBytes(formatStats.heic.bytes), color: "#8B5CF6" },
        { label: "Standard Photos (JPEG/PNG)", count: formatStats.jpeg.count, bytes: formatStats.jpeg.bytes, formatted: formatBytes(formatStats.jpeg.bytes), color: "#3B82F6" },
        { label: "Videos & Motion", count: formatStats.video.count, bytes: formatStats.video.bytes, formatted: formatBytes(formatStats.video.bytes), color: "#10B981" },
        { label: "Other Documents", count: formatStats.other.count, bytes: formatStats.other.bytes, formatted: formatBytes(formatStats.other.bytes), color: "#6B7280" },
      ],
      cameras,
    });
  } catch (err: any) {
    console.error("[GET /api/analytics/storage] Error:", err);
    return NextResponse.json(
      { error: "Failed to load storage analytics" },
      { status: 500 }
    );
  }
}
