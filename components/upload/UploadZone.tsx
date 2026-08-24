"use client";

import React from "react";
import { useDropzone } from "react-dropzone";
import { useUpload } from "./UploadContext";
import { Upload, MapPin, X, Info, ShieldCheck } from "lucide-react";

export function UploadZone() {
  const {
    addFiles,
    hasGpsDisclosure,
    dismissGpsDisclosure,
    stripGpsOnUpload,
    setStripGpsOnUpload,
  } = useUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        addFiles(acceptedFiles);
      }
    },
    multiple: true,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      {/* GPS Privacy Disclosure Banner */}
      {hasGpsDisclosure && (
        <div
          className="banner-in"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "0.875rem 1rem",
            background: "rgba(79, 110, 247, 0.08)",
            border: "1px solid rgba(79, 110, 247, 0.25)",
            borderRadius: "var(--radius-lg)",
            fontSize: "var(--text-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <MapPin size={18} style={{ color: "var(--color-accent)", marginTop: "0.125rem", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                Location & EXIF Privacy Notice
              </div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", lineHeight: 1.4 }}>
                Photos with embedded GPS coordinates will have their location preserved privately in your vault for mapping and search. This data is never shared publicly unless you create an explicit share link.
              </div>
              <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.375rem", cursor: "pointer", color: "var(--color-text-primary)", fontSize: "0.8125rem" }}>
                  <input
                    type="checkbox"
                    checked={stripGpsOnUpload}
                    onChange={(e) => setStripGpsOnUpload(e.target.checked)}
                    style={{ accentColor: "var(--color-accent)", cursor: "pointer" }}
                  />
                  <span>Strip GPS coordinates before saving</span>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={dismissGpsDisclosure}
            title="Dismiss notice"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              padding: "0.25rem",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Drag & Drop Target */}
      <div
        {...getRootProps()}
        style={{
          border: isDragActive
            ? "2px dashed var(--color-accent)"
            : "2px dashed var(--color-border)",
          background: isDragActive
            ? "var(--color-accent-dim)"
            : "var(--color-surface)",
          borderRadius: "var(--radius-xl)",
          padding: "2.5rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all var(--duration-fast) var(--ease-default)",
          textAlign: "center",
        }}
      >
        <input {...getInputProps()} />

        <div
          style={{
            width: "3.5rem",
            height: "3.5rem",
            background: isDragActive ? "var(--color-accent)" : "var(--color-surface-2)",
            borderRadius: "var(--radius-full)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
            transition: "all var(--duration-fast)",
          }}
        >
          <Upload
            size={24}
            color={isDragActive ? "white" : "var(--color-accent)"}
          />
        </div>

        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600, color: "var(--color-text-primary)", margin: 0, marginBottom: "0.375rem" }}>
          {isDragActive ? "Drop your photos here" : "Drag and drop photos or videos"}
        </h3>

        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0, marginBottom: "1rem" }}>
          or browse files from your device
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-faint)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <ShieldCheck size={14} /> Direct S3 encrypted upload
          </span>
          <span>•</span>
          <span>JPEG, PNG, HEIC, WebP, MP4, MOV (up to 500MB)</span>
        </div>
      </div>
    </div>
  );
}
