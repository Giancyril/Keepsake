"use client";

import React, { useState, useRef } from "react";
import { Disc } from "lucide-react";

interface LivePhotoViewerProps {
  photoUrl: string;
  videoUrl: string;
  alt: string;
}

export function LivePhotoViewer({ photoUrl, videoUrl, alt }: LivePhotoViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startMotion = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const stopMotion = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      onMouseDown={startMotion}
      onMouseUp={stopMotion}
      onTouchStart={startMotion}
      onTouchEnd={stopMotion}
      style={{
        position: "relative",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
      }}
    >
      {/* Still Frame */}
      <img
        src={photoUrl}
        alt={alt}
        style={{
          maxWidth: "100%",
          maxHeight: "calc(100vh - 120px)",
          objectFit: "contain",
          opacity: isPlaying ? 0 : 1,
          transition: "opacity 0.15s ease",
          display: "block",
        }}
      />

      {/* Paired Motion Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        playsInline
        muted={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          opacity: isPlaying ? 1 : 0,
          pointerEvents: "none",
          display: "block",
        }}
      />

      {/* Apple-style "LIVE" Badge */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          background: isPlaying ? "var(--color-accent)" : "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          padding: "0.25rem 0.5rem",
          borderRadius: "var(--radius-full)",
          color: "white",
          fontSize: "0.7rem",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          letterSpacing: "0.05em",
          transition: "all 0.2s ease",
        }}
      >
        <Disc size={12} className={isPlaying ? "animate-spin" : ""} />
        <span>LIVE</span>
      </div>
    </div>
  );
}
