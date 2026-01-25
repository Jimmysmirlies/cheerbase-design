"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/shadcn/dialog";
import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import { Textarea } from "@workspace/ui/shadcn/textarea";
import { Label } from "@workspace/ui/shadcn/label";
import { UploadIcon, FileIcon, XIcon } from "lucide-react";
import type { EventDocument } from "@/types/events";

type AddDocumentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (doc: EventDocument) => void;
};

export function AddDocumentModal({
  open,
  onOpenChange,
  onAdd,
}: AddDocumentModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setFile(null);
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        resetForm();
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetForm],
  );

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile) {
        setFile(selectedFile);
        // Auto-fill title from filename if empty
        if (!title) {
          // Remove extension for cleaner default title
          const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
          setTitle(nameWithoutExt);
        }
      }
    }
  }, [title]);

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

  const handleSubmit = useCallback(() => {
    if (!file || !title.trim()) return;

    // Create object URL for demo (in production, upload to server)
    const href = URL.createObjectURL(file);

    onAdd({
      name: title.trim(),
      description: description.trim(),
      href,
    });

    resetForm();
    onOpenChange(false);
  }, [file, title, description, onAdd, onOpenChange, resetForm]);

  const canSubmit = !!file && !!title.trim();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4 overflow-hidden">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="doc-title">Title</Label>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Event information packet"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="doc-description">Description (optional)</Label>
            <Textarea
              id="doc-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the document"
              rows={2}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Document</Label>
            {file ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 min-w-0">
                <FileIcon className="size-5 text-muted-foreground shrink-0" />
                <span className="flex-1 min-w-0 truncate body-small">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() => setFile(null)}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                  ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"}
                `}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    handleFileSelect(target.files);
                  };
                  input.click();
                }}
              >
                <UploadIcon className="mx-auto size-6 text-muted-foreground mb-2" />
                <p className="body-small text-muted-foreground">
                  Drop file here or click to select
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Add Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
