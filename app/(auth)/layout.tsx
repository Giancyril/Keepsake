import type { Metadata } from "next";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";

export const metadata: Metadata = {
  title: "Keepsake",
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
        background: "var(--color-bg)",
        position: "relative",
      }}
    >
      {/* Form Section: 42-45% width on desktop, 100% on mobile */}
      <div
        style={{
          flex: "1 1 auto",
          maxWidth: "580px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "3rem 3rem",
          background: "var(--color-bg)",
          position: "relative",
          zIndex: 10,
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "100%", maxWidth: "400px", margin: "auto 0" }}>
          {children}
        </div>

        {/* Footer — pinned to the bottom of the form column */}
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-faint)",
            marginTop: "auto",
            paddingTop: "1.5rem",
          }}
        >
          Keepsake • Private & Self-Hosted
        </div>
      </div>

      {/* Brand Visual Storytelling Panel: 55-58% width on desktop, hidden on mobile/tablet */}
      <div
        style={{
          flex: "1.3 1 0%",
          display: "flex",
        }}
        className="hidden lg:flex"
      >
        <AuthBrandPanel />
      </div>
    </div>
  );
}
