"use client";

import React from "react";
import { useUpload } from "./UploadContext";
import { FileProgress } from "./FileProgress";
import { ChevronUp, ChevronDown, CheckCheck, UploadCloud } from "lucide-react";

export function UploadQueue() {
  const { queue, isOpen, setIsOpen, clearCompleted } = useUpload();

  if (queue.length === 0) return null;

  const total = queue.length;
  const completed = queue.filter((i) => i.status === "done").length;
  const errors = queue.filter((i) => i.status === "error").length;
  const inProgress = total - completed - errors;

  return (
    <div
      className="slide-up"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        width: "360px",
        maxWidth: "calc(100vw - 3rem)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
        zIndex: 50,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1rem",
          background: "var(--color-surface-2)",
          cursor: "pointer",
          borderBottom: isOpen ? "1px solid var(--color-border)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <UploadCloud size={18} style={{ color: "var(--color-accent)" }} />
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-primary)" }}>
            {inProgress > 0
              ? `Uploading ${inProgress} of ${total}...`
              : completed === total
              ? `All ${completed} uploads complete`
              : `${completed}/${total} uploaded (${errors} failed)`}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {completed > 0 && inProgress === 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearCompleted();
              }}
              title="Clear completed"
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
              <CheckCheck size={16} />
            </button>
          )}
          {isOpen ? <ChevronDown size={18} color="var(--color-text-muted)" /> : <ChevronUp size={18} color="var(--color-text-muted)" />}
        </div>
      </div>

      {/* Expanded list */}
      {isOpen && (
        <div
          style={{
            maxHeight: "260px",
            overflowY: "auto",
            padding: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {queue.map((item) => (
            <FileProgress key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
