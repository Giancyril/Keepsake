export interface Album {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  photoCount?: number;
  coverPhotoUrl?: string | null;
}

export interface AlbumListResponse {
  albums: Album[];
}

export interface CreateAlbumRequest {
  name: string;
  description?: string;
}
