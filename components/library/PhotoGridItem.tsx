"use client";

import React, { useState } from "react";
import { PhotoWithUrls } from "@/types/photo";
import { isVideo } from "@/lib/utils";
import { Check, Loader2, AlertCircle, Play } from "lucide-react";

interface PhotoGridItemProps {
  photo: PhotoWithUrls;
  isSelected?: boolean;
  isSelectMode?: boolean;
  onSelect?: (id: string) => void;
  onClick?: (photo: PhotoWithUrls) => void;
}

export function PhotoGridItem({
  photo,
  isSelected,
  isSelectMode,
  onSelect,
  onClick,
}: PhotoGridItemProps) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const video = isVideo(photo.mimeType);

  const displayUrl = photo.thumbnailSmUrl || photo.thumbnailMdUrl || photo.originalUrl;

  const handleClick = (e: React.MouseEvent) => {
    if (isSelectMode && onSelect) {
      e.stopPropagation();
      onSelect(photo.id);
    } else if (onClick) {
      onClick(photo);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) onSelect(photo.id);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        background: "var(--color-surface-2)",
        cursor: "pointer",
        outline: isSelected ? "3px solid var(--color-accent)" : "none",
        outlineOffset: "-3px",
        transform: hovered ? "scale(1.02)" : "scale(1)",
        transition: "transform var(--duration-fast) var(--ease-default), outline var(--duration-fast)",
      }}
    >
      {/* Loading Skeleton until image loads */}
      {!loaded && photo.status !== "error" && (
        <div
          className="skeleton"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
          }}
        />
      )}

      {/* Image / Thumbnail */}
      {displayUrl && photo.status !== "error" && (
        <img
          src={displayUrl}
          alt={photo.filename}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: loaded ? 1 : 0,
            transition: "opacity var(--duration-normal) var(--ease-default)",
          }}
        />
      )}

      {/* Processing Status Badge */}
      {photo.status === "processing" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(20, 20, 22, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.375rem",
            zIndex: 5,
          }}
        >
          <Loader2 size={20} className="animate-spin" style={{ color: "var(--color-accent)" }} />
          <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Processing...</span>
        </div>
      )}

      {/* Error Badge */}
      {photo.status === "error" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--color-danger-dim)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.375rem",
            zIndex: 5,
          }}
        >
          <AlertCircle size={20} style={{ color: "var(--color-danger)" }} />
          <span style={{ fontSize: "0.7rem", color: "var(--color-danger)" }}>Processing error</span>
        </div>
      )}

      {/* Video Indicator */}
      {video && (
        <div
          style={{
            position: "absolute",
            bottom: "0.5rem",
            right: "0.5rem",
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            borderRadius: "var(--radius-sm)",
            padding: "0.2rem 0.375rem",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            color: "white",
            fontSize: "0.7rem",
            fontWeight: 500,
            zIndex: 4,
          }}
        >
          <Play size={10} fill="white" />
          <span>Video</span>
        </div>
      )}

      {/* Selection Checkbox */}
      {(isSelectMode || hovered || isSelected) && (
        <div
          onClick={handleCheckboxClick}
          style={{
            position: "absolute",
            top: "0.5rem",
            left: "0.5rem",
            width: "1.5rem",
            height: "1.5rem",
            borderRadius: "var(--radius-full)",
            background: isSelected ? "var(--color-accent)" : "rgba(0, 0, 0, 0.5)",
            border: isSelected ? "none" : "2px solid white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            transition: "all var(--duration-fast)",
          }}
        >
          {isSelected && <Check size={12} color="white" strokeWidth={3} />}
        </div>
      )}
    </div>
  );
}
