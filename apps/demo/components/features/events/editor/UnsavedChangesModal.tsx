"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/shadcn/dialog";
import { Button } from "@workspace/ui/shadcn/button";

type UnsavedChangesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onSaveDraft: () => void;
};

export function UnsavedChangesModal({
  open,
  onOpenChange,
  onDiscard,
  onSaveDraft,
}: UnsavedChangesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unsaved Changes</DialogTitle>
          <DialogDescription>
            You have unsaved changes. Backing out will result in lost progress.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={onDiscard}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Discard Changes
          </Button>
          <Button onClick={onSaveDraft}>Save Draft</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
