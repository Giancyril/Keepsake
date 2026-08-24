"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search by filename, camera model, or keywords...",
}: SearchBarProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "600px",
      }}
    >
      <Search
        size={18}
        style={{
          position: "absolute",
          left: "1rem",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--color-text-faint)",
          pointerEvents: "none",
        }}
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "0.75rem 2.75rem 0.75rem 2.75rem",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          color: "var(--color-text-primary)",
          fontSize: "var(--text-sm)",
          outline: "none",
          transition: "border-color var(--duration-fast), box-shadow var(--duration-fast)",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--color-accent)";
          e.target.style.boxShadow = "0 0 0 3px var(--color-accent-dim)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--color-border)";
          e.target.style.boxShadow = "none";
        }}
      />

      {value && (
        <button
          onClick={() => onChange("")}
          title="Clear search"
          style={{
            position: "absolute",
            right: "0.875rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            color: "var(--color-text-muted)",
            cursor: "pointer",
            padding: "0.25rem",
            display: "flex",
            alignItems: "center",
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
