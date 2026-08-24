import type { Metadata } from "next";
import { UploadZone } from "@/components/upload/UploadZone";

export const metadata: Metadata = {
  title: "Library",
};

export default function LibraryPage() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            color: "var(--color-text-primary)",
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: 0,
            marginBottom: "0.5rem",
          }}
        >
          Photo Library
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Upload and organize your private photo and video collection.
        </p>
      </div>

      {/* Upload Zone */}
      <section style={{ marginBottom: "2.5rem" }}>
        <UploadZone />
      </section>

      {/* Library Grid Placeholder (Will be completed in Stage 4) */}
      <section>
        <div
          style={{
            padding: "3rem 1.5rem",
            background: "var(--color-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--color-text-muted)", margin: 0 }}>
            Uploaded photos will appear here grouped by timeline once processing pipeline (Stage 3) is connected.
          </p>
        </div>
      </section>
    </div>
  );
}
