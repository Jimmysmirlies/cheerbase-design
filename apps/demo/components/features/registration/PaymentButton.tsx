"use client";

import { useState } from "react";
import { CreditCardIcon } from "lucide-react";
import { Button } from "@workspace/ui/shadcn/button";
import { PaymentMethodsDialog } from "./PaymentMethods";

export function PaymentButton() {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  return (
    <>
      <div className="flex justify-end pt-6">
        <Button onClick={() => setPaymentDialogOpen(true)} size="lg">
          <CreditCardIcon className="mr-2 h-4 w-4" />
          Pay Now
        </Button>
      </div>
      <PaymentMethodsDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
      />
    </>
  );
}
