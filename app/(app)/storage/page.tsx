"use client";

import React, { useEffect, useState } from "react";
import {
  HardDrive,
  Camera,
  Layers,
  Sparkles,
  Loader2,
  Trash2,
  CheckCircle,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface StorageAnalyticsData {
  summary: {
    totalPhotos: number;
    totalBytes: number;
    formattedTotalBytes: string;
  };
  formats: {
    label: string;
    count: number;
    bytes: number;
    formatted: string;
    color: string;
  }[];
  cameras: {
    device: string;
    count: number;
  }[];
}

interface DuplicatesData {
  duplicates: {
    groupKey: string;
    filename: string;
    fileSize: number;
    count: number;
    wastedBytes: number;
    photoIds: string[];
  }[];
  totalDuplicatesCount: number;
  totalWastedBytes: number;
}

export default function StorageAnalyticsPage() {
  const [data, setData] = useState<StorageAnalyticsData | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicatesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [storageRes, dedupRes] = await Promise.all([
          fetch("/api/analytics/storage"),
          fetch("/api/photos/duplicates"),
        ]);

        if (storageRes.ok) {
          const sJson = await storageRes.json();
          setData(sJson);
        }

        if (dedupRes.ok) {
          const dJson = await dedupRes.json();
          setDuplicates(dJson);
        }
      } catch (err) {
        console.error("Storage analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
          gap: "1rem",
        }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--color-accent)" }} />
        <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
          Analyzing Vault Storage…
        </span>
      </div>
    );
  }

  const totalBytes = data?.summary.totalBytes || 1;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Title */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: "0 0 0.35rem 0",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <HardDrive size={24} style={{ color: "var(--color-accent)" }} />
          Vault Storage &amp; Health
        </h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0 }}>
          Live breakdown of your self-hosted private S3 bucket storage
        </p>
      </div>

      {/* Main Storage Overview Card */}
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "1.75rem",
          marginBottom: "2rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", display: "block" }}>
              Total Storage Used
            </span>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}>
              {data?.summary.formattedTotalBytes}
            </span>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", display: "block" }}>
              Total Vault Files
            </span>
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              {data?.summary.totalPhotos} items
            </span>
          </div>
        </div>

        {/* Multi-color Storage Bar */}
        <div
          style={{
            height: "12px",
            borderRadius: "var(--radius-full)",
            background: "var(--color-surface-2)",
            overflow: "hidden",
            display: "flex",
            marginBottom: "1.5rem",
          }}
        >
          {data?.formats.map((fmt) => {
            const pct = Math.max((fmt.bytes / totalBytes) * 100, 0);
            if (pct === 0) return null;
            return (
              <div
                key={fmt.label}
                title={`${fmt.label}: ${fmt.formatted} (${pct.toFixed(1)}%)`}
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: fmt.color,
                }}
              />
            );
          })}
        </div>

        {/* Formats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          {data?.formats.map((fmt) => (
            <div
              key={fmt.label}
              style={{
                background: "var(--color-surface-2)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: fmt.color }} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  {fmt.label}
                </span>
              </div>
              <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                {fmt.formatted}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>
                {fmt.count} {fmt.count === 1 ? "file" : "files"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Gear & Deduplication */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {/* Camera Gear Breakdown */}
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Camera size={18} style={{ color: "var(--color-accent)" }} />
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
              Top Cameras &amp; Devices
            </h2>
          </div>

          {data?.cameras && data.cameras.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {data.cameras.map((c) => (
                <div
                  key={c.device}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "0.5rem",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <span style={{ fontSize: "0.875rem", color: "var(--color-text-primary)", fontWeight: 500 }}>
                    {c.device}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--color-accent)",
                      background: "var(--color-accent-dim)",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    {c.count} {c.count === 1 ? "photo" : "photos"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              No camera metadata extracted yet.
            </p>
          )}
        </div>

        {/* Deduplication Health Inspector */}
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <ShieldCheck size={18} style={{ color: "var(--color-success)" }} />
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
              Deduplication &amp; Storage Health
            </h2>
          </div>

          {duplicates && duplicates.totalDuplicatesCount > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem",
                }}
              >
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#F87171" }}>
                  {duplicates.totalDuplicatesCount} duplicate files detected
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                  Cleaning duplicates would recover ~{formatBytes(duplicates.totalWastedBytes)} of S3 storage.
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {duplicates.duplicates.slice(0, 4).map((d) => (
                  <div
                    key={d.groupKey}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.8125rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>
                      {d.filename}
                    </span>
                    <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>
                      {d.count} copies
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 0" }}>
              <CheckCircle size={24} style={{ color: "var(--color-success)" }} />
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  Zero Duplicate Files
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>
                  Your vault is fully deduplicated and optimized.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
