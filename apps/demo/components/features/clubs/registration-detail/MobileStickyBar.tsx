"use client";

import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";

import { Button } from "@workspace/ui/shadcn/button";
import { formatCurrency } from "@/utils/format";
import type { EditModeInvoice } from "./types";

type MobileStickyBarProps = {
  paymentStatus: "Paid" | "Unpaid" | "Overdue";
  paymentTitle: string;
  paymentDeadlineLabel?: string;
  paidAtLabel: string | null;
  dueDateMonth: string | null;
  dueDateDay: number | null;
  invoiceHref: string;
};

export function MobileStickyBar({
  paymentStatus,
  paymentTitle,
  paymentDeadlineLabel,
  paidAtLabel,
  dueDateMonth,
  dueDateDay,
  invoiceHref,
}: MobileStickyBarProps) {
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            {paymentStatus === "Paid" ? (
              <div className="flex size-12 items-center justify-center rounded-md border border-green-200 bg-green-100 dark:border-green-800 dark:bg-green-900/20">
                <CheckCircle2Icon className="size-6 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="flex w-12 flex-col items-center justify-center rounded-md border border-border bg-muted/50 py-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                  {dueDateMonth ?? "---"}
                </span>
                <span className="text-base font-bold leading-none text-foreground">
                  {dueDateDay ?? "--"}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-foreground">
                {paymentTitle}
              </p>
              {paymentStatus === "Paid" && paidAtLabel ? (
                <p className="text-xs text-muted-foreground">
                  Paid · {paidAtLabel}
                </p>
              ) : paymentDeadlineLabel && paymentStatus !== "Paid" ? (
                <p className="text-xs text-muted-foreground">
                  Due {paymentDeadlineLabel}
                </p>
              ) : null}
            </div>
          </div>

          <Button asChild size="sm">
            <Link href={invoiceHref}>
              {paymentStatus === "Paid" ? "View Invoice" : "Pay Invoice"}
            </Link>
          </Button>
        </div>
      </div>
      <div className="h-20 lg:hidden" />
    </>
  );
}

type EditModeMobileStickyBarProps = {
  editModeInvoice: EditModeInvoice;
  addedTeamsCount: number;
  removedTeamsCount: number;
  onSubmit: () => void;
};

export function EditModeMobileStickyBar({
  editModeInvoice,
  addedTeamsCount,
  removedTeamsCount,
  onSubmit,
}: EditModeMobileStickyBarProps) {
  const changesDescription = editModeInvoice.hasChanges
    ? `${addedTeamsCount > 0 ? `+${addedTeamsCount} added` : ""}${addedTeamsCount > 0 && removedTeamsCount > 0 ? ", " : ""}${removedTeamsCount > 0 ? `${removedTeamsCount} removed` : ""}`
    : "Review changes before submitting";

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground">
              {editModeInvoice.hasChanges ? "New Total: " : "Total: "}
              {formatCurrency(editModeInvoice.total)}
            </p>
            <p className="text-xs text-muted-foreground">
              {changesDescription}
            </p>
          </div>
          <Button
            size="sm"
            disabled={!editModeInvoice.hasChanges}
            onClick={onSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
      <div className="h-20 lg:hidden" />
    </>
  );
}
