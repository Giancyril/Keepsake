"use client";

import React from "react";
import { PhotoWithUrls } from "@/types/photo";
import { formatBytes, formatDateGroup } from "@/lib/utils";
import { Camera, Calendar, HardDrive, MapPin, Maximize2, ExternalLink } from "lucide-react";

interface ExifPanelProps {
  photo: PhotoWithUrls;
  isOpen: boolean;
  onClose: () => void;
}

export function ExifPanel({ photo, isOpen }: ExifPanelProps) {
  if (!isOpen) return null;

  const hasGps = photo.gpsLat && photo.gpsLng;
  const mapsUrl = hasGps
    ? `https://www.google.com/maps/search/?api=1&query=${photo.gpsLat},${photo.gpsLng}`
    : null;

  return (
    <div
      style={{
        width: "320px",
        height: "100%",
        background: "var(--color-surface)",
        borderLeft: "1px solid var(--color-border)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        overflowY: "auto",
        zIndex: 60,
      }}
    >
      <div>
        <h3
          style={{
            fontSize: "var(--text-base)",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            margin: 0,
            marginBottom: "0.25rem",
            wordBreak: "break-all",
          }}
        >
          {photo.filename}
        </h3>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
          {photo.mimeType}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Taken Date */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          <Calendar size={18} style={{ color: "var(--color-accent)", marginTop: "0.125rem", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>Date Taken</div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)", fontWeight: 500 }}>
              {photo.takenAt ? formatDateGroup(photo.takenAt) : formatDateGroup(photo.uploadedAt)}
            </div>
            {photo.takenAt && (
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-faint)" }}>
                {new Date(photo.takenAt).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Camera Info */}
        {photo.cameraInfo && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <Camera size={18} style={{ color: "var(--color-accent)", marginTop: "0.125rem", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>Camera / Device</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)", fontWeight: 500 }}>
                {photo.cameraInfo}
              </div>
            </div>
          </div>
        )}

        {/* Dimensions & Resolution */}
        {photo.width && photo.height && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <Maximize2 size={18} style={{ color: "var(--color-accent)", marginTop: "0.125rem", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>Dimensions</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)", fontWeight: 500 }}>
                {photo.width} × {photo.height} px
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-faint)" }}>
                {((photo.width * photo.height) / 1_000_000).toFixed(1)} MP
              </div>
            </div>
          </div>
        )}

        {/* File Size */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          <HardDrive size={18} style={{ color: "var(--color-accent)", marginTop: "0.125rem", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>File Size</div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)", fontWeight: 500 }}>
              {formatBytes(photo.fileSize)}
            </div>
          </div>
        </div>

        {/* GPS Location */}
        {hasGps && mapsUrl && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <MapPin size={18} style={{ color: "var(--color-accent)", marginTop: "0.125rem", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>Location (GPS)</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)", fontWeight: 500 }}>
                {Number(photo.gpsLat).toFixed(4)}°, {Number(photo.gpsLng).toFixed(4)}°
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  fontSize: "0.75rem",
                  color: "var(--color-accent)",
                  textDecoration: "none",
                  marginTop: "0.25rem",
                }}
              >
                <span>View on map</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
