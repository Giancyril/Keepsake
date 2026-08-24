import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { photos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const [existing] = await db
      .select({ id: photos.id, isFavorite: photos.isFavorite })
      .from(photos)
      .where(and(eq(photos.id, id), eq(photos.userId, session.user.id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const nextFavorite =
      typeof body.isFavorite === "boolean" ? body.isFavorite : !existing.isFavorite;

    const [updated] = await db
      .update(photos)
      .set({ isFavorite: nextFavorite })
      .where(and(eq(photos.id, id), eq(photos.userId, session.user.id)))
      .returning({ id: photos.id, isFavorite: photos.isFavorite });

    return NextResponse.json({ success: true, photo: updated });
  } catch (err: any) {
    console.error("[PATCH /api/photos/[id]/favorite] Error:", err);
    return NextResponse.json(
      { error: "Failed to update favorite status" },
      { status: 500 }
    );
  }
}
