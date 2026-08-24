"use client";

import React, { useMemo } from "react";
import { PhotoWithUrls } from "@/types/photo";
import { DateGroupHeader } from "./DateGroupHeader";
import { PhotoGridItem } from "./PhotoGridItem";

interface PhotoGridProps {
  photos: PhotoWithUrls[];
  selectedIds?: Set<string>;
  isSelectMode?: boolean;
  onToggleSelect?: (id: string) => void;
  onToggleSelectGroup?: (ids: string[]) => void;
  onPhotoClick?: (photo: PhotoWithUrls) => void;
}

export function PhotoGrid({
  photos,
  selectedIds = new Set(),
  isSelectMode = false,
  onToggleSelect,
  onToggleSelectGroup,
  onPhotoClick,
}: PhotoGridProps) {
  // Group photos chronologically by day
  const groupedPhotos = useMemo(() => {
    const groups: { [dateStr: string]: PhotoWithUrls[] } = {};

    for (const photo of photos) {
      const dateKey = photo.takenAt
        ? photo.takenAt.split("T")[0]
        : photo.uploadedAt.split("T")[0];

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(photo);
    }

    return Object.entries(groups).map(([dateStr, items]) => ({
      dateStr,
      items,
    }));
  }, [photos]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {groupedPhotos.map(({ dateStr, items }) => {
        const itemIds = items.map((i) => i.id);
        const isAllSelected = itemIds.every((id) => selectedIds.has(id));

        return (
          <div key={dateStr}>
            <DateGroupHeader
              dateStr={dateStr}
              count={items.length}
              isSelectMode={isSelectMode}
              isAllSelected={isAllSelected}
              onToggleSelectAll={() => onToggleSelectGroup?.(itemIds)}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {items.map((photo) => (
                <PhotoGridItem
                  key={photo.id}
                  photo={photo}
                  isSelected={selectedIds.has(photo.id)}
                  isSelectMode={isSelectMode}
                  onSelect={onToggleSelect}
                  onClick={onPhotoClick}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
