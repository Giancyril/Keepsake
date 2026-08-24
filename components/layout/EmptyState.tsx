"use client";

import React from "react";
import { Image as ImageIcon, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon = ImageIcon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      style={{
        padding: "4rem 2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: "var(--color-surface)",
        border: "1px dashed var(--color-border)",
        borderRadius: "var(--radius-xl)",
      }}
    >
      <div
        style={{
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "var(--radius-full)",
          background: "var(--color-surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        <Icon size={24} style={{ color: "var(--color-text-muted)" }} />
      </div>

      <h3
        style={{
          fontSize: "var(--text-lg)",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          margin: 0,
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)",
          maxWidth: "400px",
          margin: 0,
          marginBottom: action ? "1.5rem" : 0,
        }}
      >
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: "0.625rem 1.25rem",
            background: "var(--color-accent)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background var(--duration-fast)",
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
