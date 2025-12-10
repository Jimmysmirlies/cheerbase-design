'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/shadcn/button'
import { PaymentMethodsDialog } from './PaymentMethods'

type PayButtonProps = {
  amount: string
  className?: string
}

export function PayButton({ amount, className }: PayButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button className={className} onClick={() => setIsDialogOpen(true)}>
        Pay {amount}
      </Button>
      <PaymentMethodsDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  )
}


