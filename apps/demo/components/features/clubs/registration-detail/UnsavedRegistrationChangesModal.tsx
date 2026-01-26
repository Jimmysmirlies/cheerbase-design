"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/shadcn/dialog";
import { Button } from "@workspace/ui/shadcn/button";

type UnsavedRegistrationChangesModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
  onKeepEditing: () => void;
};

export function UnsavedRegistrationChangesModal({
  open,
  onOpenChange,
  onDiscard,
  onKeepEditing,
}: UnsavedRegistrationChangesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border-border/40 p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="heading-3">Unsaved Changes</DialogTitle>
          <DialogDescription className="body-small text-muted-foreground/80">
            You have unsaved changes to your registration. Leaving now will
            discard all changes.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onDiscard}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            Discard Changes
          </Button>
          <Button onClick={onKeepEditing}>Keep Editing</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
