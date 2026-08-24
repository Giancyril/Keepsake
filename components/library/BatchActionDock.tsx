"use client";

import React, { useState } from "react";
import {
  Download,
  Star,
  FolderPlus,
  Trash2,
  X,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface BatchActionDockProps {
  selectedCount: number;
  selectedIds: string[];
  onClearSelection: () => void;
  onRefresh: () => void;
  onOpenAlbumSelector: () => void;
}

export function BatchActionDock({
  selectedCount,
  selectedIds,
  onClearSelection,
  onRefresh,
  onOpenAlbumSelector,
}: BatchActionDockProps) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  if (selectedCount === 0) return null;

  // Batch Download as ZIP
  const handleBatchDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/photos/batch/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds: selectedIds }),
      });

      if (!res.ok) throw new Error("Batch download failed");

      // Trigger browser download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `keepsake_export_${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error("Batch download error:", err);
      alert("Failed to download ZIP archive. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Batch Delete
  const handleBatchDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to permanently delete ${selectedCount} ${
          selectedCount === 1 ? "photo" : "photos"
        } from your vault?`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/photos/${id}`, { method: "DELETE" })
        )
      );
      onClearSelection();
      onRefresh();
    } catch (err) {
      console.error("Batch delete error:", err);
      alert("Failed to delete all selected photos.");
    } finally {
      setDeleting(false);
    }
  };

  // Batch Favorite
  const handleBatchFavorite = async () => {
    setFavoriting(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/photos/${id}/favorite`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isFavorite: true }),
          })
        )
      );
      onRefresh();
    } catch (err) {
      console.error("Batch favorite error:", err);
    } finally {
      setFavoriting(false);
    }
  };

  return (
    <div
      className="slide-up"
      style={{
        position: "fixed",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        background: "rgba(20, 20, 24, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "var(--radius-full)",
        padding: "0.5rem 0.75rem 0.5rem 1.25rem",
        boxShadow:
          "0 20px 40px -8px rgba(0,0,0,0.8), 0 0 0 1px rgba(79, 110, 247, 0.25)",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      {/* Selected Counter */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            fontSize: "0.8125rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          {selectedCount} selected
        </span>
      </div>

      <div style={{ height: "18px", width: "1px", background: "var(--color-border)" }} />

      {/* Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
        {/* Download ZIP */}
        <button
          onClick={handleBatchDownload}
          disabled={downloading}
          title="Download selected as ZIP archive"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.4rem 0.75rem",
            borderRadius: "var(--radius-full)",
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid transparent",
            color: "var(--color-text-primary)",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: downloading ? "not-allowed" : "pointer",
            transition: "all var(--duration-fast)",
          }}
        >
          {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          <span>{downloading ? "Zipping…" : "ZIP"}</span>
        </button>

        {/* Favorite All */}
        <button
          onClick={handleBatchFavorite}
          disabled={favoriting}
          title="Add all to Favorites"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.4rem 0.75rem",
            borderRadius: "var(--radius-full)",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            color: "#F59E0B",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: favoriting ? "not-allowed" : "pointer",
          }}
        >
          {favoriting ? <Loader2 size={13} className="animate-spin" /> : <Star size={13} fill="#F59E0B" />}
          <span>Favorite</span>
        </button>

        {/* Add to Album */}
        <button
          onClick={onOpenAlbumSelector}
          title="Add to Album"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.4rem 0.75rem",
            borderRadius: "var(--radius-full)",
            background: "rgba(79, 110, 247, 0.12)",
            border: "1px solid rgba(79, 110, 247, 0.25)",
            color: "var(--color-accent)",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <FolderPlus size={13} />
          <span>Album</span>
        </button>

        {/* Delete */}
        <button
          onClick={handleBatchDelete}
          disabled={deleting}
          title="Delete selected"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.4rem 0.75rem",
            borderRadius: "var(--radius-full)",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            color: "var(--color-danger)",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: deleting ? "not-allowed" : "pointer",
          }}
        >
          {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          <span>Delete</span>
        </button>
      </div>

      <div style={{ height: "18px", width: "1px", background: "var(--color-border)" }} />

      {/* Clear Selection */}
      <button
        onClick={onClearSelection}
        title="Deselect all"
        style={{
          background: "transparent",
          border: "none",
          color: "var(--color-text-muted)",
          cursor: "pointer",
          padding: "0.25rem",
          display: "flex",
          alignItems: "center",
          borderRadius: "var(--radius-full)",
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
