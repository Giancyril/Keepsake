"use client";

import React, { useEffect, useState } from "react";
import { MapView, GeoPhotoFeature } from "@/components/map/MapView";
import { Lightbox } from "@/components/library/Lightbox";
import { Globe, MapPin, Loader2, Sparkles } from "lucide-react";

interface GeoResponse {
  features: GeoPhotoFeature[];
  summary: {
    totalGeotagged: number;
    countries: string[];
    cities: string[];
  };
}

export default function MapPage() {
  const [data, setData] = useState<GeoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);

  useEffect(() => {
    async function loadGeoData() {
      try {
        const res = await fetch("/api/photos/geo");
        if (!res.ok) throw new Error("Failed to load map data");
        const json: GeoResponse = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to load geolocation data");
      } finally {
        setLoading(false);
      }
    }

    loadGeoData();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 4rem)", gap: "1rem" }}>
      {/* Header & Filter Chips */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1
              style={{
                fontSize: "var(--text-2xl)",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                margin: "0 0 0.25rem 0",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Globe size={24} style={{ color: "var(--color-accent)" }} />
              Places &amp; Map Explorer
            </h1>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0 }}>
              {data
                ? `${data.summary.totalGeotagged} geotagged photos across ${data.summary.countries.length} countries and ${data.summary.cities.length} cities`
                : "Explore your photos and videos by location"}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        {data && (data.summary.countries.length > 0 || data.summary.cities.length > 0) && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", overflowX: "auto", paddingBottom: "0.25rem" }}>
            <button
              onClick={() => {
                setSelectedCountry(null);
                setSelectedCity(null);
              }}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "var(--radius-full)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                cursor: "pointer",
                border: "1px solid",
                borderColor: !selectedCountry && !selectedCity ? "var(--color-accent)" : "var(--color-border)",
                background: !selectedCountry && !selectedCity ? "var(--color-accent-dim)" : "var(--color-surface)",
                color: !selectedCountry && !selectedCity ? "var(--color-accent)" : "var(--color-text-muted)",
                transition: "all var(--duration-fast)",
              }}
            >
              All Places ({data.summary.totalGeotagged})
            </button>

            {data.summary.countries.map((country) => (
              <button
                key={country}
                onClick={() => {
                  setSelectedCountry(selectedCountry === country ? null : country);
                  setSelectedCity(null);
                }}
                style={{
                  padding: "0.35rem 0.75rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: selectedCountry === country ? "var(--color-accent)" : "var(--color-border)",
                  background: selectedCountry === country ? "var(--color-accent-dim)" : "var(--color-surface)",
                  color: selectedCountry === country ? "var(--color-accent)" : "var(--color-text-muted)",
                  transition: "all var(--duration-fast)",
                }}
              >
                {country}
              </button>
            ))}

            {data.summary.cities.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(selectedCity === city ? null : city);
                  setSelectedCountry(null);
                }}
                style={{
                  padding: "0.35rem 0.75rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: selectedCity === city ? "var(--color-accent)" : "var(--color-border)",
                  background: selectedCity === city ? "var(--color-accent-dim)" : "var(--color-surface)",
                  color: selectedCity === city ? "var(--color-accent)" : "var(--color-text-muted)",
                  transition: "all var(--duration-fast)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <MapPin size={10} />
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Canvas */}
      <div style={{ flex: 1, minHeight: "450px", position: "relative" }}>
        {loading ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
            }}
          >
            <Loader2 size={32} className="animate-spin" style={{ color: "var(--color-accent)" }} />
            <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Loading map &amp; GPS coordinates…
            </span>
          </div>
        ) : error ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-danger)",
            }}
          >
            {error}
          </div>
        ) : data?.features.length === 0 ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "3.5rem",
                height: "3.5rem",
                borderRadius: "var(--radius-lg)",
                background: "var(--color-surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-text-muted)",
              }}
            >
              <MapPin size={24} />
            </div>
            <h3 style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>
              No GPS Coordinates Yet
            </h3>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", margin: 0, maxWidth: "360px" }}>
              Upload photos with embedded EXIF location metadata to see them pinned on your world map.
            </p>
          </div>
        ) : (
          <MapView
            features={data?.features || []}
            onSelectPhoto={(id) => setLightboxPhotoId(id)}
            selectedCity={selectedCity}
            selectedCountry={selectedCountry}
          />
        )}
      </div>

      {/* Lightbox when photo clicked */}
      {lightboxPhotoId && (
        <Lightbox
          photoId={lightboxPhotoId}
          onClose={() => setLightboxPhotoId(null)}
        />
      )}
    </div>
  );
}
