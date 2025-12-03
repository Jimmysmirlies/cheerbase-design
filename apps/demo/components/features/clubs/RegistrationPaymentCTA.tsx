'use client'

import { useState } from 'react'

import { Button } from '@workspace/ui/shadcn/button'

import { PaymentMethodsDialog } from '@/components/features/registration/PaymentMethods'

type RegistrationPaymentCTAProps = {
  amountLabel: string
  dueLabel?: string
  description?: string
}

export function RegistrationPaymentCTA({
  amountLabel,
  dueLabel,
  description,
}: RegistrationPaymentCTAProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="rounded-md border border-primary/60 bg-primary/10 px-4 py-4 body-text text-primary">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-semibold">
              Payment Required
              {dueLabel ? <span className="font-normal text-primary/80">{` · Due ${dueLabel}`}</span> : null}
            </p>
            <p className="text-primary/80">
              {description ?? `Complete payment of ${amountLabel} to keep this registration confirmed.`}
            </p>
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            Pay Now
          </Button>
        </div>
      </div>
      <PaymentMethodsDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
