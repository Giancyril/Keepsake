export type ShareTargetType = "photo" | "album";

export interface Share {
  id: string;
  token: string;
  targetType: ShareTargetType;
  targetId: string;
  expiresAt: string | null;
  revokedAt: string | null;
  viewCount: number;
  createdAt: string;
  // Convenience: full shareable URL
  shareUrl: string;
}

export interface CreateShareRequest {
  targetType: ShareTargetType;
  targetId: string;
  expiresInDays?: number; // null = never expires
}

export interface CreateShareResponse {
  share: Share;
}
