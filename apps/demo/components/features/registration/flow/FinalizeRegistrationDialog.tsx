'use client'

import type { ReactNode } from 'react'

import { Button } from '@workspace/ui/shadcn/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/shadcn/dialog'

type FinalizeRegistrationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pricingPanel: ReactNode
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  confirmDisabled?: boolean
}

export function FinalizeRegistrationDialog({
  open,
  onOpenChange,
  pricingPanel,
  title,
  description,
  confirmLabel,
  onConfirm,
  confirmDisabled = false,
}: FinalizeRegistrationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 rounded-xl p-0">
        <DialogHeader className="px-6 pb-4 pt-8">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 px-6 pb-6 pt-2">
          <section className="rounded-xl border border-border/60 bg-muted/20 p-4">{pricingPanel}</section>
          <p className="text-xs text-muted-foreground">
            Submission will reserve your spots and notify the event organizer. You can still edit rosters before the payment
            deadline.
          </p>
        </div>
        <DialogFooter className="flex flex-col gap-2 border-t border-border/60 px-6 py-6 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Go back
          </Button>
          <Button type="button" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
