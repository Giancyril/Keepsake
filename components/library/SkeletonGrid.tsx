"use client";

import React from "react";

export function SkeletonGrid({ count = 18 }: { count?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "0.75rem",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            aspectRatio: "1 / 1",
            borderRadius: "var(--radius-md)",
          }}
        />
      ))}
    </div>
  );
}
