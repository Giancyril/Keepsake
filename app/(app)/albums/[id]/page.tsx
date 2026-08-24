"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Album } from "@/types/album";
import { PhotoWithUrls } from "@/types/photo";
import { PhotoGrid } from "@/components/library/PhotoGrid";
import { PhotoSelector } from "@/components/albums/PhotoSelector";
import { ShareDialog } from "@/components/sharing/ShareDialog";
import { Lightbox } from "@/components/lightbox/Lightbox";
import { EmptyState } from "@/components/layout/EmptyState";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Share2,
  CheckSquare,
  Square,
  Loader2,
  FolderMinus,
} from "lucide-react";

export default function SingleAlbumPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = params.id as string;

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<PhotoWithUrls[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  const fetchAlbumData = useCallback(async () => {
    try {
      const [albumRes, photosRes] = await Promise.all([
        fetch(`/api/albums/${albumId}`),
        fetch(`/api/photos?albumId=${albumId}&limit=100`),
      ]);

      if (!albumRes.ok) throw new Error("Failed to load album");
      const albumData = await albumRes.json();
      setAlbum(albumData.album);
      setEditTitle(albumData.album.name);

      if (photosRes.ok) {
        const photosData = await photosRes.json();
        setPhotos(photosData.photos || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load album");
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  useEffect(() => {
    fetchAlbumData();
  }, [fetchAlbumData]);

  const handleUpdateTitle = async () => {
    if (!editTitle.trim() || editTitle === album?.name) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const res = await fetch(`/api/albums/${albumId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editTitle.trim() }),
      });
      if (res.ok) {
        setAlbum((prev) => (prev ? { ...prev, name: editTitle.trim() } : prev));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEditingTitle(false);
    }
  };

  const handleDeleteAlbum = async () => {
    if (!confirm("Are you sure you want to delete this album? Photos inside will remain in your library.")) {
      return;
    }

    try {
      const res = await fetch(`/api/albums/${albumId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/albums");
      }
    } catch (e) {
      alert("Failed to delete album.");
    }
  };

  const handleRemoveSelectedPhotos = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Remove ${selectedIds.size} photos from this album?`)) return;

    try {
      const res = await fetch(`/api/albums/${albumId}/photos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds: Array.from(selectedIds) }),
      });

      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => !selectedIds.has(p.id)));
        setSelectedIds(new Set());
      }
    } catch (e) {
      alert("Failed to remove photos from album.");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectGroup = (ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--color-accent)" }} />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-danger)" }}>
        {error || "Album not found"}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Back button */}
      <button
        onClick={() => router.push("/albums")}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--color-text-muted)",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          fontSize: "var(--text-sm)",
          cursor: "pointer",
          marginBottom: "1rem",
          padding: 0,
        }}
      >
        <ArrowLeft size={16} />
        <span>All Albums</span>
      </button>

      {/* Album Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ flex: 1, minWidth: "280px" }}>
          {isEditingTitle ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateTitle();
                  if (e.key === "Escape") setIsEditingTitle(false);
                }}
                autoFocus
                style={{
                  fontSize: "var(--text-2xl)",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-accent)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.25rem 0.5rem",
                  outline: "none",
                }}
              />
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <h1
                style={{
                  fontSize: "var(--text-2xl)",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                {album.name}
              </h1>
              <button
                onClick={() => setIsEditingTitle(true)}
                title="Rename album"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  padding: "0.25rem",
                }}
              >
                <Edit2 size={16} />
              </button>
            </div>
          )}

          {album.description && (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", margin: "0.375rem 0 0 0" }}>
              {album.description}
            </p>
          )}

          <p style={{ color: "var(--color-text-faint)", fontSize: "var(--text-xs)", margin: "0.25rem 0 0 0" }}>
            {photos.length} {photos.length === 1 ? "photo" : "photos"}
          </p>
        </div>

        {/* Header Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={() => setShareOpen(true)}
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>

          <button
            onClick={() => setSelectorOpen(true)}
            style={{
              background: "var(--color-accent)",
              border: "none",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <Plus size={16} />
            <span>Add Photos</span>
          </button>

          {photos.length > 0 && (
            <button
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                if (isSelectMode) setSelectedIds(new Set());
              }}
              style={{
                background: isSelectMode ? "var(--color-accent-dim)" : "var(--color-surface-2)",
                border: isSelectMode ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                color: isSelectMode ? "var(--color-accent)" : "var(--color-text-primary)",
                padding: "0.5rem 0.875rem",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-sm)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              {isSelectMode ? <CheckSquare size={16} /> : <Square size={16} />}
              <span>{isSelectMode ? "Done" : "Select"}</span>
            </button>
          )}

          <button
            onClick={handleDeleteAlbum}
            title="Delete album"
            style={{
              background: "transparent",
              border: "1px solid var(--color-border)",
              color: "var(--color-danger)",
              padding: "0.5rem",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Selected Action Bar */}
      {isSelectMode && selectedIds.size > 0 && (
        <div
          className="slide-up"
          style={{
            position: "sticky",
            top: "1rem",
            zIndex: 30,
            background: "var(--color-surface)",
            border: "1px solid var(--color-accent)",
            borderRadius: "var(--radius-lg)",
            padding: "0.75rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-primary)" }}>
            {selectedIds.size} selected
          </span>

          <button
            onClick={handleRemoveSelectedPhotos}
            style={{
              background: "var(--color-danger-dim)",
              border: "1px solid var(--color-danger)",
              color: "var(--color-danger)",
              padding: "0.375rem 0.75rem",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <FolderMinus size={14} />
            <span>Remove from Album</span>
          </button>
        </div>
      )}

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <EmptyState
          title="This album is empty"
          description="Click 'Add Photos' to select pictures from your library and organize them here."
          action={{
            label: "Add Photos",
            onClick: () => setSelectorOpen(true),
          }}
        />
      ) : (
        <PhotoGrid
          photos={photos}
          selectedIds={selectedIds}
          isSelectMode={isSelectMode}
          onToggleSelect={toggleSelect}
          onToggleSelectGroup={toggleSelectGroup}
          onPhotoClick={(p) => setActivePhotoId(p.id)}
        />
      )}

      {/* Photo Selector Modal */}
      <PhotoSelector
        isOpen={selectorOpen}
        albumId={albumId}
        existingPhotoIds={new Set(photos.map((p) => p.id))}
        onClose={() => setSelectorOpen(false)}
        onAdded={fetchAlbumData}
      />

      {/* Share Dialog */}
      <ShareDialog
        isOpen={shareOpen}
        targetType="album"
        targetId={albumId}
        title={album.name}
        onClose={() => setShareOpen(false)}
      />

      {/* Lightbox */}
      {activePhotoId && (
        <Lightbox
          photos={photos}
          currentId={activePhotoId}
          onClose={() => setActivePhotoId(null)}
          onDelete={(deletedId) => {
            setPhotos((prev) => prev.filter((p) => p.id !== deletedId));
          }}
        />
      )}
    </div>
  );
}
