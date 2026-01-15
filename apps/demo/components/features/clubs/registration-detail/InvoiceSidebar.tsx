"use client";

import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@workspace/ui/shadcn/button";
import { Card, CardContent } from "@workspace/ui/shadcn/card";
import { cn } from "@workspace/ui/lib/utils";

import { fadeInUp } from "@/lib/animations";
import { formatCurrency } from "@/utils/format";
import { WalkthroughSpotlight } from "@/components/ui/RegistrationWalkthrough";
import type { InvoiceLineItem, EditModeInvoice } from "./types";

type InvoiceSidebarProps = {
  invoiceLineItems: InvoiceLineItem[];
  subtotal: number;
  totalTax: number;
  invoiceTotal: number;
  invoiceHref: string;
  paymentStatus: "Paid" | "Unpaid" | "Overdue";
  paymentDeadlineLabel?: string;
  paidAtLabel: string | null;
  // For updated invoice display
  showUpdatedInvoice?: boolean;
  editModeInvoice?: EditModeInvoice;
  refundAmount?: number;
};

export function InvoiceSidebar({
  invoiceLineItems,
  subtotal,
  totalTax,
  invoiceTotal,
  invoiceHref,
  paymentStatus,
  paymentDeadlineLabel,
  paidAtLabel,
  showUpdatedInvoice = false,
  editModeInvoice,
  refundAmount = 0,
}: InvoiceSidebarProps) {
  const isRefund = refundAmount > 0;

  // Determine effective payment status
  const isPaid = paymentStatus === "Paid";
  const hasAdditionalAmountOwed =
    isPaid && showUpdatedInvoice && !isRefund && refundAmount < 0;
  const effectiveStatus = hasAdditionalAmountOwed ? "Unpaid" : paymentStatus;

  return (
    <div className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="flex flex-col gap-4">
          <Card className="border-border/70 bg-card py-6">
            <CardContent className="flex flex-col gap-4 px-6 py-0">
              {/* Invoice line items */}
              {showUpdatedInvoice && editModeInvoice ? (
                <div className="flex flex-col gap-4">
                  {editModeInvoice.items
                    .filter((item) => !item.isRemoved)
                    .map((item) => (
                      <div key={item.id} className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-foreground">
                          {item.category}
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(item.unit)} × {item.qty}
                          </span>
                          <span className="text-sm text-foreground">
                            {formatCurrency(item.lineTotal)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {invoiceLineItems.map((item, index) => (
                    <div key={index} className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-foreground">
                        {item.category}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(item.unit)} × {item.qty}
                        </span>
                        <span className="text-sm text-foreground">
                          {formatCurrency(item.lineTotal)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="h-px w-full bg-border/60" />

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="text-sm text-foreground">
                    {formatCurrency(
                      showUpdatedInvoice && editModeInvoice
                        ? editModeInvoice.subtotal
                        : subtotal,
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tax</span>
                  <span className="text-sm text-foreground">
                    {formatCurrency(
                      showUpdatedInvoice && editModeInvoice
                        ? editModeInvoice.tax
                        : totalTax,
                    )}
                  </span>
                </div>
              </div>

              <div className="h-px w-full bg-border/60" />

              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-xl font-semibold text-foreground">
                  {formatCurrency(
                    showUpdatedInvoice && editModeInvoice
                      ? editModeInvoice.total
                      : invoiceTotal,
                  )}
                </span>
              </div>

              {/* Refund notice - only show for PAID events */}
              {showUpdatedInvoice && paymentStatus === "Paid" && isRefund && (
                <>
                  <div className="h-px w-full bg-border/60" />
                  <div className="flex items-center justify-between rounded-md bg-green-50 dark:bg-green-950/30 px-3 py-2">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Refund Due
                    </span>
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                      -{formatCurrency(refundAmount)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Event organizer will refund this amount.
                  </p>
                </>
              )}

              {/* Amount owed if total increased - only show for PAID events */}
              {showUpdatedInvoice &&
                paymentStatus === "Paid" &&
                !isRefund &&
                refundAmount < 0 && (
                  <>
                    <div className="h-px w-full bg-border/60" />
                    <div className="flex items-center justify-between rounded-md bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Additional Amount
                      </span>
                      <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                        +{formatCurrency(Math.abs(refundAmount))}
                      </span>
                    </div>
                  </>
                )}

              <div className="h-px w-full bg-border/60" />

              <WalkthroughSpotlight
                step="pay-invoice"
                side="left"
                align="center"
                advanceOnClick
              >
                <Button asChild className="w-full">
                  <Link href={invoiceHref}>
                    {effectiveStatus === "Paid"
                      ? "View Invoice"
                      : "Pay Invoice"}
                  </Link>
                </Button>
              </WalkthroughSpotlight>

              {effectiveStatus !== "Paid" && paymentDeadlineLabel ? (
                <p className="text-xs text-muted-foreground text-center">
                  Payment due by {paymentDeadlineLabel}
                </p>
              ) : effectiveStatus === "Paid" && paidAtLabel ? (
                <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2Icon className="size-4 text-green-600 dark:text-green-400" />
                  Paid on {paidAtLabel}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

type EditModeInvoiceSidebarProps = {
  editModeInvoice: EditModeInvoice;
  onSubmit: () => void;
  onCancel: () => void;
};

export function EditModeInvoiceSidebar({
  editModeInvoice,
  onSubmit,
  onCancel,
}: EditModeInvoiceSidebarProps) {
  return (
    <div className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <Card className="border-border/70 bg-card py-6">
          <CardContent className="flex flex-col gap-4 px-6 py-0">
            <p className="label text-muted-foreground">
              {editModeInvoice.hasChanges
                ? "Updated Invoice"
                : "Invoice Summary"}
            </p>

            <div className="flex flex-col gap-4">
              {editModeInvoice.items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex flex-col gap-1",
                    item.isRemoved && "opacity-50",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium text-foreground",
                        item.isRemoved && "line-through",
                      )}
                    >
                      {item.category}
                    </span>
                    {item.isNew && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                        New
                      </span>
                    )}
                    {item.isRemoved && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                        Removed
                      </span>
                    )}
                    {item.isModified && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                        Modified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-sm text-muted-foreground",
                        item.isRemoved && "line-through",
                      )}
                    >
                      {formatCurrency(item.unit)} × {item.qty}
                      {item.isModified && item.originalQty !== undefined && (
                        <span className="ml-1 text-amber-600 dark:text-amber-400">
                          (was {item.originalQty})
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-sm text-foreground",
                        item.isRemoved && "line-through",
                      )}
                    >
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px w-full bg-border/60" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm text-foreground">
                  {formatCurrency(editModeInvoice.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tax</span>
                <span className="text-sm text-foreground">
                  {formatCurrency(editModeInvoice.tax)}
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-border/60" />

            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">
                {editModeInvoice.hasChanges ? "New Total" : "Total"}
              </span>
              <span className="text-xl font-semibold text-foreground">
                {formatCurrency(editModeInvoice.total)}
              </span>
            </div>

            <div className="h-px w-full bg-border/60" />

            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                disabled={!editModeInvoice.hasChanges}
                onClick={onSubmit}
              >
                Submit Registration
              </Button>
              <Button variant="outline" className="w-full" onClick={onCancel}>
                Cancel
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Make changes to teams above, then submit to update your invoice.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
