'use client'

import { useRouter } from 'next/navigation'
import { AlertCircleIcon } from 'lucide-react'

import { Button } from '@workspace/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/shadcn/dialog'

type EditRegistrationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  registrationId: string
}

export function EditRegistrationDialog({ open, onOpenChange, registrationId }: EditRegistrationDialogProps) {
  const router = useRouter()

  const handleConfirm = () => {
    onOpenChange(false)
    router.push(`/clubs/registrations/${registrationId}?mode=edit`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-lg">
        <DialogHeader className="gap-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <AlertCircleIcon className="size-6 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-center">Edit Registration?</DialogTitle>
          <DialogDescription className="text-center">
            Any changes you make to your teams will be reflected in a new invoice. Your current invoice will be updated
            to show the revised totals.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Yes, Edit Registration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
