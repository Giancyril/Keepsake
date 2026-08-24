"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Album } from "@/types/album";
import { AlbumCard } from "@/components/albums/AlbumCard";
import { AlbumCreateDialog } from "@/components/albums/AlbumCreateDialog";
import { EmptyState } from "@/components/layout/EmptyState";
import { Plus, FolderPlus, Loader2 } from "lucide-react";

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchAlbums = useCallback(async () => {
    try {
      const res = await fetch("/api/albums");
      if (!res.ok) throw new Error("Failed to fetch albums");
      const data = await res.json();
      setAlbums(data.albums || []);
    } catch (err: any) {
      setError(err.message || "Failed to load albums");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
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
            Albums
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
            Curate and organize your favorite memories
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          style={{
            background: "var(--color-accent)",
            border: "none",
            color: "white",
            padding: "0.625rem 1.25rem",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            transition: "background var(--duration-fast)",
          }}
        >
          <Plus size={18} />
          <span>New Album</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--color-accent)" }} />
        </div>
      ) : error ? (
        <div style={{ color: "var(--color-danger)", textAlign: "center", padding: "2rem" }}>
          {error}
        </div>
      ) : albums.length === 0 ? (
        <EmptyState
          icon={FolderPlus}
          title="No albums yet"
          description="Create your first album to start grouping photos by events, trips, or projects."
          action={{
            label: "Create Album",
            onClick: () => setCreateOpen(true),
          }}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <AlbumCreateDialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchAlbums}
      />
    </div>
  );
}
