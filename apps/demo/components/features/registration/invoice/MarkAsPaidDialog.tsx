"use client";

import { useState } from "react";
import { CheckCircle2Icon } from "lucide-react";

import { Button } from "@workspace/ui/shadcn/button";
import { formatCurrency } from "@/utils/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/shadcn/dialog";
import { Label } from "@workspace/ui/shadcn/label";
import { Textarea } from "@workspace/ui/shadcn/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/shadcn/select";
import { DatePicker } from "@workspace/ui/shadcn/date-picker";

type PaymentMethod = "e-transfer" | "cheque" | "cash" | "other";

type MarkAsPaidDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceNumber: string;
  invoiceTotal: number;
  onConfirm?: (data: {
    paymentDate: Date;
    paymentMethod: PaymentMethod;
    notes: string;
    invoiceTotal: number;
  }) => void;
};

export function MarkAsPaidDialog({
  open,
  onOpenChange,
  invoiceNumber,
  invoiceTotal,
  onConfirm,
}: MarkAsPaidDialogProps) {
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("e-transfer");
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    onConfirm?.({
      paymentDate,
      paymentMethod,
      notes,
      invoiceTotal,
    });
    onOpenChange(false);
    // Reset form
    setPaymentDate(new Date());
    setPaymentMethod("e-transfer");
    setNotes("");
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setPaymentDate(new Date());
    setPaymentMethod("e-transfer");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border-border/40 p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 shrink-0">
              <CheckCircle2Icon className="size-4 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="heading-3">Mark as Paid</DialogTitle>
          </div>
          <DialogDescription className="body-small text-muted-foreground/80">
            Record a payment of{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(invoiceTotal)}
            </span>{" "}
            for invoice #{invoiceNumber}. This will update the invoice status to
            paid.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Payment Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="payment-date">Payment Date</Label>
            <DatePicker
              date={paymentDate}
              onDateChange={(date) => date && setPaymentDate(date)}
              placeholder="Select payment date"
              toDate={new Date()}
            />
          </div>

          {/* Payment Method */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as PaymentMethod)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="e-transfer">E-Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm Payment</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
