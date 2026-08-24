"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxNavProps {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function LightboxNav({ hasPrev, hasNext, onPrev, onNext }: LightboxNavProps) {
  const btnStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(20, 20, 22, 0.75)",
    backdropFilter: "blur(8px)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text-primary)",
    width: "3rem",
    height: "3rem",
    borderRadius: "var(--radius-full)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 55,
    transition: "all var(--duration-fast)",
  };

  return (
    <>
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          style={{ ...btnStyle, left: "1.5rem" }}
          title="Previous photo (←)"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          style={{ ...btnStyle, right: "1.5rem" }}
          title="Next photo (→)"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </>
  );
}
