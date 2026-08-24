// Photo status lifecycle
export type PhotoStatus = "processing" | "ready" | "error";

// Photo as returned by the API (includes pre-signed URLs, not raw S3 keys)
export interface PhotoWithUrls {
  id: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  takenAt: string | null;  // ISO 8601
  uploadedAt: string;       // ISO 8601
  status: PhotoStatus;
  cameraInfo: string | null;
  gpsLat: string | null;
  gpsLng: string | null;
  durationSecs: number | null;
  // Pre-signed URLs (null when photo is still processing)
  originalUrl: string | null;
  thumbnailSmUrl: string | null;
  thumbnailMdUrl: string | null;
}

// Paginated list response
export interface PhotoListResponse {
  photos: PhotoWithUrls[];
  nextCursor: string | null; // ISO 8601 takenAt for next page
  total: number;
}

// Presign request (one entry per file)
export interface PresignRequest {
  filename: string;
  mimeType: string;
  size: number;
}

// Presign response (one entry per file)
export interface PresignResponse {
  uploadId: string;
  presignedUrl: string;
  s3Key: string;
  expiresIn: number; // seconds
}

// Confirm upload request
export interface ConfirmUploadRequest {
  uploadId: string;
  s3Key: string;
  filename: string;
  mimeType: string;
  size: number;
}
