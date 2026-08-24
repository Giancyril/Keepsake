import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar placeholder — will be a full component in Stage 9 UI pass */}
      <aside
        style={{
          width: "220px",
          flexShrink: 0,
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            marginBottom: "1.5rem",
            padding: "0 0.5rem",
          }}
        >
          <div
            style={{
              width: "1.75rem",
              height: "1.75rem",
              background: "linear-gradient(135deg, var(--color-accent), #7C3AED)",
              borderRadius: "0.375rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              color: "white",
              fontWeight: 700,
            }}
          >
            PV
          </div>
          <span
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            Photo Vault
          </span>
        </div>

        {[
          { href: "/library", label: "Library" },
          { href: "/albums", label: "Albums" },
          { href: "/search", label: "Search" },
        ].map(({ href, label }) => (
          <a
            key={href}
            href={href}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-muted)",
              textDecoration: "none",
              transition: "background var(--duration-fast), color var(--duration-fast)",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = "var(--color-surface-2)";
              (e.target as HTMLElement).style.color = "var(--color-text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = "transparent";
              (e.target as HTMLElement).style.color = "var(--color-text-muted)";
            }}
          >
            {label}
          </a>
        ))}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto" }}>{children}</main>
    </div>
  );
}
