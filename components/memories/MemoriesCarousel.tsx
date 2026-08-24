"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Calendar, ChevronRight, Image as ImageIcon } from "lucide-react";
import { MemoryCapsule } from "@/lib/memories/engine";

interface MemoriesCarouselProps {
  onSelectPhoto: (photoId: string) => void;
}

export function MemoriesCarousel({ onSelectPhoto }: MemoriesCarouselProps) {
  const [memories, setMemories] = useState<MemoryCapsule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMemories() {
      try {
        const res = await fetch("/api/memories");
        if (!res.ok) return;
        const data = await res.json();
        setMemories(data.memories || []);
      } catch (err) {
        console.warn("Memories load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMemories();
  }, []);

  if (loading || memories.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
        <Sparkles size={18} style={{ color: "#F59E0B" }} />
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Memories &amp; Throwbacks
        </h2>
        <span
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
            background: "var(--color-surface-2)",
            padding: "0.15rem 0.5rem",
            borderRadius: "var(--radius-full)",
            fontWeight: 600,
          }}
        >
          On This Day
        </span>
      </div>

      {/* Horizontal Story Cards Carousel */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
          scrollbarWidth: "thin",
        }}
      >
        {memories.map((mem) => (
          <div
            key={mem.id}
            onClick={() => mem.photoIds[0] && onSelectPhoto(mem.photoIds[0])}
            style={{
              flex: "0 0 240px",
              height: "160px",
              borderRadius: "var(--radius-lg)",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.5)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 12px 30px -4px rgba(79, 110, 247, 0.35), 0 0 0 1px var(--color-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 24px -4px rgba(0, 0, 0, 0.5)";
            }}
          >
            {/* Background Cover Image */}
            {mem.coverPhotoUrl ? (
              <img
                src={mem.coverPhotoUrl}
                alt={mem.title}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ImageIcon size={32} style={{ color: "rgba(255, 255, 255, 0.4)" }} />
              </div>
            )}

            {/* Gradient Scrim */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.1) 100%)",
              }}
            />

            {/* Top Pill: Year tag */}
            <div
              style={{
                position: "absolute",
                top: "0.75rem",
                left: "0.75rem",
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(6px)",
                padding: "0.2rem 0.5rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#F59E0B",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                border: "1px solid rgba(245, 158, 11, 0.3)",
              }}
            >
              <Calendar size={10} />
              {mem.dateStr}
            </div>

            {/* Bottom Content */}
            <div
              style={{
                position: "absolute",
                bottom: "0.75rem",
                left: "0.75rem",
                right: "0.75rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                }}
              >
                {mem.title}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255, 255, 255, 0.75)",
                  marginTop: "0.2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{mem.subtitle}</span>
                <ChevronRight size={14} style={{ color: "var(--color-accent)" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
