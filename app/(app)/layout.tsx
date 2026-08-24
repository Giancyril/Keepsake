import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { UploadProvider } from "@/components/upload/UploadContext";
import { UploadQueue } from "@/components/upload/UploadQueue";
import Link from "next/link";
import { Image as ImageIcon, Folder, Search, LogOut } from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <UploadProvider>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <aside
          style={{
            width: "240px",
            flexShrink: 0,
            background: "var(--color-surface)",
            borderRight: "1px solid var(--color-border)",
            padding: "1.5rem 1rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "2rem",
                padding: "0 0.5rem",
              }}
            >
              <div
                style={{
                  width: "2rem",
                  height: "2rem",
                  background: "linear-gradient(135deg, var(--color-accent), #7C3AED)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  color: "white",
                  fontWeight: 700,
                }}
              >
                PV
              </div>
              <span
                style={{
                  fontSize: "var(--text-base)",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                Photo Vault
              </span>
            </div>

            {/* Navigation Links */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {[
                { href: "/library", label: "Library", icon: ImageIcon },
                { href: "/albums", label: "Albums", icon: Folder },
                { href: "/search", label: "Search", icon: Search },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 500,
                    color: "var(--color-text-muted)",
                    textDecoration: "none",
                    transition: "all var(--duration-fast)",
                  }}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* User profile / Logout */}
          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {session.user?.name || "Vault Owner"}
              </span>
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-faint)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {session.user?.email}
              </span>
            </div>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                title="Sign out"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  padding: "0.375rem",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, overflow: "auto", position: "relative" }}>
          {children}
        </main>

        {/* Global floating Upload Queue */}
        <UploadQueue />
      </div>
    </UploadProvider>
  );
}
