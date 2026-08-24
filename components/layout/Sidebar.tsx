"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Image as ImageIcon,
  Folder,
  Search,
  LogOut,
  Shield,
  Globe,
  Star,
  Video,
  FileText,
  Maximize,
} from "lucide-react";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/library", label: "Library", icon: ImageIcon },
    { href: "/map", label: "Places & Map", icon: Globe },
    { href: "/albums", label: "Albums", icon: Folder },
    { href: "/search", label: "Search", icon: Search },
  ];

  const smartCollections = [
    { href: "/library?filter=favorites", label: "Favorites", icon: Star, color: "#F59E0B" },
    { href: "/library?filter=videos", label: "Videos", icon: Video, color: "#4F6EF7" },
    { href: "/library?filter=panoramas", label: "Panoramas", icon: Maximize, color: "#22C55E" },
    { href: "/library?filter=scans", label: "Scans & Docs", icon: FileText, color: "#EC4899" },
  ];

  return (
    <aside
      style={{
        width: "250px",
        flexShrink: 0,
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        padding: "1.5rem 1rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Brand Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0 0.5rem",
          }}
        >

          <div>
            <span
              style={{
                fontSize: "var(--text-base)",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                letterSpacing: "0.1em",
                display: "block",
                lineHeight: 1.1,
              }}
            >
              Keepsafe
            </span>
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--color-text-faint)",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                marginTop: "0.15rem",
              }}
            >
              <Shield size={10} style={{ color: "var(--color-success)" }} />
              Self-Hosted & Private
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/library" && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.625rem 0.875rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-sm)",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--color-text-primary)" : "var(--color-text-muted)",
                  background: isActive ? "var(--color-surface-2)" : "transparent",
                  border: isActive ? "1px solid var(--color-border)" : "1px solid transparent",
                  textDecoration: "none",
                  transition: "all var(--duration-fast)",
                }}
              >
                <Icon
                  size={18}
                  style={{
                    color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
                    transition: "color var(--duration-fast)",
                  }}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Smart Collections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-text-faint)",
              padding: "0 0.875rem",
              marginBottom: "0.25rem",
            }}
          >
            Collections
          </div>
          {smartCollections.map(({ href, label, icon: Icon, color }) => {
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.5rem 0.875rem",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                  transition: "all var(--duration-fast)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-surface-2)";
                  e.currentTarget.style.color = "var(--color-text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }}
              >
                <Icon size={16} style={{ color }} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          paddingTop: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
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
            {user.name || "Vault Owner"}
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
            {user.email}
          </span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
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
            transition: "color var(--duration-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-danger)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
