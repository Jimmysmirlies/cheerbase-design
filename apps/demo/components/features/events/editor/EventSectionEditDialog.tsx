'use client'

import { Button } from '@workspace/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/shadcn/dialog'

export type EventSectionEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  onSave: () => void
  onCancel?: () => void
  isSaving?: boolean
  saveButtonText?: string
  cancelButtonText?: string
}

export function EventSectionEditDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSave,
  onCancel,
  isSaving = false,
  saveButtonText = 'Save',
  cancelButtonText = 'Cancel',
}: EventSectionEditDialogProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="py-4">
          {children}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            {cancelButtonText}
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : saveButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



