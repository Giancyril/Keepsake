"use client";

import React from "react";
import { UploadItem, useUpload } from "./UploadContext";
import { formatBytes } from "@/lib/utils";
import { CheckCircle2, AlertCircle, RefreshCw, X, FileImage, FileVideo, Loader2 } from "lucide-react";

export function FileProgress({ item }: { item: UploadItem }) {
  const { retryUpload, cancelUpload } = useUpload();
  const isVideo = item.file.type.startsWith("video/");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
        padding: "0.625rem 0.75rem",
        background: "var(--color-surface-2)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        fontSize: "var(--text-xs)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
          {isVideo ? (
            <FileVideo size={16} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
          ) : (
            <FileImage size={16} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
          )}
          <span
            style={{
              fontWeight: 500,
              color: "var(--color-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={item.file.name}
          >
            {item.file.name}
          </span>
          <span style={{ color: "var(--color-text-faint)", flexShrink: 0 }}>
            {formatBytes(item.file.size)}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>
          {item.status === "done" && (
            <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} />
          )}
          {item.status === "error" && (
            <>
              <button
                onClick={() => retryUpload(item.id)}
                title="Retry upload"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-accent)",
                  cursor: "pointer",
                  padding: "0.125rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <RefreshCw size={14} />
              </button>
              <AlertCircle size={16} style={{ color: "var(--color-danger)" }} />
            </>
          )}
          {(item.status === "uploading" || item.status === "presigning" || item.status === "confirming") && (
            <>
              <Loader2 size={14} className="animate-spin" style={{ color: "var(--color-accent)" }} />
              <button
                onClick={() => cancelUpload(item.id)}
                title="Cancel upload"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  padding: "0.125rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {item.status !== "done" && item.status !== "error" && (
        <div
          style={{
            width: "100%",
            height: "4px",
            background: "var(--color-surface-3)",
            borderRadius: "var(--radius-full)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${item.progress}%`,
              height: "100%",
              background: "var(--color-accent)",
              transition: "width 200ms ease",
            }}
          />
        </div>
      )}

      {/* Error detail */}
      {item.status === "error" && item.error && (
        <span style={{ color: "var(--color-danger)", fontSize: "0.7rem" }}>
          {item.error}
        </span>
      )}
    </div>
  );
}
