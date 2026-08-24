import React from "react";
import { ShieldCheck, HardDrive, Share2, Sparkles, MapPin, Camera, Lock } from "lucide-react";

export function AuthBrandPanel() {
  return (
    <div
      style={{
        flex: 1,
        background: "linear-gradient(145deg, #131317 0%, #0A0A0C 100%)",
        borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "3.5rem 3rem",
      }}
    >
      {/* Ambient Radial Glow Layers */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "10%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(79, 110, 247, 0.18) 0%, rgba(124, 58, 237, 0.08) 40%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 65%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle Micro-Grid Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: "36px 36px",
          maskImage: "radial-gradient(circle at 60% 40%, black 30%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(circle at 60% 40%, black 30%, transparent 85%)",
          pointerEvents: "none",
        }}
      />

      {/* Top Section: Photo Library Floating Cards Mosaic */}
      <div style={{ position: "relative", zIndex: 10, marginBottom: "2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "1rem",
            transform: "perspective(1000px) rotateY(-4deg) rotateX(2deg)",
            transformOrigin: "left center",
          }}
        >
          {/* Card 1: Main Photo Preview with EXIF Tag */}
          <div
            style={{
              background: "rgba(24, 24, 28, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "var(--radius-lg)",
              padding: "1rem",
              boxShadow: "0 20px 40px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset",
              backdropFilter: "blur(16px)",
            }}
          >
            <div
              style={{
                height: "120px",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)",
                marginBottom: "0.75rem",
                display: "flex",
                alignItems: "flex-end",
                padding: "0.75rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.15), transparent 60%)",
                }}
              />
              <span
                style={{
                  background: "rgba(0, 0, 0, 0.65)",
                  backdropFilter: "blur(6px)",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <MapPin size={10} style={{ color: "var(--color-accent)" }} />
                Kyoto, Japan
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  IMG_4082_RAW.dng
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>
                  Sony A7IV • 48.2 MP • 45.8 MB
                </div>
              </div>
              <span
                style={{
                  background: "rgba(79, 110, 247, 0.15)",
                  color: "var(--color-accent)",
                  padding: "0.2rem 0.45rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                }}
              >
                RAW
              </span>
            </div>
          </div>

          {/* Card 2: Vault Status Badge Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {/* Sub-card A: Encryption */}
            <div
              style={{
                background: "rgba(24, 24, 28, 0.75)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "var(--radius-lg)",
                padding: "0.875rem",
                boxShadow: "0 15px 30px -10px rgba(0,0,0,0.5)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                <div
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(34, 197, 94, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Lock size={12} style={{ color: "var(--color-success)" }} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  Zero Third-Party Storage
                </span>
              </div>
              <p style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.3 }}>
                Direct browser-to-S3 pre-signed encrypted upload flow.
              </p>
            </div>

            {/* Sub-card B: Share link preview */}
            <div
              style={{
                background: "rgba(24, 24, 28, 0.75)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "var(--radius-lg)",
                padding: "0.875rem",
                boxShadow: "0 15px 30px -10px rgba(0,0,0,0.5)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                <div
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(79, 110, 247, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Share2 size={12} style={{ color: "var(--color-accent)" }} />
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  Revocable Sharing
                </span>
              </div>
              <p style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.3 }}>
                128-bit cryptographic tokens with custom expiration dates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Headline & Value Proposition */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            margin: "0 0 0.75rem 0",
          }}
        >
          Your memories, your storage, your control.
        </h2>

        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--color-text-muted)",
            lineHeight: 1.5,
            margin: "0 0 1.75rem 0",
            maxWidth: "460px",
            letterSpacing: "-0.01em",
          }}
        >
          A self-hosted private cloud vault engineered for total ownership of your high-resolution photos and videos.
        </p>

        {/* Feature Bullets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            {
              icon: ShieldCheck,
              title: "Private by default",
              desc: "Stored securely in your private AWS S3 bucket with no data mining.",
            },
            {
              icon: Camera,
              title: "Full-fidelity original preservation",
              desc: "Lossless RAW & HEIC support with complete EXIF and GPS extraction.",
            },
            {
              icon: Share2,
              title: "Granular link sharing",
              desc: "Instant expiring links and full owner revocation whenever you want.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "1.75rem",
                  height: "1.75rem",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(79, 110, 247, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "0.1rem",
                }}
              >
                <Icon size={14} style={{ color: "var(--color-accent)" }} />
              </div>
              <div>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)", display: "block" }}>
                  {title}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block", marginTop: "0.1rem" }}>
                  {desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
