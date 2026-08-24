"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PhotoWithUrls } from "@/types/photo";
import { UploadZone } from "@/components/upload/UploadZone";
import { PhotoGrid } from "@/components/library/PhotoGrid";
import { SkeletonGrid } from "@/components/library/SkeletonGrid";
import { EmptyState } from "@/components/layout/EmptyState";
import { Lightbox } from "@/components/lightbox/Lightbox";
import { useUpload } from "@/components/upload/UploadContext";
import { CheckSquare, Square, Trash2, FolderPlus, Share2, RefreshCw, Star, Video, Maximize, FileText } from "lucide-react";
import { MemoriesCarousel } from "@/components/memories/MemoriesCarousel";

function LibraryContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter"); // favorites | videos | panoramas | scans | null

  const [photos, setPhotos] = useState<PhotoWithUrls[]>([]);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const { queue } = useUpload();

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const url = filter ? `/api/photos?limit=100&filter=${filter}` : "/api/photos?limit=100";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch photos");
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch (err: any) {
      setError(err.message || "Failed to load library");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // If any uploads complete in the queue, refresh library
  const completedUploadsCount = queue.filter((q) => q.status === "done").length;
  useEffect(() => {
    if (completedUploadsCount > 0) {
      fetchPhotos();
    }
  }, [completedUploadsCount, fetchPhotos]);

  // Polling interval if any photo in the library is in "processing" state
  const hasProcessingPhotos = photos.some((p) => p.status === "processing");
  useEffect(() => {
    if (!hasProcessingPhotos) return;

    const interval = setInterval(() => {
      fetchPhotos();
    }, 3000);

    return () => clearInterval(interval);
  }, [hasProcessingPhotos, fetchPhotos]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectGroup = (ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));

      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === photos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(photos.map((p) => p.id)));
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
  const getCollectionTitle = () => {
    switch (filter) {
      case "favorites":
        return { title: "Favorites", subtitle: "Photos and videos you've starred" };
      case "videos":
        return { title: "Videos & Motion", subtitle: "All recorded videos and motion clips" };
      case "panoramas":
        return { title: "Panoramas", subtitle: "Ultra-wide perspective captures" };
      case "scans":
        return { title: "Documents & Scans", subtitle: "Receipts, documents, and screenshots" };
      default:
        return { title: "Photos", subtitle: `${photos.length} ${photos.length === 1 ? "item" : "items"} in your vault` };
    }
  };

  const collectionInfo = getCollectionTitle();

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              color: "var(--color-text-primary)",
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: 0,
              marginBottom: "0.25rem",
            }}
          >
            {collectionInfo.title}
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
            {collectionInfo.subtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={fetchPhotos}
            title="Refresh library"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
              padding: "0.5rem",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <RefreshCw size={16} />
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
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              {isSelectMode ? <CheckSquare size={16} /> : <Square size={16} />}
              <span>{isSelectMode ? "Done Selecting" : "Select"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar when items selected */}
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
            boxShadow: "0 8px 20px -4px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-primary)" }}>
              {selectedIds.size} selected
            </span>
            <button
              onClick={handleSelectAll}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-accent)",
                cursor: "pointer",
                fontSize: "var(--text-xs)",
                fontWeight: 500,
              }}
            >
              {selectedIds.size === photos.length ? "Deselect all" : "Select all"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
              (Actions available in Albums &amp; Sharing tabs)
            </span>
          </div>
        </div>
      )}

      {/* Upload Zone (shown in standard library view) */}
      {!filter && (
        <section style={{ marginBottom: "2.5rem" }}>
          <UploadZone />
        </section>
      )}

      {/* Memories & Throwback Story Carousel (shown in standard library view) */}
      {!filter && <MemoriesCarousel onSelectPhoto={(id) => setActivePhotoId(id)} />}

      {/* Photo Library Grid */}
      <section>
        {loading ? (
          <SkeletonGrid count={24} />
        ) : error ? (
          <div style={{ color: "var(--color-danger)", textAlign: "center", padding: "2rem" }}>
            {error}
          </div>
        ) : photos.length === 0 ? (
          <EmptyState
            title={filter ? `No ${collectionInfo.title.toLowerCase()} found` : "Your vault is empty"}
            description={
              filter
                ? "Items matching this collection filter will appear here."
                : "Drag and drop photos or videos above to begin building your private library."
            }
          />
        ) : (
          <PhotoGrid
            photos={photos}
            selectedIds={selectedIds}
            isSelectMode={isSelectMode}
            onToggleSelect={toggleSelect}
            onToggleSelectGroup={toggleSelectGroup}
            onPhotoClick={(photo) => setActivePhotoId(photo.id)}
          />
        )}
      </section>

      {/* Lightbox Fullscreen View */}
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

export default function LibraryPage() {
  return (
    <Suspense fallback={<SkeletonGrid count={24} />}>
      <LibraryContent />
    </Suspense>
  );
}
