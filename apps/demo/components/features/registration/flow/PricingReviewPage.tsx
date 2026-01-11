"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCardIcon } from "lucide-react";
import type { RegistrationEntry } from "./types";
import { PricingBreakdownCard } from "@/components/ui/cards/PricingBreakdownCard";
import { PaymentMethodsDialog } from "@/components/features/registration/PaymentMethods";
import type { DivisionPricing } from "@/types/events";
import { Button } from "@workspace/ui/shadcn/button";
import { groupEntriesByDivision } from "@/utils/registration-stats";

type PricingReviewPageProps = {
  entries: RegistrationEntry[];
  divisionPricing: DivisionPricing[];
  onSubmit?: () => void;
  hideSubmitButton?: boolean;
  showPaymentMethods?: boolean;
};

export function PricingReviewPage({
  entries,
  divisionPricing,
  onSubmit,
  hideSubmitButton = false,
  showPaymentMethods = false,
}: PricingReviewPageProps) {
  const router = useRouter();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const groupedEntries = groupEntriesByDivision(entries);

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
    }
    // Navigate to confirmation page
    router.push("./register/confirmation");
  };

  return (
    <div className="space-y-6">
      <PricingBreakdownCard
        entriesByDivision={groupedEntries}
        divisionPricing={divisionPricing}
      />

      {showPaymentMethods && (
        <div className="flex justify-end">
          <Button onClick={() => setPaymentDialogOpen(true)}>
            <CreditCardIcon className="mr-2 h-4 w-4" />
            Pay Now
          </Button>
        </div>
      )}

      {!hideSubmitButton && (
        <div className="flex justify-end pt-4">
          <Button
            className="w-fit"
            onClick={handleSubmit}
            disabled={!entries.length}
          >
            Submit Registration
          </Button>
        </div>
      )}

      <PaymentMethodsDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
      />
    </div>
  );
}
