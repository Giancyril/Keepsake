"use client";

import React, { useState } from "react";
import { ShareTargetType } from "@/types/share";
import { X, Copy, Check, Link as LinkIcon, Loader2, Clock, ShieldAlert } from "lucide-react";

interface ShareDialogProps {
  isOpen: boolean;
  targetType: ShareTargetType;
  targetId: string;
  title: string;
  onClose: () => void;
}

export function ShareDialog({
  isOpen,
  targetType,
  targetId,
  title,
  onClose,
}: ShareDialogProps) {
  const [expiresInDays, setExpiresInDays] = useState<number | null>(30);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateShare = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          expiresInDays: expiresInDays ?? undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create share link");
      }

      const data = await res.json();
      setShareUrl(data.share?.shareUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        className="slide-up"
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: "1.75rem",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <LinkIcon size={18} style={{ color: "var(--color-accent)" }} />
            <h2 style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
              Share {targetType === "album" ? "Album" : "Photo"}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              padding: "0.25rem",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", margin: 0, marginBottom: "1.25rem" }}>
          Generating link for <strong style={{ color: "var(--color-text-primary)" }}>{title}</strong>. Anyone with this link can view this content without logging in.
        </p>

        {error && (
          <div
            style={{
              padding: "0.625rem",
              background: "var(--color-danger-dim)",
              border: "1px solid var(--color-danger)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-danger)",
              fontSize: "var(--text-xs)",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        {!shareUrl ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
                <Clock size={14} />
                <span>Link Expiration</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                {[
                  { label: "1 Day", val: 1 },
                  { label: "7 Days", val: 7 },
                  { label: "30 Days", val: 30 },
                  { label: "Never", val: null },
                ].map(({ label, val }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setExpiresInDays(val)}
                    style={{
                      padding: "0.5rem 0.25rem",
                      background: expiresInDays === val ? "var(--color-accent)" : "var(--color-surface-2)",
                      border: expiresInDays === val ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                      color: expiresInDays === val ? "white" : "var(--color-text-muted)",
                      borderRadius: "var(--radius-md)",
                      fontSize: "var(--text-xs)",
                      fontWeight: 500,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "0.625rem 1rem",
                  background: "transparent",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text-muted)",
                  fontSize: "var(--text-sm)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateShare}
                disabled={loading}
                style={{
                  padding: "0.625rem 1.25rem",
                  background: "var(--color-accent)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  color: "white",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                <span>Generate Link</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.75rem",
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <input
                type="text"
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-primary)",
                  fontSize: "var(--text-xs)",
                  outline: "none",
                }}
              />
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? "var(--color-success)" : "var(--color-accent)",
                  border: "none",
                  color: "white",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  transition: "background var(--duration-fast)",
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <button
                onClick={onClose}
                style={{
                  padding: "0.5rem 1rem",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text-primary)",
                  fontSize: "var(--text-sm)",
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
