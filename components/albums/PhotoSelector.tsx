"use client";

import React, { useState, useEffect } from "react";
import { PhotoWithUrls } from "@/types/photo";
import { X, Check, Loader2, ImagePlus } from "lucide-react";

interface PhotoSelectorProps {
  isOpen: boolean;
  albumId: string;
  existingPhotoIds?: Set<string>;
  onClose: () => void;
  onAdded: () => void;
}

export function PhotoSelector({
  isOpen,
  albumId,
  existingPhotoIds = new Set(),
  onClose,
  onAdded,
}: PhotoSelectorProps) {
  const [photos, setPhotos] = useState<PhotoWithUrls[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadLibrary() {
      try {
        const res = await fetch("/api/photos?limit=100");
        const data = await res.json();
        setPhotos(data.photos || []);
      } catch (err) {
        console.error("Failed to load photos for selector", err);
      } finally {
        setLoading(false);
      }
    }

    loadLibrary();
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddPhotos = async () => {
    if (selectedIds.size === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/albums/${albumId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds: Array.from(selectedIds) }),
      });

      if (!res.ok) throw new Error("Failed to add photos");

      onAdded();
      onClose();
    } catch (err) {
      alert("Failed to add photos to album.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        className="slide-up"
        style={{
          width: "100%",
          maxWidth: "800px",
          maxHeight: "85vh",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
              Add Photos to Album
            </h2>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", margin: 0, marginTop: "0.25rem" }}>
              Select photos from your vault ({selectedIds.size} selected)
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              padding: "0.25rem",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Photo Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--color-accent)" }} />
            </div>
          ) : photos.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--color-text-muted)", padding: "2rem" }}>
              No photos in your vault yet.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: "0.625rem",
              }}
            >
              {photos.map((photo) => {
                const isSelected = selectedIds.has(photo.id);
                const isAlreadyInAlbum = existingPhotoIds.has(photo.id);
                const displayUrl = photo.thumbnailSmUrl || photo.thumbnailMdUrl || photo.originalUrl;

                return (
                  <div
                    key={photo.id}
                    onClick={() => {
                      if (!isAlreadyInAlbum) toggleSelect(photo.id);
                    }}
                    style={{
                      position: "relative",
                      aspectRatio: "1 / 1",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                      background: "var(--color-surface-2)",
                      cursor: isAlreadyInAlbum ? "not-allowed" : "pointer",
                      opacity: isAlreadyInAlbum ? 0.4 : 1,
                      outline: isSelected ? "3px solid var(--color-accent)" : "none",
                      outlineOffset: "-3px",
                    }}
                  >
                    {displayUrl && (
                      <img
                        src={displayUrl}
                        alt={photo.filename}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    )}

                    {/* Selection Indicator */}
                    <div
                      style={{
                        position: "absolute",
                        top: "0.375rem",
                        left: "0.375rem",
                        width: "1.25rem",
                        height: "1.25rem",
                        borderRadius: "var(--radius-full)",
                        background: isSelected ? "var(--color-accent)" : "rgba(0,0,0,0.5)",
                        border: isSelected ? "none" : "1.5px solid white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isSelected && <Check size={10} color="white" strokeWidth={3} />}
                    </div>

                    {isAlreadyInAlbum && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: "rgba(0,0,0,0.7)",
                          color: "white",
                          fontSize: "0.65rem",
                          textAlign: "center",
                          padding: "0.2rem",
                        }}
                      >
                        In album
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "0.75rem",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.625rem 1rem",
              background: "transparent",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text-muted)",
              fontSize: "var(--text-sm)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleAddPhotos}
            disabled={submitting || selectedIds.size === 0}
            style={{
              padding: "0.625rem 1.25rem",
              background: "var(--color-accent)",
              border: "none",
              borderRadius: "var(--radius-md)",
              color: "white",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              cursor: submitting || selectedIds.size === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            <span>Add {selectedIds.size > 0 ? `${selectedIds.size} Photos` : "Photos"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
