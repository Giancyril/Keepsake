import sharp from "sharp";

export interface ThumbnailBuffers {
  sm: Buffer;
  md: Buffer;
  width: number;
  height: number;
}

/**
 * Generate small (320x320 cover crop) and medium (1200px max edge fit) JPEG thumbnails
 * using sharp. Auto-rotates using EXIF orientation tag.
 */
export async function generateThumbnails(
  imageBuffer: Buffer
): Promise<ThumbnailBuffers> {
  const image = sharp(imageBuffer).rotate(); // auto-orient based on EXIF tag
  const meta = await image.metadata();

  const [sm, md] = await Promise.all([
    image
      .clone()
      .resize(320, 320, {
        fit: "cover",
        position: "centre",
      })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer(),
    image
      .clone()
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer(),
  ]);

  return {
    sm,
    md,
    width: meta.width || 0,
    height: meta.height || 0,
  };
}
