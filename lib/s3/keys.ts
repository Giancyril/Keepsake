import crypto from "crypto";

const ORIGINALS_PREFIX = "originals";
const THUMBNAILS_PREFIX = "thumbnails";

/**
 * Generate a unique S3 key for an original photo/video upload.
 * Pattern: originals/<userId>/<uuid>.<ext>
 */
export function originalKey(userId: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "bin";
  const uuid = crypto.randomUUID();
  return `${ORIGINALS_PREFIX}/${userId}/${uuid}.${ext}`;
}

/**
 * S3 key for the small (320px) grid thumbnail.
 * Pattern: thumbnails/<userId>/<uuid>_sm.jpg
 */
export function thumbnailSmKey(originalKey: string): string {
  const base = originalKey
    .replace(`${ORIGINALS_PREFIX}/`, `${THUMBNAILS_PREFIX}/`)
    .replace(/\.[^.]+$/, "");
  return `${base}_sm.jpg`;
}

/**
 * S3 key for the medium (1200px) preview thumbnail.
 * Pattern: thumbnails/<userId>/<uuid>_md.jpg
 */
export function thumbnailMdKey(originalKey: string): string {
  const base = originalKey
    .replace(`${ORIGINALS_PREFIX}/`, `${THUMBNAILS_PREFIX}/`)
    .replace(/\.[^.]+$/, "");
  return `${base}_md.jpg`;
}
