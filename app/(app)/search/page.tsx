"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PhotoWithUrls } from "@/types/photo";
import { SearchBar } from "@/components/search/SearchBar";
import { PhotoGrid } from "@/components/library/PhotoGrid";
import { SkeletonGrid } from "@/components/library/SkeletonGrid";
import { EmptyState } from "@/components/layout/EmptyState";
import { Lightbox } from "@/components/lightbox/Lightbox";
import { Search, MapPin, Calendar, Camera, Filter } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [hasGps, setHasGps] = useState(false);
  const [dateRange, setDateRange] = useState<string>("");
  const [photos, setPhotos] = useState<PhotoWithUrls[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);

  const performSearch = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (hasGps) params.set("hasGps", "true");

      if (dateRange === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        params.set("dateFrom", today.toISOString());
      } else if (dateRange === "this_month") {
        const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        params.set("dateFrom", firstDay.toISOString());
      } else if (dateRange === "this_year") {
        const firstDay = new Date(new Date().getFullYear(), 0, 1);
        params.set("dateFrom", firstDay.toISOString());
      }

      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setLoading(false);
    }
  }, [query, hasGps, dateRange]);

  // Debounced auto-search on input change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() || hasGps || dateRange) {
        performSearch();
      } else {
        setPhotos([]);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, hasGps, dateRange, performSearch]);

  const chipStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.375rem 0.75rem",
    borderRadius: "var(--radius-full)",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    cursor: "pointer",
    background: active ? "var(--color-accent)" : "var(--color-surface)",
    border: active ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
    color: active ? "white" : "var(--color-text-muted)",
    transition: "all var(--duration-fast)",
  });

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1
          style={{
            color: "var(--color-text-primary)",
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: 0,
            marginBottom: "0.25rem",
          }}
        >
          Search Vault
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Find photos by filename, camera model, date ranges, or GPS location
        </p>
      </div>

      {/* Search Input Bar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {/* Filter Chips */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "2rem",
        }}
      >
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-faint)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <Filter size={12} /> Filters:
        </span>

        {/* GPS location toggle */}
        <button
          onClick={() => setHasGps(!hasGps)}
          style={chipStyle(hasGps)}
        >
          <MapPin size={12} />
          <span>With GPS Location</span>
        </button>

        {/* Date presets */}
        {[
          { id: "today", label: "Today" },
          { id: "this_month", label: "This Month" },
          { id: "this_year", label: "This Year" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setDateRange(dateRange === id ? "" : id)}
            style={chipStyle(dateRange === id)}
          >
            <Calendar size={12} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Results Area */}
      <section>
        {loading ? (
          <SkeletonGrid count={12} />
        ) : !hasSearched ? (
          <EmptyState
            icon={Search}
            title="Search your photo library"
            description="Type a filename, camera make (e.g. 'iPhone' or 'Sony'), or select filters above to start searching."
          />
        ) : photos.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No matching photos found"
            description="Try changing your search terms or clearing some filters."
          />
        ) : (
          <div>
            <div style={{ marginBottom: "1rem", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
              Found {photos.length} {photos.length === 1 ? "result" : "results"}
            </div>
            <PhotoGrid
              photos={photos}
              onPhotoClick={(p) => setActivePhotoId(p.id)}
            />
          </div>
        )}
      </section>

      {/* Lightbox */}
      {activePhotoId && (
        <Lightbox
          photos={photos}
          currentId={activePhotoId}
          onClose={() => setActivePhotoId(null)}
          onDelete={(deletedId) => {
            setPhotos((prev) => prev.filter((p) => p.id !== deletedId));
          }}
        />
      )}
    </div>
  );
}
