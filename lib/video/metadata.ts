/**
 * Video Metadata Extraction Helper for Keepsake.
 * Formats duration strings and handles video specs.
 */

export interface VideoMetadata {
  durationSecs: number;
  formattedDuration: string;
  width?: number;
  height?: number;
  codec?: string;
}

/**
 * Formats seconds into standard digital video timestamp (e.g. 1:45 or 0:12).
 */
export function formatVideoDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Parses client-side video file object to extract exact duration & dimensions before upload.
 */
export function extractClientVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const durationSecs = Math.round(video.duration || 0);
      resolve({
        durationSecs,
        formattedDuration: formatVideoDuration(durationSecs),
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };

    video.onerror = () => {
      resolve({
        durationSecs: 0,
        formattedDuration: "0:00",
      });
    };

    video.src = URL.createObjectURL(file);
  });
}
