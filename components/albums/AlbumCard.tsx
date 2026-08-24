"use client";

import React from "react";
import Link from "next/link";
import { Album } from "@/types/album";
import { Folder, Image as ImageIcon } from "lucide-react";

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link
      href={`/albums/${album.id}`}
      style={{
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "1 / 1",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          transition: "transform var(--duration-fast), border-color var(--duration-fast)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.02)";
          e.currentTarget.style.borderColor = "var(--color-accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.borderColor = "var(--color-border)";
        }}
      >
        {album.coverPhotoUrl ? (
          <img
            src={album.coverPhotoUrl}
            alt={album.name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-faint)",
            }}
          >
            <Folder size={48} strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div>
        <h3
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {album.name}
        </h3>
        <p
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
            margin: 0,
            marginTop: "0.125rem",
          }}
        >
          {album.photoCount ?? 0} {(album.photoCount ?? 0) === 1 ? "photo" : "photos"}
        </p>
      </div>
    </Link>
  );
}
