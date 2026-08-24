export type AspectRatioType = "free" | "1:1" | "4:5" | "16:9" | "9:16" | "3:2";

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AspectRatioOption {
  id: AspectRatioType;
  label: string;
  ratio: number | null; // width / height
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { id: "free", label: "Freeform", ratio: null },
  { id: "1:1", label: "Square (1:1)", ratio: 1 },
  { id: "4:5", label: "Portrait (4:5)", ratio: 4 / 5 },
  { id: "3:2", label: "Classic (3:2)", ratio: 3 / 2 },
  { id: "16:9", label: "Widescreen (16:9)", ratio: 16 / 9 },
  { id: "9:16", label: "Story (9:16)", ratio: 9 / 16 },
];

/**
 * Calculates initial centered crop bounds given container dimensions and target aspect ratio.
 */
export function calculateInitialCrop(
  imageWidth: number,
  imageHeight: number,
  targetRatio: number | null
): CropRect {
  if (!targetRatio) {
    return { x: 0, y: 0, width: imageWidth, height: imageHeight };
  }

  const currentRatio = imageWidth / imageHeight;

  if (currentRatio > targetRatio) {
    // Image is wider than target ratio
    const cropWidth = imageHeight * targetRatio;
    const x = (imageWidth - cropWidth) / 2;
    return { x, y: 0, width: cropWidth, height: imageHeight };
  } else {
    // Image is taller than target ratio
    const cropHeight = imageWidth / targetRatio;
    const y = (imageHeight - cropHeight) / 2;
    return { x: 0, y, width: imageWidth, height: cropHeight };
  }
}
