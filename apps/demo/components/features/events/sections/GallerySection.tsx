"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@workspace/ui/shadcn/button";
import { Label } from "@workspace/ui/shadcn/label";
import { ImageIcon, XIcon, UploadIcon } from "lucide-react";
import { EventGallery } from "@/components/ui/EventGallery";
import type { Event } from "@/types/events";
import type { BaseSectionProps } from "./types";

export type GallerySectionProps = BaseSectionProps & {
  /** Pre-computed gallery images for display */
  galleryImages?: string[];
};

/**
 * GallerySection displays event images.
 * Supports both view and edit modes with drag-and-drop upload.
 */
export function GallerySection({
  mode,
  eventData,
  onUpdate,
  galleryImages: propGalleryImages,
}: GallerySectionProps) {
  const gallery = useMemo(() => eventData.gallery || [], [eventData.gallery]);
  const [isDragging, setIsDragging] = useState(false);

  // Use provided gallery images or fall back to event data
  const displayImages = propGalleryImages || gallery;

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          // For demo: create object URL (in real app, upload to server)
          const url = URL.createObjectURL(file);
          newImages.push(url);
        }
      });

      if (newImages.length > 0) {
        onUpdate?.({ gallery: [...gallery, ...newImages] });
      }
    },
    [gallery, onUpdate],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const removeImage = useCallback(
    (index: number) => {
      const updated = gallery.filter((_, i) => i !== index);
      onUpdate?.({ gallery: updated });
    },
    [gallery, onUpdate],
  );

  const moveImage = useCallback(
    (fromIndex: number, toIndex: number) => {
      const updated = [...gallery];
      const [moved] = updated.splice(fromIndex, 1);
      if (moved === undefined) return;
      updated.splice(toIndex, 0, moved);
      onUpdate?.({ gallery: updated });
    },
    [gallery, onUpdate],
  );

  // VIEW MODE
  if (mode === "view") {
    return (
      <EventGallery
        images={displayImages}
        alt={eventData.name || "Event gallery"}
        maxImages={4}
      />
    );
  }

  // EDIT MODE
  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="space-y-2">
        <Label>Gallery Images</Label>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? "border-primary bg-primary/5" : "border-border"}
          `}
        >
          <UploadIcon className="mx-auto size-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop images here, or click to select
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.multiple = true;
              input.accept = "image/*";
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                handleFileSelect(target.files);
              };
              input.click();
            }}
          >
            Select Images
          </Button>
        </div>
      </div>

      {gallery.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {gallery.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <XIcon className="size-4" />
              </Button>
              {index > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => moveImage(index, index - 1)}
                >
                  ↑
                </Button>
              )}
              {index < gallery.length - 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => moveImage(index, index + 1)}
                >
                  ↓
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {gallery.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="mx-auto size-12 mb-2 opacity-50" />
          <p className="text-sm">No images added yet</p>
        </div>
      )}
    </div>
  );
}

/** Check if section has data to display */
GallerySection.hasData = (eventData: Partial<Event>): boolean => {
  return !!(
    eventData.image ||
    (eventData.gallery && eventData.gallery.length > 0)
  );
};

/** Empty state configuration */
GallerySection.emptyTitle = "Add event images";
GallerySection.emptyDescription = "Upload photos to showcase your event";
