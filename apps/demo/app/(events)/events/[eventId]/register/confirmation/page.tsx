'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2Icon, CreditCardIcon } from 'lucide-react'
import { Button } from '@workspace/ui/shadcn/button'
import { Card } from '@workspace/ui/shadcn/card'
import { PaymentMethodsDialog } from '@/components/features/registration/PaymentMethods'

// In production, this would come from the registration submission response
const MOCK_REGISTRATION_ID = 'reg_001'

export default function RegistrationConfirmationPage() {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-10">
      <Card className="p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2Icon className="h-10 w-10 text-emerald-600" />
          </div>
        </div>

        <h1 className="heading-1 mb-4">Registration Complete!</h1>

        <p className="body-large text-muted-foreground mb-8">
          You have officially registered for this event. An invoice has been generated and sent to your email.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href={`/clubs/registrations/${MOCK_REGISTRATION_ID}`}>View Registration</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/clubs/registrations/${MOCK_REGISTRATION_ID}/invoice`}>View Invoice</Link>
          </Button>
          <Button variant="outline" onClick={() => setPaymentDialogOpen(true)}>
            <CreditCardIcon className="mr-2 h-4 w-4" />
            Payment Methods
          </Button>
        </div>
      </Card>

      <PaymentMethodsDialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen} />
    </div>
  )
}
