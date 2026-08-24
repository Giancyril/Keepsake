import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { shares, photos, albums } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateShareToken } from "@/lib/shares";
import { z } from "zod";

const createShareSchema = z.object({
  targetType: z.enum(["photo", "album"]),
  targetId: z.string().uuid(),
  expiresInDays: z.number().int().positive().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createShareSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const { targetType, targetId, expiresInDays } = parsed.data;

    // Verify ownership of the target resource
    if (targetType === "photo") {
      const [photo] = await db
        .select({ id: photos.id })
        .from(photos)
        .where(and(eq(photos.id, targetId), eq(photos.userId, session.user.id)))
        .limit(1);

      if (!photo) {
        return NextResponse.json({ error: "Photo not found" }, { status: 404 });
      }
    } else if (targetType === "album") {
      const [album] = await db
        .select({ id: albums.id })
        .from(albums)
        .where(and(eq(albums.id, targetId), eq(albums.userId, session.user.id)))
        .limit(1);

      if (!album) {
        return NextResponse.json({ error: "Album not found" }, { status: 404 });
      }
    }

    // Calculate expiration timestamp
    let expiresAt: Date | null = null;
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    }

    // Generate secure 32-byte crypto token
    const token = generateShareToken();

    const [share] = await db
      .insert(shares)
      .values({
        userId: session.user.id,
        token,
        targetType,
        targetId,
        expiresAt,
      })
      .returning();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shareUrl = `${appUrl}/share/${share.token}`;

    return NextResponse.json(
      {
        share: {
          id: share.id,
          token: share.token,
          targetType: share.targetType,
          targetId: share.targetId,
          expiresAt: share.expiresAt ? share.expiresAt.toISOString() : null,
          revokedAt: share.revokedAt ? share.revokedAt.toISOString() : null,
          viewCount: share.viewCount,
          createdAt: share.createdAt.toISOString(),
          shareUrl,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/shares]", err);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}
