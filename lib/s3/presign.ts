import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, BUCKET } from "./client";

const UPLOAD_URL_TTL_SECS = 900;   // 15 minutes
const DOWNLOAD_URL_TTL_SECS = 300; // 5 minutes

/**
 * Generate a pre-signed S3 PUT URL for direct browser → S3 upload.
 * The ContentLengthRange condition enforces the file size limit server-side,
 * so even if a client bypasses the client-side check, S3 rejects oversized files.
 */
export async function generateUploadUrl(
  s3Key: string,
  mimeType: string,
  maxSizeBytes: number
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
    ContentType: mimeType,
  });

  return getSignedUrl(s3, command, {
    expiresIn: UPLOAD_URL_TTL_SECS,
  });
}

/**
 * Generate a pre-signed S3 GET URL for serving a private object.
 * Short TTL (5 minutes) — regenerated on every request through the app,
 * so access always flows through authorization checks.
 */
export async function generateDownloadUrl(s3Key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
  });

  return getSignedUrl(s3, command, {
    expiresIn: DOWNLOAD_URL_TTL_SECS,
  });
}

/**
 * Generate download URLs for both thumbnail sizes of a photo.
 * Returns null for missing keys (e.g. photo still processing).
 */
export async function generatePhotoUrls(
  s3Key: string,
  s3KeySm: string | null,
  s3KeyMd: string | null
): Promise<{
  originalUrl: string;
  thumbnailSmUrl: string | null;
  thumbnailMdUrl: string | null;
}> {
  const [originalUrl, thumbnailSmUrl, thumbnailMdUrl] = await Promise.all([
    generateDownloadUrl(s3Key),
    s3KeySm ? generateDownloadUrl(s3KeySm) : Promise.resolve(null),
    s3KeyMd ? generateDownloadUrl(s3KeyMd) : Promise.resolve(null),
  ]);

  return { originalUrl, thumbnailSmUrl, thumbnailMdUrl };
}
