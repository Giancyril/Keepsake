import PQueue from "p-queue";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, BUCKET } from "@/lib/s3/client";
import { thumbnailSmKey, thumbnailMdKey } from "@/lib/s3/keys";
import { extractMetadata } from "./exif";
import { convertHeicToJpeg } from "./heic";
import { generateThumbnails } from "./thumbnails";
import { db } from "@/lib/db/client";
import { photos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isHeic, isVideo } from "@/lib/utils";

import { reverseGeocode } from "@/lib/geo/reverse";

const concurrency = Number(process.env.PROCESSING_CONCURRENCY) || 2;
const processingQueue = new PQueue({ concurrency });

interface ProcessPhotoJob {
  photoId: string;
  s3Key: string;
  mimeType: string;
  stripGps?: boolean;
}

/**
 * Downloads an S3 object as a complete Buffer.
 */
async function getS3Buffer(key: string): Promise<Buffer> {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );

  const stream = response.Body;
  if (!stream) throw new Error("Empty S3 response stream");

  const chunks: Uint8Array[] = [];
  // @ts-expect-error stream is an async iterable in AWS SDK v3 Node runtime
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Uploads a generated thumbnail Buffer to S3.
 */
async function putS3Thumbnail(key: string, buffer: Buffer): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "image/jpeg",
    })
  );
}

/**
 * Enqueue a photo processing job in the background queue.
 */
export function enqueuePhotoProcessing(job: ProcessPhotoJob): void {
  processingQueue.add(async () => {
    try {
      console.log(`[Processing] Starting job for photo ${job.photoId}...`);

      // Step 1: Download original from S3
      const originalBuffer = await getS3Buffer(job.s3Key);

      // If video, skip deep image manipulation for v1 (mark ready)
      if (isVideo(job.mimeType)) {
        await db
          .update(photos)
          .set({ status: "ready" })
          .where(eq(photos.id, job.photoId));
        return;
      }

      // Step 2: Extract EXIF metadata
      const meta = await extractMetadata(originalBuffer, job.stripGps);

      // Step 3: Handle HEIC conversion if needed
      let workingBuffer = originalBuffer;
      if (isHeic(job.mimeType) || job.s3Key.toLowerCase().endsWith(".heic")) {
        try {
          workingBuffer = await convertHeicToJpeg(originalBuffer);
        } catch (heicErr) {
          console.warn("[Processing] HEIC conversion warning:", heicErr);
        }
      }

      // Step 4: Generate sharp thumbnails
      const thumbs = await generateThumbnails(workingBuffer);

      // Step 5: Upload thumbnails to S3
      const keySm = thumbnailSmKey(job.s3Key);
      const keyMd = thumbnailMdKey(job.s3Key);

      await Promise.all([
        putS3Thumbnail(keySm, thumbs.sm),
        putS3Thumbnail(keyMd, thumbs.md),
      ]);

      // Step 6: Reverse geocode if coordinates present
      let geoInfo: { city?: string; country?: string; countryCode?: string; locationName?: string } = {};
      if (meta.gpsLat !== undefined && meta.gpsLng !== undefined) {
        try {
          geoInfo = await reverseGeocode(meta.gpsLat, meta.gpsLng);
        } catch (geoErr) {
          console.warn("[Processing] Reverse geocoding warning:", geoErr);
        }
      }

      // Step 7: Update DB record to "ready" with metadata
      await db
        .update(photos)
        .set({
          status: "ready",
          s3KeySm: keySm,
          s3KeyMd: keyMd,
          width: meta.width || thumbs.width,
          height: meta.height || thumbs.height,
          takenAt: meta.takenAt ?? undefined,
          cameraInfo: meta.cameraInfo,
          gpsLat: meta.gpsLat !== undefined ? meta.gpsLat.toString() : undefined,
          gpsLng: meta.gpsLng !== undefined ? meta.gpsLng.toString() : undefined,
          locationName: geoInfo.locationName,
          city: geoInfo.city,
          country: geoInfo.country,
          countryCode: geoInfo.countryCode,
        })
        .where(eq(photos.id, job.photoId));

      console.log(`[Processing] Completed successfully for photo ${job.photoId}`);
    } catch (err) {
      console.error(`[Processing] Failed for photo ${job.photoId}:`, err);
      await db
        .update(photos)
        .set({ status: "error" })
        .where(eq(photos.id, job.photoId))
        .catch(console.error);
    }
  });
}
