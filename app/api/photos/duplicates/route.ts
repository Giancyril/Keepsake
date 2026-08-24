import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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
        uploadedAt: photos.uploadedAt,
      })
      .from(photos)
      .where(and(eq(photos.userId, session.user.id), eq(photos.status, "ready")));

    // Group photos by size and filename to detect duplicate uploads
    const sizeMap = new Map<string, typeof userPhotos>();

    for (const p of userPhotos) {
      const key = `${p.fileSize}_${p.filename.toLowerCase()}`;
      if (!sizeMap.has(key)) {
        sizeMap.set(key, []);
      }
      sizeMap.get(key)!.push(p);
    }

    const duplicates = [];
    let totalWastedBytes = 0;

    for (const [key, items] of sizeMap.entries()) {
      if (items.length > 1) {
        const wasted = items[0].fileSize * (items.length - 1);
        totalWastedBytes += wasted;
        duplicates.push({
          groupKey: key,
          filename: items[0].filename,
          fileSize: items[0].fileSize,
          count: items.length,
          wastedBytes: wasted,
          photoIds: items.map((i) => i.id),
        });
      }
    }

    return NextResponse.json({
      duplicates,
      totalDuplicatesCount: duplicates.reduce((acc, d) => acc + d.count - 1, 0),
      totalWastedBytes,
    });
  } catch (err: any) {
    console.error("[GET /api/photos/duplicates] Error:", err);
    return NextResponse.json(
      { error: "Failed to detect duplicates" },
      { status: 500 }
    );
  }
}
