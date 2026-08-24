"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapPin, Image as ImageIcon, ZoomIn, ZoomOut, Layers } from "lucide-react";

export interface GeoPhotoFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: string;
    filename: string;
    thumbUrl: string;
    locationName: string;
    city?: string;
    country?: string;
    takenAt: string;
    width?: number;
    height?: number;
  };
}

interface MapViewProps {
  features: GeoPhotoFeature[];
  onSelectPhoto: (photoId: string) => void;
  selectedCity?: string | null;
  selectedCountry?: string | null;
}

export function MapView({
  features,
  onSelectPhoto,
  selectedCity,
  selectedCountry,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [activePhoto, setActivePhoto] = useState<GeoPhotoFeature | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filter features based on city/country props
  const filteredFeatures = features.filter((f) => {
    if (selectedCity && f.properties.city !== selectedCity) return false;
    if (selectedCountry && f.properties.country !== selectedCountry) return false;
    return true;
  });

  // Dynamically load Leaflet from CDN for fast and reliable edge rendering
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!(window as any).L) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;
      const L = (window as any).L;
      if (!L) return;

      // Dark Matter CartoDB tiles
      const map = L.map(mapContainerRef.current, {
        center: [25.0, 10.0],
        zoom: 2,
        zoomControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when filteredFeatures changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = (window as any).L;
    if (!map || !L || !mapLoaded) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (filteredFeatures.length === 0) return;

    const bounds = L.latLngBounds([]);

    filteredFeatures.forEach((feat) => {
      const [lng, lat] = feat.geometry.coordinates;
      const latLng = L.latLng(lat, lng);
      bounds.extend(latLng);

      // Custom photo pin marker HTML
      const customIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: #1C1C1F;
            border: 2px solid #4F6EF7;
            box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 12px rgba(79,110,247,0.4);
            overflow: hidden;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.15s ease;
          ">
            ${
              feat.properties.thumbUrl
                ? `<img src="${feat.properties.thumbUrl}" style="width:100%;height:100%;object-fit:cover;" />`
                : `<span style="color:#888892;font-size:12px;">📍</span>`
            }
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });

      const marker = L.marker(latLng, { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        setActivePhoto(feat);
      });

      markersRef.current.push(marker);
    });

    if (filteredFeatures.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [filteredFeatures, mapLoaded]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "500px", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%", background: "#0A0A0B" }} />

      {/* Floating Map Zoom Controls */}
      <div
        style={{
          position: "absolute",
          top: "1.25rem",
          right: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          title="Zoom In"
          style={{
            width: "2.25rem",
            height: "2.25rem",
            borderRadius: "var(--radius-md)",
            background: "rgba(20, 20, 22, 0.85)",
            backdropFilter: "blur(10px)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          title="Zoom Out"
          style={{
            width: "2.25rem",
            height: "2.25rem",
            borderRadius: "var(--radius-md)",
            background: "rgba(20, 20, 22, 0.85)",
            backdropFilter: "blur(10px)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <ZoomOut size={16} />
        </button>
      </div>

      {/* Active Photo Popup Card */}
      {activePhoto && (
        <div
          style={{
            position: "absolute",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(20, 20, 22, 0.92)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "var(--radius-lg)",
            padding: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            zIndex: 1000,
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            maxWidth: "380px",
            width: "calc(100% - 3rem)",
          }}
        >
          {activePhoto.properties.thumbUrl ? (
            <img
              src={activePhoto.properties.thumbUrl}
              alt={activePhoto.properties.filename}
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "var(--radius-md)",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ImageIcon size={20} style={{ color: "var(--color-text-muted)" }} />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {activePhoto.properties.locationName}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
              {new Date(activePhoto.properties.takenAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
            <button
              onClick={() => onSelectPhoto(activePhoto.properties.id)}
              style={{
                marginTop: "0.5rem",
                padding: "0.3rem 0.75rem",
                background: "var(--color-accent)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              View in Lightbox
            </button>
          </div>

          <button
            onClick={() => setActivePhoto(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              alignSelf: "flex-start",
              fontSize: "1.1rem",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
