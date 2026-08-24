/**
 * Photo Editor Canvas Adjustment Engine for Keepsake.
 * Fast, non-destructive image adjustments and matrix filters.
 */

export interface EditorAdjustments {
  brightness: number;  // -100 to +100 (0 default)
  contrast: number;    // -100 to +100 (0 default)
  saturation: number;  // -100 to +100 (0 default)
  temperature: number; // -100 to +100 (0 default, warm > 0, cool < 0)
  vignette: number;    // 0 to 100 (0 default)
  rotation: number;    // 0, 90, 180, 270
}

export const DEFAULT_ADJUSTMENTS: EditorAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  vignette: 0,
  rotation: 0,
};

/**
 * Converts adjustment values into a standard CSS filter string for live rendering.
 */
export function getCssFilterString(adj: EditorAdjustments): string {
  const b = 1 + adj.brightness / 100;
  const c = 1 + adj.contrast / 100;
  const s = 1 + adj.saturation / 100;

  // Temperature hue approximation
  const hue = (adj.temperature * 0.15).toFixed(1);

  return `brightness(${b}) contrast(${c}) saturate(${s}) hue-rotate(${hue}deg)`;
}

/**
 * Renders the adjusted image to a clean HTML5 canvas and exports as a high-quality JPEG blob.
 */
export async function renderAdjustedCanvas(
  imageElement: HTMLImageElement,
  adj: EditorAdjustments
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not acquire 2D canvas context");

  const isRotated90or270 = adj.rotation === 90 || adj.rotation === 270;
  const width = isRotated90or270 ? imageElement.naturalHeight : imageElement.naturalWidth;
  const height = isRotated90or270 ? imageElement.naturalWidth : imageElement.naturalHeight;

  canvas.width = width;
  canvas.height = height;

  ctx.save();

  // Apply Rotation
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((adj.rotation * Math.PI) / 180);

  // Apply CSS Filters directly to canvas context
  ctx.filter = getCssFilterString(adj);

  ctx.drawImage(
    imageElement,
    -imageElement.naturalWidth / 2,
    -imageElement.naturalHeight / 2,
    imageElement.naturalWidth,
    imageElement.naturalHeight
  );

  ctx.restore();

  // Apply Vignette if specified
  if (adj.vignette > 0) {
    const radius = Math.max(canvas.width, canvas.height) / 2;
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      radius * 0.4,
      canvas.width / 2,
      canvas.height / 2,
      radius
    );
    const vignetteOpacity = (adj.vignette / 100) * 0.7;
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, `rgba(0,0,0,${vignetteOpacity})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas blob conversion failed"));
      },
      "image/jpeg",
      0.92
    );
  });
}
