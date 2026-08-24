import { db } from "@/lib/db/client";
import { photos } from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { generatePhotoUrls } from "@/lib/s3/presign";

export interface MemoryCapsule {
  id: string;
  title: string;
  subtitle: string;
  yearsAgo: number;
  dateStr: string;
  photoCount: number;
  coverPhotoUrl: string;
  photoIds: string[];
}

/**
 * Finds nostalgic "On This Day" memories for a given user across past years.
 */
export async function getMemoriesForUser(
  userId: string,
  targetDate: Date = new Date()
): Promise<MemoryCapsule[]> {
  const currentMonth = targetDate.getMonth() + 1; // 1-12
  const currentDay = targetDate.getDate(); // 1-31
  const currentYear = targetDate.getFullYear();

  // Query photos taken on this month and day in ANY past year
  const rawRows = await db
    .select({
      id: photos.id,
      s3Key: photos.s3Key,
      s3KeySm: photos.s3KeySm,
      s3KeyMd: photos.s3KeyMd,
      filename: photos.filename,
      takenAt: photos.takenAt,
      locationName: photos.locationName,
      city: photos.city,
    })
    .from(photos)
    .where(
      and(
        eq(photos.userId, userId),
        eq(photos.status, "ready"),
        sql`EXTRACT(MONTH FROM ${photos.takenAt}) = ${currentMonth}`,
        sql`EXTRACT(DAY FROM ${photos.takenAt}) = ${currentDay}`,
        sql`EXTRACT(YEAR FROM ${photos.takenAt}) < ${currentYear}`
      )
    )
    .orderBy(desc(photos.takenAt));

  if (rawRows.length === 0) {
    return [];
  }

  // Group photos by year
  const yearMap = new Map<number, typeof rawRows>();
  for (const row of rawRows) {
    if (!row.takenAt) continue;
    const year = new Date(row.takenAt).getFullYear();
    if (!yearMap.has(year)) {
      yearMap.set(year, []);
    }
    yearMap.get(year)!.push(row);
  }

  const capsules: MemoryCapsule[] = [];

  for (const [year, items] of yearMap.entries()) {
    const yearsAgo = currentYear - year;
    const coverItem = items[0];

    let coverUrl = "";
    try {
      const urls = await generatePhotoUrls(coverItem.s3Key, coverItem.s3KeySm, coverItem.s3KeyMd);
      coverUrl = urls.thumbnailMdUrl || urls.thumbnailSmUrl || urls.originalUrl;
    } catch {
      // ignore
    }

    const title = yearsAgo === 1 ? "1 Year Ago Today" : `${yearsAgo} Years Ago Today`;
    const subtitle = coverItem.city || coverItem.locationName || `${items.length} moments remembered`;

    capsules.push({
      id: `memory-${year}`,
      title,
      subtitle,
      yearsAgo,
      dateStr: new Date(coverItem.takenAt!).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      photoCount: items.length,
      coverPhotoUrl: coverUrl,
      photoIds: items.map((p) => p.id),
    });
  }

  return capsules.sort((a, b) => a.yearsAgo - b.yearsAgo);
}
