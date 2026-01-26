"use client";

import type { ReactNode } from "react";

import { Button } from "@workspace/ui/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/shadcn/dialog";

type FinalizeRegistrationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pricingPanel: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  confirmDisabled?: boolean;
};

export function FinalizeRegistrationDialog({
  open,
  onOpenChange,
  pricingPanel,
  title,
  description,
  confirmLabel,
  onConfirm,
  confirmDisabled = false,
}: FinalizeRegistrationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 rounded-xl border-border/40 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="heading-3">{title}</DialogTitle>
          <DialogDescription className="body-small text-muted-foreground/80">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <section className="rounded-xl border border-border/60 bg-muted/20 p-4 mb-4">
            {pricingPanel}
          </section>
          <p className="body-small text-muted-foreground">
            Submission will reserve your spots and notify the event organizer.
            You can still edit rosters before the payment deadline.
          </p>
        </div>
        <div className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Go Back
          </Button>
          <Button type="button" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
