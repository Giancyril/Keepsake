"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PhotoWithUrls } from "@/types/photo";
import { isVideo } from "@/lib/utils";
import { ExifPanel } from "./ExifPanel";
import { LightboxNav } from "./LightboxNav";
import { ShareDialog } from "@/components/sharing/ShareDialog";
import { X, Info, Download, Trash2, Loader2, AlertCircle, Share2 } from "lucide-react";

interface LightboxProps {
  photos: PhotoWithUrls[];
  currentId: string | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export function Lightbox({ photos, currentId, onClose, onDelete }: LightboxProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const currentIndex = photos.findIndex((p) => p.id === currentId);
  const currentPhoto = currentIndex !== -1 ? photos[currentIndex] : null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      setImgLoaded(false);
      const prevPhoto = photos[currentIndex - 1];
      window.history.replaceState(null, "", `#photo=${prevPhoto.id}`);
    }
  }, [hasPrev, photos, currentIndex]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      setImgLoaded(false);
      const nextPhoto = photos[currentIndex + 1];
      window.history.replaceState(null, "", `#photo=${nextPhoto.id}`);
    }
  }, [hasNext, photos, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!currentPhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "i" || e.key === "I") setShowInfo((v) => !v);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPhoto, onClose, handlePrev, handleNext]);

  if (!currentPhoto) return null;

  const video = isVideo(currentPhoto.mimeType);
  const previewUrl = currentPhoto.thumbnailMdUrl || currentPhoto.originalUrl;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this photo from your vault?")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/photos/${currentPhoto.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete photo");

      onDelete?.(currentPhoto.id);
      if (photos.length <= 1) {
        onClose();
      } else if (hasNext) {
        handleNext();
      } else {
        handlePrev();
      }
    } catch (err) {
      alert("Failed to delete photo. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0, 0, 0, 0.95)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
          zIndex: 60,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
            {currentIndex + 1} of {photos.length}
          </span>
          <span style={{ color: "var(--color-text-faint)" }}>•</span>
          <span
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: "var(--color-text-primary)",
              maxWidth: "300px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {currentPhoto.filename}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Share photo */}
          <button
            onClick={() => setShareOpen(true)}
            title="Share photo"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid transparent",
              color: "white",
              padding: "0.5rem",
              borderRadius: "var(--radius-full)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Share2 size={18} />
          </button>

          {/* EXIF Info toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            title="Toggle Info (I)"
            style={{
              background: showInfo ? "var(--color-accent-dim)" : "rgba(255,255,255,0.1)",
              border: showInfo ? "1px solid var(--color-accent)" : "1px solid transparent",
              color: showInfo ? "var(--color-accent)" : "white",
              padding: "0.5rem",
              borderRadius: "var(--radius-full)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Info size={18} />
          </button>

          {/* Download Original */}
          {currentPhoto.originalUrl && (
            <a
              href={currentPhoto.originalUrl}
              download={currentPhoto.filename}
              target="_blank"
              rel="noopener noreferrer"
              title="Download original file"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid transparent",
                color: "white",
                padding: "0.5rem",
                borderRadius: "var(--radius-full)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Download size={18} />
            </a>
          )}

          {/* Delete Photo */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete photo"
            style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid var(--color-danger)",
              color: "var(--color-danger)",
              padding: "0.5rem",
              borderRadius: "var(--radius-full)",
              cursor: deleting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          </button>

          {/* Close Lightbox */}
          <button
            onClick={onClose}
            title="Close (Esc)"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid transparent",
              color: "white",
              padding: "0.5rem",
              borderRadius: "var(--radius-full)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              marginLeft: "0.5rem",
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>
        {/* Media Container */}
        <div
          onClick={onClose}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            position: "relative",
          }}
        >
          {video ? (
            <video
              src={currentPhoto.originalUrl || ""}
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "100%",
                maxHeight: "calc(100vh - 120px)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
              }}
            />
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {!imgLoaded && (
                <div style={{ position: "absolute" }}>
                  <Loader2 size={36} className="animate-spin" style={{ color: "var(--color-accent)" }} />
                </div>
              )}
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt={currentPhoto.filename}
                  onLoad={() => setImgLoaded(true)}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "calc(100vh - 120px)",
                    objectFit: "contain",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
                    opacity: imgLoaded ? 1 : 0,
                    transition: "opacity 200ms ease",
                  }}
                />
              )}
            </div>
          )}

          {/* Navigation Arrows */}
          <LightboxNav
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>

        {/* EXIF Information Sidebar */}
        <ExifPanel photo={currentPhoto} isOpen={showInfo} onClose={() => setShowInfo(false)} />
      </div>

      {/* Share Dialog */}
      <ShareDialog
        isOpen={shareOpen}
        targetType="photo"
        targetId={currentPhoto.id}
        title={currentPhoto.filename}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
