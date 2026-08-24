"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  FastForward,
} from "lucide-react";
import { formatVideoDuration } from "@/lib/video/metadata";

interface VaultVideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
}

export function VaultVideoPlayer({ src, poster, autoPlay = true }: VaultVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.5, 2.0, 0.5];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
      setPlaybackRate(nextSpeed);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={{
        position: "relative",
        maxWidth: "100%",
        maxHeight: "calc(100vh - 120px)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 24px 60px rgba(0,0,0,0.85)",
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        style={{
          maxWidth: "100%",
          maxHeight: "calc(100vh - 120px)",
          display: "block",
          cursor: "pointer",
        }}
      />

      {/* Floating Bottom Control Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "1.25rem 1.25rem 0.75rem",
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.2s ease",
          pointerEvents: showControls ? "auto" : "none",
        }}
      >
        {/* Scrubber Progress Bar */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          style={{
            width: "100%",
            height: "4px",
            accentColor: "var(--color-accent)",
            cursor: "pointer",
          }}
        />

        {/* Buttons Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={togglePlay}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: "0.25rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
              onClick={toggleMute}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: "0.25rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Timestamp */}
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-mono)" }}>
              {formatVideoDuration(currentTime)} / {formatVideoDuration(duration)}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Speed Rate Switcher */}
            <button
              onClick={cycleSpeed}
              title="Playback speed"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                color: "white",
                fontSize: "0.7rem",
                fontWeight: 600,
                padding: "0.2rem 0.45rem",
                cursor: "pointer",
              }}
            >
              {playbackRate}x
            </button>

            {/* Fullscreen */}
            <button
              onClick={handleFullscreen}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: "0.25rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
