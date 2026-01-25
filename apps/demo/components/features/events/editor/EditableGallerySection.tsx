"use client";

import { useState, useCallback } from "react";
import { Button } from "@workspace/ui/shadcn/button";
import { XIcon, UploadIcon } from "lucide-react";
import { HeroGallery } from "@/components/ui";
import { Section } from "@/components/layout/Section";
import { InlineEditCard } from "./InlineEditCard";

type EditableGallerySectionProps = {
  /** Gallery images array */
  images: string[];
  /** Event name for alt text */
  eventName?: string;
  /** Callback when gallery is updated */
  onUpdate: (images: string[]) => void;
};

export function EditableGallerySection({
  images,
  eventName = "Event",
  onUpdate,
}: EditableGallerySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localImages, setLocalImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const hasImages = images.length > 0;

  const handleStartEdit = useCallback(() => {
    setLocalImages([...images]);
    setIsEditing(true);
  }, [images]);

  const handleSave = useCallback(() => {
    onUpdate(localImages);
    setIsEditing(false);
  }, [localImages, onUpdate]);

  const handleCancel = useCallback(() => {
    setLocalImages([]);
    setIsEditing(false);
  }, []);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        newImages.push(url);
      }
    });

    if (newImages.length > 0) {
      setLocalImages((prev) => [...prev, ...newImages]);
    }
  }, []);

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

  const removeImage = useCallback((index: number) => {
    setLocalImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    setLocalImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      if (moved === undefined) return prev;
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  }, []);

  // Edit mode content
  if (isEditing) {
    return (
      <Section title="Gallery" showDivider={false} className="pb-8">
        <InlineEditCard
          onSave={handleSave}
          onCancel={handleCancel}
          saveButtonText="Done"
        >
          <div className="flex flex-col gap-4">
            {/* Drop zone */}
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

            {/* Image grid */}
            {localImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {localImages.map((image, index) => (
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
                      className="absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <XIcon className="size-4" />
                    </Button>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 left-2 size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => moveImage(index, index - 1)}
                      >
                        ↑
                      </Button>
                    )}
                    {index < localImages.length - 1 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-2 left-2 size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => moveImage(index, index + 1)}
                      >
                        ↓
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </InlineEditCard>
      </Section>
    );
  }

  // View mode with images
  if (hasImages) {
    return (
      <Section
        title="Gallery"
        showDivider={false}
        className="pb-8"
        titleRight={
          <button
            type="button"
            onClick={handleStartEdit}
            className="text-sm text-foreground underline hover:no-underline"
          >
            Edit
          </button>
        }
      >
        <HeroGallery images={images} alt={eventName} />
      </Section>
    );
  }

  // View mode empty
  return (
    <Section
      title="Gallery"
      showDivider={false}
      className="pb-8"
      titleRight={
        <button
          type="button"
          onClick={handleStartEdit}
          className="text-sm text-foreground underline hover:no-underline"
        >
          Upload Images
        </button>
      }
    >
      <div className="flex items-center justify-center rounded-xl bg-muted/50 border border-dashed border-border/60 min-h-[300px]">
        <p className="text-sm text-muted-foreground">Add event images</p>
      </div>
    </Section>
  );
}
