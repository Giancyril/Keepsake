"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { formatBytes, ACCEPTED_MIME_TYPES, ACCEPTED_EXTENSIONS, MAX_UPLOAD_BYTES } from "@/lib/utils";

export type UploadStatus = "queued" | "presigning" | "uploading" | "confirming" | "done" | "error";

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
  s3Key?: string;
  photoId?: string;
  xhr?: XMLHttpRequest;
}

interface UploadContextType {
  queue: UploadItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addFiles: (files: File[]) => void;
  retryUpload: (id: string) => void;
  cancelUpload: (id: string) => void;
  clearCompleted: () => void;
  hasGpsDisclosure: boolean;
  dismissGpsDisclosure: () => void;
  stripGpsOnUpload: boolean;
  setStripGpsOnUpload: (strip: boolean) => void;
}

const UploadContext = createContext<UploadContextType | null>(null);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [hasGpsDisclosure, setHasGpsDisclosure] = useState(true);
  const [stripGpsOnUpload, setStripGpsOnUpload] = useState(false);

  const updateItem = useCallback((id: string, updates: Partial<UploadItem>) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const processUpload = useCallback(
    async (item: UploadItem) => {
      updateItem(item.id, { status: "presigning", progress: 5, error: undefined });

      try {
        // Step 1: Request pre-signed URL from Next.js API
        const presignRes = await fetch("/api/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files: [
              {
                filename: item.file.name,
                mimeType: item.file.type || "application/octet-stream",
                size: item.file.size,
              },
            ],
          }),
        });

        if (!presignRes.ok) {
          const errData = await presignRes.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to initiate upload");
        }

        const presignData = await presignRes.json();
        const uploadTarget = presignData.uploads?.[0];
        if (!uploadTarget) {
          throw new Error("No presigned URL returned");
        }

        const { presignedUrl, s3Key } = uploadTarget;
        updateItem(item.id, { status: "uploading", s3Key, progress: 10 });

        // Step 2: Direct browser PUT to S3 using XMLHttpRequest for granular progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          updateItem(item.id, { xhr });

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 80) + 10;
              updateItem(item.id, { progress: Math.min(percent, 90) });
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`S3 upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during S3 upload"));
          xhr.onabort = () => reject(new Error("Upload cancelled"));

          xhr.open("PUT", presignedUrl, true);
          xhr.setRequestHeader("Content-Type", item.file.type || "application/octet-stream");
          xhr.send(item.file);
        });

        // Step 3: Confirm upload complete with Next.js API to create DB record & trigger processing
        updateItem(item.id, { status: "confirming", progress: 95 });

        const confirmRes = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            s3Key,
            filename: item.file.name,
            mimeType: item.file.type || "application/octet-stream",
            size: item.file.size,
          }),
        });

        if (!confirmRes.ok) {
          const confirmErr = await confirmRes.json().catch(() => ({}));
          throw new Error(confirmErr.error || "Failed to record photo in vault");
        }

        const confirmData = await confirmRes.json();
        updateItem(item.id, {
          status: "done",
          progress: 100,
          photoId: confirmData.photo?.id,
        });
      } catch (err: any) {
        updateItem(item.id, {
          status: "error",
          error: err.message || "Upload failed",
        });
      }
    },
    [updateItem]
  );

  const addFiles = useCallback(
    (files: File[]) => {
      const newItems: UploadItem[] = [];

      for (const file of files) {
        const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");

        // Fast Client-side Validation
        if (file.size > MAX_UPLOAD_BYTES) {
          newItems.push({
            id: crypto.randomUUID(),
            file,
            progress: 0,
            status: "error",
            error: `File exceeds maximum allowed size (${formatBytes(MAX_UPLOAD_BYTES)})`,
          });
          continue;
        }

        if (
          (file.type && !ACCEPTED_MIME_TYPES.has(file.type.toLowerCase())) ||
          !ACCEPTED_EXTENSIONS.has(ext)
        ) {
          newItems.push({
            id: crypto.randomUUID(),
            file,
            progress: 0,
            status: "error",
            error: "Unsupported format. Allowed: JPEG, PNG, HEIC, WebP, MP4, MOV, AVI",
          });
          continue;
        }

        const item: UploadItem = {
          id: crypto.randomUUID(),
          file,
          progress: 0,
          status: "queued",
        };
        newItems.push(item);
      }

      setQueue((prev) => [...prev, ...newItems]);
      setIsOpen(true);

      // Start processing valid queued items
      newItems
        .filter((item) => item.status === "queued")
        .forEach((item) => {
          processUpload(item);
        });
    },
    [processUpload]
  );

  const retryUpload = useCallback(
    (id: string) => {
      const item = queue.find((q) => q.id === id);
      if (item) {
        processUpload(item);
      }
    },
    [queue, processUpload]
  );

  const cancelUpload = useCallback(
    (id: string) => {
      const item = queue.find((q) => q.id === id);
      if (item?.xhr) {
        item.xhr.abort();
      }
      setQueue((prev) => prev.filter((q) => q.id !== id));
    },
    [queue]
  );

  const clearCompleted = useCallback(() => {
    setQueue((prev) => prev.filter((q) => q.status !== "done"));
  }, []);

  return (
    <UploadContext.Provider
      value={{
        queue,
        isOpen,
        setIsOpen,
        addFiles,
        retryUpload,
        cancelUpload,
        clearCompleted,
        hasGpsDisclosure,
        dismissGpsDisclosure: () => setHasGpsDisclosure(false),
        stripGpsOnUpload,
        setStripGpsOnUpload,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return ctx;
}
