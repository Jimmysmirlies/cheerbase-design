"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import { Textarea } from "@workspace/ui/shadcn/textarea";
import { Button } from "@workspace/ui/shadcn/button";
import { XIcon, FileIcon, UploadIcon, DownloadIcon } from "lucide-react";
import type { Event, EventDocument } from "@/types/events";
import type { BaseSectionProps } from "./types";

export type DocumentsSectionProps = BaseSectionProps & {
  /** Pre-computed documents for display */
  documents?: EventDocument[];
};

/**
 * DocumentsSection displays event documents and resources.
 * Supports both view and edit modes with drag-and-drop upload.
 */
export function DocumentsSection({
  mode,
  eventData,
  onUpdate,
  documents: propDocuments,
}: DocumentsSectionProps) {
  const documents = propDocuments || eventData.documents || [];
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const newDocs: EventDocument[] = [];
      Array.from(files).forEach((file) => {
        // For demo: create object URL (in real app, upload to server)
        const url = URL.createObjectURL(file);
        newDocs.push({
          name: file.name,
          description: "",
          href: url,
        });
      });

      if (newDocs.length > 0) {
        const currentDocs = eventData.documents || [];
        onUpdate?.({ documents: [...currentDocs, ...newDocs] });
      }
    },
    [eventData.documents, onUpdate]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const updateDocument = useCallback(
    (index: number, updates: Partial<EventDocument>) => {
      const currentDocs = eventData.documents || [];
      const updated = currentDocs.map((doc, i) =>
        i === index ? { ...doc, ...updates } : doc
      );
      onUpdate?.({ documents: updated });
    },
    [eventData.documents, onUpdate]
  );

  const removeDocument = useCallback(
    (index: number) => {
      const currentDocs = eventData.documents || [];
      const updated = currentDocs.filter((_, i) => i !== index);
      onUpdate?.({ documents: updated });
    },
    [eventData.documents, onUpdate]
  );

  // VIEW MODE
  if (mode === "view") {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {documents.map((doc) => (
          <div
            key={doc.name}
            className="rounded-md border border-border/70 bg-card/60 p-6 transition-all hover:border-primary/20"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <DownloadIcon className="text-primary/70 size-5 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <p className="body-text font-semibold text-foreground">
                    {doc.name}
                  </p>
                  <p className="body-small text-muted-foreground">
                    {doc.description}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link href={doc.href}>Download</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // EDIT MODE
  const editDocs = eventData.documents || [];

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="space-y-2">
        <Label>Documents</Label>
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
            Drag and drop documents here, or click to select
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.multiple = true;
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                handleFileSelect(target.files);
              };
              input.click();
            }}
          >
            Select Documents
          </Button>
        </div>
      </div>

      {editDocs.length > 0 && (
        <div className="space-y-4">
          {editDocs.map((doc, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <FileIcon className="size-5 text-muted-foreground" />
                    <div className="flex-1 space-y-2">
                      <Input
                        value={doc.name}
                        onChange={(e) =>
                          updateDocument(index, { name: e.target.value })
                        }
                        placeholder="Document title"
                        className="font-semibold"
                      />
                      <Textarea
                        value={doc.description}
                        onChange={(e) =>
                          updateDocument(index, { description: e.target.value })
                        }
                        placeholder="Document subtitle/description"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDocument(index)}
                  className="ml-4"
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editDocs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
          <FileIcon className="mx-auto size-12 mb-2 opacity-50" />
          <p className="text-sm">No documents added yet</p>
        </div>
      )}
    </div>
  );
}

/** Check if section has data to display */
DocumentsSection.hasData = (eventData: Partial<Event>): boolean => {
  return !!(eventData.documents && eventData.documents.length > 0);
};

/** Empty state configuration */
DocumentsSection.emptyTitle = "Upload event documents";
DocumentsSection.emptyDescription =
  "Add waivers, info packets, and other resources";
