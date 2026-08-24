import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "var(--color-bg)",
        padding: "1.5rem",
      }}
    >
      {/* Background Depth Layer 1: Ambient Radial Gradients */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px",
          height: "500px",
          background:
            "radial-gradient(ellipse at center, rgba(79, 110, 247, 0.14) 0%, rgba(124, 58, 237, 0.06) 45%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "20%",
          width: "450px",
          height: "350px",
          background:
            "radial-gradient(circle at center, rgba(124, 58, 237, 0.05) 0%, transparent 65%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Background Depth Layer 2: Subtle Geometric Grid Texture with Radial Mask */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(circle at 50% 45%, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 45%, black 20%, transparent 75%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Auth Card Content */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "420px" }}>
        {children}
      </div>
    </div>
  );
}
