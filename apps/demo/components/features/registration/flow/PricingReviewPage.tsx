'use client'

import { useRouter } from 'next/navigation'
import type { RegistrationEntry } from './types'
import { PricingBreakdownCard } from '@/components/ui/cards/PricingBreakdownCard'
import { PaymentMethodsCard } from '@/components/features/registration/PaymentMethods'
import type { DivisionPricing } from '@/types/events'
import { Button } from '@workspace/ui/shadcn/button'
import { groupEntriesByDivision } from '@/utils/registration-stats'

type PricingReviewPageProps = {
  entries: RegistrationEntry[]
  divisionPricing: DivisionPricing[]
  onSubmit?: () => void
  hideSubmitButton?: boolean
  showPaymentMethods?: boolean
}

export function PricingReviewPage({ entries, divisionPricing, onSubmit, hideSubmitButton = false, showPaymentMethods = false }: PricingReviewPageProps) {
  const router = useRouter()
  const groupedEntries = groupEntriesByDivision(entries)

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit()
    }
    // Navigate to confirmation page
    router.push('./register/confirmation')
  }

  return (
    <div className="space-y-6">
      <PricingBreakdownCard entriesByDivision={groupedEntries} divisionPricing={divisionPricing} />

      {showPaymentMethods && <PaymentMethodsCard />}

      {!hideSubmitButton && (
        <div className="flex justify-end pt-4">
          <Button className="w-fit" onClick={handleSubmit} disabled={!entries.length}>
            Submit Registration
          </Button>
        </div>
      )}
    </div>
  )
}
