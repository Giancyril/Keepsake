import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Library",
};

// This will be populated in Stage 4 (Library view)
export default function LibraryPage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1 style={{ color: "var(--color-text-primary)", fontSize: "var(--text-2xl)", fontWeight: 700 }}>
        Your Library
      </h1>
      <p style={{ color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
        Library view coming in Stage 4. Upload pipeline first.
      </p>
    </main>
  );
}
