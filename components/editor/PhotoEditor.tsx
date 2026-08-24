"use client";

import React, { useState, useRef } from "react";
import { PhotoWithUrls } from "@/types/photo";
import {
  EditorAdjustments,
  DEFAULT_ADJUSTMENTS,
  getCssFilterString,
  renderAdjustedCanvas,
} from "@/lib/editor/adjustments";
import { FILM_PRESETS, FilmPreset } from "@/lib/editor/presets";
import {
  Sliders,
  Sparkles,
  RotateCw,
  Crop,
  Check,
  X,
  Loader2,
  Undo,
  Save,
} from "lucide-react";

interface PhotoEditorProps {
  photo: PhotoWithUrls;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (newPhotoId?: string) => void;
}

export function PhotoEditor({ photo, isOpen, onClose, onSaved }: PhotoEditorProps) {
  const [activeTab, setActiveTab] = useState<"adjust" | "presets">("adjust");
  const [adjustments, setAdjustments] = useState<EditorAdjustments>(DEFAULT_ADJUSTMENTS);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("original");
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  if (!isOpen) return null;

  const imageUrl = photo.originalUrl || photo.thumbnailMdUrl || "";

  const handlePresetSelect = (preset: FilmPreset) => {
    setSelectedPresetId(preset.id);
    setAdjustments((prev) => ({
      ...preset.adjustments,
      rotation: prev.rotation,
    }));
  };

  const handleRotate = () => {
    setAdjustments((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  const handleReset = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setSelectedPresetId("original");
  };

  const handleSave = async (saveAsCopy: boolean) => {
    if (!imgRef.current) return;
    setSaving(true);

    try {
      // Render canvas to JPEG Blob
      const blob = await renderAdjustedCanvas(imgRef.current, adjustments);
      const file = new File([blob], `edited_${photo.filename}`, { type: "image/jpeg" });

      // Step 1: Request presigned PUT URL
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: [{ filename: file.name, mimeType: file.type, size: file.size }],
        }),
      });

      if (!presignRes.ok) throw new Error("Presign request failed");
      const presignData = await presignRes.json();
      const presignItem = presignData.uploads[0];

      // Step 2: Upload blob to S3
      await fetch(presignItem.presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      // Step 3: Confirm photo in database
      const confirmRes = await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3Key: presignItem.s3Key,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        }),
      });

      if (!confirmRes.ok) throw new Error("Confirmation failed");
      const confirmData = await confirmRes.json();

      onSaved(confirmData.photo?.id);
      onClose();
    } catch (err) {
      console.error("Save edit failed:", err);
      alert("Failed to save edited photo. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(10, 10, 11, 0.95)",
        backdropFilter: "blur(24px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Studio Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
            Photo Studio &amp; Filter Editor
          </h2>
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            {photo.filename}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={handleReset}
            title="Reset all adjustments"
            style={{
              padding: "0.45rem 0.75rem",
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text-muted)",
              fontSize: "0.8125rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <Undo size={14} />
            <span>Reset</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            style={{
              padding: "0.45rem 1rem",
              background: "var(--color-accent)",
              border: "none",
              borderRadius: "var(--radius-md)",
              color: "white",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{saving ? "Saving…" : "Save as Copy"}</span>
          </button>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              padding: "0.4rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Live Canvas Image Center View */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            position: "relative",
            background: "#08080A",
          }}
        >
          {imageUrl && (
            <div
              style={{
                position: "relative",
                maxHeight: "calc(100vh - 12rem)",
                maxWidth: "calc(100vw - 24rem)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Studio preview"
                crossOrigin="anonymous"
                style={{
                  maxHeight: "calc(100vh - 12rem)",
                  maxWidth: "calc(100vw - 24rem)",
                  objectFit: "contain",
                  borderRadius: "var(--radius-sm)",
                  filter: getCssFilterString(adjustments),
                  transform: `rotate(${adjustments.rotation}deg)`,
                  transition: "filter 0.1s ease, transform 0.2s ease",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
                }}
              />
            </div>
          )}
        </div>

        {/* Right Adjustments & Presets Panel */}
        <div
          style={{
            width: "320px",
            background: "var(--color-surface)",
            borderLeft: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Studio Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)" }}>
            <button
              onClick={() => setActiveTab("adjust")}
              style={{
                flex: 1,
                padding: "0.75rem",
                background: activeTab === "adjust" ? "var(--color-surface-2)" : "transparent",
                border: "none",
                borderBottom: activeTab === "adjust" ? "2px solid var(--color-accent)" : "none",
                color: activeTab === "adjust" ? "var(--color-text-primary)" : "var(--color-text-muted)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
              }}
            >
              <Sliders size={15} />
              <span>Adjustments</span>
            </button>

            <button
              onClick={() => setActiveTab("presets")}
              style={{
                flex: 1,
                padding: "0.75rem",
                background: activeTab === "presets" ? "var(--color-surface-2)" : "transparent",
                border: "none",
                borderBottom: activeTab === "presets" ? "2px solid var(--color-accent)" : "none",
                color: activeTab === "presets" ? "var(--color-text-primary)" : "var(--color-text-muted)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
              }}
            >
              <Sparkles size={15} />
              <span>Film Presets</span>
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, padding: "1.25rem", overflowY: "auto" }}>
            {activeTab === "adjust" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Rotate Quick Action */}
                <div>
                  <button
                    onClick={handleRotate}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <RotateCw size={15} />
                    <span>Rotate 90° ({adjustments.rotation}°)</span>
                  </button>
                </div>

                {/* Sliders */}
                {[
                  { key: "brightness", label: "Brightness / Exposure", min: -100, max: 100 },
                  { key: "contrast", label: "Contrast", min: -100, max: 100 },
                  { key: "saturation", label: "Saturation", min: -100, max: 100 },
                  { key: "temperature", label: "Temperature (Warm/Cool)", min: -100, max: 100 },
                  { key: "vignette", label: "Vignette Glow", min: 0, max: 100 },
                ].map(({ key, label, min, max }) => {
                  const val = adjustments[key as keyof EditorAdjustments];

                  return (
                    <div key={key}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                          marginBottom: "0.4rem",
                        }}
                      >
                        <span>{label}</span>
                        <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                          {val > 0 ? `+${val}` : val}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        value={val}
                        onChange={(e) =>
                          setAdjustments((prev) => ({
                            ...prev,
                            [key]: Number(e.target.value),
                          }))
                        }
                        style={{
                          width: "100%",
                          accentColor: "var(--color-accent)",
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Film Presets Grid */
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {FILM_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;

                  return (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      style={{
                        width: "100%",
                        padding: "0.875rem",
                        borderRadius: "var(--radius-md)",
                        background: isSelected ? "var(--color-accent-dim)" : "var(--color-surface-2)",
                        border: isSelected ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all var(--duration-fast)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: isSelected ? "var(--color-accent)" : "var(--color-text-primary)",
                          }}
                        >
                          {preset.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>
                          {preset.description}
                        </div>
                      </div>

                      {isSelected && <Check size={16} style={{ color: "var(--color-accent)" }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
