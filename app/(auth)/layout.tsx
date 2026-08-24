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
        background:
          "radial-gradient(ellipse at 60% 0%, rgba(79,110,247,0.12) 0%, transparent 60%), var(--color-bg)",
        padding: "1.5rem",
      }}
    >
      {children}
    </div>
  );
}
