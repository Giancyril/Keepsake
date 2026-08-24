import convert from "heic-convert";

/**
 * Converts a HEIC/HEIF buffer into a JPEG buffer for web display and processing.
 * Preserves the original file while allowing sharp and browsers to render it.
 */
export async function convertHeicToJpeg(buffer: Buffer): Promise<Buffer> {
  const result = await convert({
    buffer,
    format: "JPEG",
    quality: 0.9,
  });

  return Buffer.from(result);
}
