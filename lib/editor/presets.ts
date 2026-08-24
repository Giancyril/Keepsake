import { EditorAdjustments } from "./adjustments";

export interface FilmPreset {
  id: string;
  name: string;
  description: string;
  adjustments: EditorAdjustments;
  badgeColor: string;
}

export const FILM_PRESETS: FilmPreset[] = [
  {
    id: "original",
    name: "Original",
    description: "Lossless unedited capture",
    badgeColor: "var(--color-border)",
    adjustments: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      temperature: 0,
      vignette: 0,
      rotation: 0,
    },
  },
  {
    id: "vivid",
    name: "Vivid Pop",
    description: "Punchy colors with elevated dynamic range",
    badgeColor: "#3B82F6",
    adjustments: {
      brightness: 8,
      contrast: 22,
      saturation: 38,
      temperature: 5,
      vignette: 8,
      rotation: 0,
    },
  },
  {
    id: "noir",
    name: "Monochrome Noir",
    description: "Deep contrast black & white with soft vignette",
    badgeColor: "#6B7280",
    adjustments: {
      brightness: -2,
      contrast: 40,
      saturation: -100,
      temperature: 0,
      vignette: 30,
      rotation: 0,
    },
  },
  {
    id: "vintage",
    name: "Warm Vintage",
    description: "Analog warmth with nostalgic amber highlights",
    badgeColor: "#F59E0B",
    adjustments: {
      brightness: 6,
      contrast: 14,
      saturation: -12,
      temperature: 42,
      vignette: 24,
      rotation: 0,
    },
  },
  {
    id: "cinematic",
    name: "Cinematic Cool",
    description: "Modern teal-shadow look with rich tonal depth",
    badgeColor: "#06B6D4",
    adjustments: {
      brightness: 4,
      contrast: 24,
      saturation: 12,
      temperature: -28,
      vignette: 18,
      rotation: 0,
    },
  },
  {
    id: "gold",
    name: "Golden Hour",
    description: "Soft sunset glow with lifted shadows",
    badgeColor: "#EAB308",
    adjustments: {
      brightness: 12,
      contrast: 8,
      saturation: 20,
      temperature: 35,
      vignette: 12,
      rotation: 0,
    },
  },
];
