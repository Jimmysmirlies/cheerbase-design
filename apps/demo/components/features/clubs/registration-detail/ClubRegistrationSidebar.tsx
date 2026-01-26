"use client";

import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@workspace/ui/shadcn/button";
import { Card, CardContent } from "@workspace/ui/shadcn/card";

import { fadeInUp } from "@/lib/animations";
import { formatCurrency } from "@/utils/format";
import type { InvoiceLineItem } from "./types";

type ClubRegistrationSidebarProps = {
  invoiceLineItems: InvoiceLineItem[];
  subtotal: number;
  totalTax: number;
  invoiceTotal: number;
  invoiceHref: string;
  paymentStatus: "Paid" | "Unpaid" | "Overdue";
  paymentDeadlineLabel?: string;
  paidAtLabel: string | null;
};

export function ClubRegistrationSidebar({
  invoiceLineItems,
  subtotal,
  totalTax,
  invoiceTotal: _invoiceTotal,
  invoiceHref,
  paymentStatus,
  paymentDeadlineLabel,
  paidAtLabel,
}: ClubRegistrationSidebarProps) {
  const isPaid = paymentStatus === "Paid";

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
            {/* Invoice line items */}
            <div className="flex flex-col gap-4">
              {invoiceLineItems.map((item, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <span className="body-small font-medium text-foreground">
                    {item.category}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="body-small text-muted-foreground">
                      {formatCurrency(item.unit)} × {item.qty}
                    </span>
                    <span className="body-small text-foreground">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px w-full bg-border/60" />

            {/* Subtotal and Tax */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="body-small text-muted-foreground">
                  Subtotal
                </span>
                <span className="body-small text-foreground">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="body-small text-muted-foreground">Tax</span>
                <span className="body-small text-foreground">
                  {formatCurrency(totalTax)}
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-border/60" />

            {/* Action Button */}
            <Button asChild className="w-full">
              <Link href={invoiceHref}>View Invoice</Link>
            </Button>

            {/* Payment Status */}
            {isPaid && paidAtLabel ? (
              <p className="flex items-center justify-center gap-1 body-small text-muted-foreground">
                <CheckCircle2Icon className="size-4 text-green-600 dark:text-green-400" />
                Paid on {paidAtLabel}
              </p>
            ) : paymentDeadlineLabel ? (
              <p className="body-small text-muted-foreground text-center">
                Payment due by {paymentDeadlineLabel}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
