"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/shadcn/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/shadcn/alert-dialog";
import { toast } from "@workspace/ui/shadcn/sonner";
import { Trash2Icon, FileIcon, DownloadIcon } from "lucide-react";
import type { Event, EventDocument } from "@/types/events";
import { AddDocumentModal } from "./AddDocumentModal";

export type DocumentsSectionProps = {
  /** Event data containing documents */
  eventData: Partial<Event>;
  /** Callback to update event data */
  onUpdate?: (updates: Partial<Event>) => void;
  /** Whether the section is editable (shows add/delete buttons) */
  editable?: boolean;
  /** Pre-computed documents for display */
  documents?: EventDocument[];
  /** Control modal open state from parent */
  modalOpen?: boolean;
  /** Callback when modal open state changes */
  onModalOpenChange?: (open: boolean) => void;
};

/**
 * DocumentsSection displays event documents and resources.
 * In editable mode, shows "Add Document" button that opens a modal.
 */
export function DocumentsSection({
  eventData,
  onUpdate,
  editable = false,
  documents: propDocuments,
  modalOpen: controlledModalOpen,
  onModalOpenChange,
}: DocumentsSectionProps) {
  const documents = propDocuments || eventData.documents || [];
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  // Use controlled state if provided, otherwise use internal state
  const modalOpen = controlledModalOpen ?? internalModalOpen;
  const setModalOpen = onModalOpenChange ?? setInternalModalOpen;

  // Get the document being deleted for the confirmation dialog
  const documentToDelete = deleteIndex !== null ? documents[deleteIndex] : null;

  const handleAddDocument = useCallback(
    (doc: EventDocument) => {
      const currentDocs = eventData.documents || [];
      onUpdate?.({ documents: [...currentDocs, doc] });
      toast.success("Document added", {
        description: `"${doc.name}" has been added to the event.`,
      });
    },
    [eventData.documents, onUpdate],
  );

  const handleRequestDelete = useCallback((index: number) => {
    setDeleteIndex(index);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteIndex === null) return;
    const docName = documents[deleteIndex]?.name || "Document";
    const currentDocs = eventData.documents || [];
    const updated = currentDocs.filter((_, i) => i !== deleteIndex);
    onUpdate?.({ documents: updated });
    setDeleteIndex(null);
    toast.success("Document removed", {
      description: `"${docName}" has been removed from the event.`,
    });
  }, [deleteIndex, documents, eventData.documents, onUpdate]);

  const handleCancelDelete = useCallback(() => {
    setDeleteIndex(null);
  }, []);

  // Empty state
  if (documents.length === 0 && !editable) {
    return null;
  }

  return (
    <>
      {/* Document cards grid */}
      {documents.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {documents.map((doc, index) => (
            <div
              key={`${doc.name}-${index}`}
              className="rounded-md border border-border/70 bg-card/60 p-4 sm:p-6 transition-all hover:border-primary/20"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <DownloadIcon className="text-primary/70 size-5 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="body-text font-semibold text-foreground">
                      {doc.name}
                    </p>
                    {doc.description && (
                      <p className="body-small text-muted-foreground">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  {editable ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRequestDelete(index)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <Link href={doc.href}>Download</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        editable && (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
            <FileIcon className="mx-auto size-12 mb-2 opacity-50" />
            <p className="body-small">No documents added yet</p>
          </div>
        )
      )}

      {/* Add Document Modal */}
      <AddDocumentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAdd={handleAddDocument}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteIndex !== null}
        onOpenChange={(open) => !open && handleCancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Document?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{documentToDelete?.name}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
