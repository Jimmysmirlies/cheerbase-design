"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";

import { Button } from "@workspace/ui/shadcn/button";
import { cn } from "@workspace/ui/lib/utils";

import { PaymentMethodsDialog } from "@/components/features/registration/PaymentMethods";

type PaymentStatus = "paid" | "unpaid" | "overdue";

type RegistrationPaymentCTAProps = {
  status: PaymentStatus;
  amountLabel: string;
  dueLabel?: string;
  paidAtLabel?: string;
  invoiceHref: string;
  description?: string;
  hideButtons?: boolean;
};

const statusStyles: Record<
  PaymentStatus,
  { container: string; title: string; description: string }
> = {
  paid: {
    container:
      "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50",
    title: "text-green-700 dark:text-green-300",
    description: "text-green-600 dark:text-green-400",
  },
  unpaid: {
    container: "border-border bg-muted",
    title: "text-foreground",
    description: "text-muted-foreground",
  },
  overdue: {
    container:
      "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/50",
    title: "text-amber-700 dark:text-amber-300",
    description: "text-amber-600 dark:text-amber-400",
  },
};

const statusTitles: Record<PaymentStatus, string> = {
  paid: "Payment Received",
  unpaid: "Payment Required",
  overdue: "Payment Overdue",
};

export function RegistrationPaymentCTA({
  status,
  amountLabel,
  dueLabel,
  paidAtLabel,
  invoiceHref,
  description,
  hideButtons = false,
}: RegistrationPaymentCTAProps) {
  const [open, setOpen] = useState(false);
  const styles = statusStyles[status];
  const title = statusTitles[status];

  const defaultDescriptions: Record<PaymentStatus, string> = {
    paid: `Your payment of ${amountLabel} has been received.`,
    unpaid: `Complete payment of ${amountLabel} to keep this registration confirmed.`,
    overdue: `The ${amountLabel} invoice was due ${dueLabel ?? "previously"}. Pay now to keep this registration active.`,
  };

  const displayDescription = description ?? defaultDescriptions[status];

  return (
    <>
      <div
        className={cn(
          "rounded-md border px-4 py-4 body-text",
          styles.container,
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-3",
            !hideButtons && "sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <div className="flex flex-col gap-1">
            <p
              className={cn(
                "font-semibold flex items-center gap-2",
                styles.title,
              )}
            >
              {status === "paid" && <CheckCircle2Icon className="size-4" />}
              {title}
              {status === "paid" && paidAtLabel ? (
                <span
                  className={cn("font-normal", styles.description)}
                >{` · ${paidAtLabel}`}</span>
              ) : status !== "paid" && dueLabel ? (
                <span
                  className={cn("font-normal", styles.description)}
                >{` · Due ${dueLabel}`}</span>
              ) : null}
            </p>
            <p className={styles.description}>{displayDescription}</p>
          </div>
          {!hideButtons && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                asChild
                size="sm"
                variant={status === "paid" ? "default" : "outline"}
              >
                <Link href={invoiceHref}>View Invoice</Link>
              </Button>
              {status !== "paid" && (
                <Button size="sm" onClick={() => setOpen(true)}>
                  Pay Now
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      <PaymentMethodsDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
