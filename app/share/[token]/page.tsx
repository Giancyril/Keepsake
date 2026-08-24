"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PhotoWithUrls } from "@/types/photo";
import { PhotoGrid } from "@/components/library/PhotoGrid";
import { Lightbox } from "@/components/lightbox/Lightbox";
import { SkeletonGrid } from "@/components/library/SkeletonGrid";
import { Camera, Calendar, ShieldCheck, AlertCircle, Clock } from "lucide-react";
import { formatDateGroup } from "@/lib/utils";

export default function PublicSharePage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);

  useEffect(() => {
    async function resolveShare() {
      try {
        const res = await fetch(`/api/shares/${token}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to load share");
        }

        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    resolveShare();
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-bg)", padding: "3rem 1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        <SkeletonGrid count={12} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "400px",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "2.5rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "3rem",
              height: "3rem",
              borderRadius: "var(--radius-full)",
              background: "var(--color-danger-dim)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <AlertCircle size={24} style={{ color: "var(--color-danger)" }} />
          </div>
          <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0, marginBottom: "0.5rem" }}>
            Link Unavailable
          </h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0 }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  const isAlbum = data?.targetType === "album";
  const album = data?.album;
  const photos: PhotoWithUrls[] = isAlbum ? data?.photos || [] : [data?.photo];

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", padding: "2rem 1.5rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Top Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid var(--color-border)",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "2rem",
              height: "2rem",
              background: "linear-gradient(135deg, var(--color-accent), #7C3AED)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <Camera size={16} />
          </div>
          <div>
            <h1 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
              {isAlbum ? album.name : data.photo.filename}
            </h1>
            {isAlbum && album.description && (
              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", margin: 0, marginTop: "0.125rem" }}>
                {album.description}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
          <ShieldCheck size={14} style={{ color: "var(--color-success)" }} />
          <span>Shared securely via Photo Vault</span>
        </div>
      </header>

      {/* Media Grid / Single View */}
      {isAlbum ? (
        <PhotoGrid photos={photos} onPhotoClick={(p) => setActivePhotoId(p.id)} />
      ) : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={data.photo.thumbnailMdUrl || data.photo.originalUrl}
            alt={data.photo.filename}
            onClick={() => setActivePhotoId(data.photo.id)}
            style={{
              maxWidth: "100%",
              maxHeight: "75vh",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              cursor: "pointer",
            }}
          />
        </div>
      )}

      {/* Lightbox for public viewers */}
      {activePhotoId && (
        <Lightbox
          photos={photos}
          currentId={activePhotoId}
          onClose={() => setActivePhotoId(null)}
        />
      )}
    </div>
  );
}
