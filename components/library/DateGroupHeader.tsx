"use client";

import React from "react";
import { formatDateGroup } from "@/lib/utils";
import { Calendar, CheckSquare, Square } from "lucide-react";

interface DateGroupHeaderProps {
  dateStr: string;
  count: number;
  isSelectMode?: boolean;
  isAllSelected?: boolean;
  onToggleSelectAll?: () => void;
}

export function DateGroupHeader({
  dateStr,
  count,
  isSelectMode,
  isAllSelected,
  onToggleSelectAll,
}: DateGroupHeaderProps) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(10, 10, 11, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "0.75rem 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--color-border)",
        marginBottom: "0.75rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Calendar size={16} style={{ color: "var(--color-accent)" }} />
        <h2
          style={{
            fontSize: "var(--text-base)",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          {formatDateGroup(dateStr)}
        </h2>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
          ({count} {count === 1 ? "item" : "items"})
        </span>
      </div>

      {isSelectMode && onToggleSelectAll && (
        <button
          onClick={onToggleSelectAll}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            fontSize: "var(--text-xs)",
            padding: "0.25rem 0.5rem",
            borderRadius: "var(--radius-sm)",
          }}
        >
          {isAllSelected ? (
            <CheckSquare size={14} style={{ color: "var(--color-accent)" }} />
          ) : (
            <Square size={14} />
          )}
          <span>Select day</span>
        </button>
      )}
    </div>
  );
}
