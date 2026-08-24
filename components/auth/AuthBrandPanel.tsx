import React from "react";
import Image from "next/image";
import { ShieldCheck, Share2, MapPin, Camera } from "lucide-react";

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
      }}
    >
      {/* ── Full-bleed photo: top 55% of the panel ── */}
      <div style={{ position: "relative", flex: "0 0 55%", minHeight: 0 }}>
        <Image
          src="/kyoto-japan.jpg"
          alt="Kyoto, Japan"
          fill
          sizes="(max-width: 1024px) 0px, 60vw"
          style={{ objectFit: "cover", objectPosition: "center 60%" }}
          priority
        />

        {/* Deep gradient scrim — fades photo into the dark panel background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.35) 60%, rgba(13,13,15,0.98) 100%)",
          }}
        />

        {/* GPS chip — overlaid bottom-left on the photo */}
        <span
          style={{
            position: "absolute",
            bottom: "1.25rem",
            left: "1.5rem",
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            padding: "0.25rem 0.625rem",
            borderRadius: "var(--radius-full)",
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <MapPin size={10} style={{ color: "var(--color-accent)" }} />
          Kyoto, Japan
        </span>
      </div>

      {/* ── Headline + single feature list: bottom 45% ── */}
      <div
        style={{
          flex: "1 1 auto",
          padding: "2rem 2.5rem 2.5rem",
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Ambient glow behind text */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "260px",
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(79, 110, 247, 0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            margin: "0 0 0.5rem 0",
          }}
        >
          Your memories. Your storage.
          <br />Your control.
        </h2>

        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-muted)",
            lineHeight: 1.55,
            margin: "0 0 1.375rem 0",
            maxWidth: "400px",
            letterSpacing: "-0.01em",
          }}
        >
          Keepsake is a private self-hosted vault — no third-party cloud, no data mining.
        </p>

        {/* Single, non-redundant feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {[
            {
              icon: ShieldCheck,
              title: "Private by default",
              desc: "Your files go directly to your own S3 bucket.",
            },
            {
              icon: Camera,
              title: "Full-fidelity originals",
              desc: "RAW, HEIC, JPEG — stored losslessly with full EXIF.",
            },
            {
              icon: Share2,
              title: "Revocable sharing",
              desc: "Expiring links you can revoke at any time.",
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
                  width: "1.625rem",
                  height: "1.625rem",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(79, 110, 247, 0.12)",
                  border: "1px solid rgba(79, 110, 247, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "0.1rem",
                }}
              >
                <Icon size={13} style={{ color: "var(--color-accent)" }} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    display: "block",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {title}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                    display: "block",
                    marginTop: "0.1rem",
                    lineHeight: 1.4,
                  }}
                >
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
