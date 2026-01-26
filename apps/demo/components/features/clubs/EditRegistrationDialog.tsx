"use client";

import { useRouter } from "next/navigation";
import { AlertCircleIcon } from "lucide-react";

import { Button } from "@workspace/ui/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/shadcn/dialog";

type EditRegistrationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
};

export function EditRegistrationDialog({
  open,
  onOpenChange,
  registrationId,
}: EditRegistrationDialogProps) {
  const router = useRouter();

  const handleConfirm = () => {
    onOpenChange(false);
    router.push(`/clubs/registrations/${registrationId}/edit`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border-border/40 p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 shrink-0">
              <AlertCircleIcon className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle className="heading-3">Edit Registration?</DialogTitle>
          </div>
          <DialogDescription className="body-small text-muted-foreground/80">
            Any changes you make to your teams will be reflected in a new
            invoice. Your current invoice will be updated to show the revised
            totals.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
