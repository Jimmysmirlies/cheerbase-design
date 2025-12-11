import { Skeleton } from '@workspace/ui/shadcn/skeleton'
import { cn } from '@workspace/ui/lib/utils'
import { Card, CardContent } from '@workspace/ui/shadcn/card'

type InvoiceSkeletonProps = {
  /** Number of line items to show */
  lineItems?: number
  className?: string
}

/**
 * Skeleton for invoice/payment card sidebar.
 * Shows line items, totals, and action button placeholders.
 */
export function InvoiceSkeleton({ lineItems = 3, className }: InvoiceSkeletonProps) {
  return (
    <Card className={cn('border-border/70 bg-card py-6', className)}>
      <CardContent className="flex flex-col gap-4 px-6 py-0">
        {/* Line items */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: lineItems }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <Skeleton className="h-4 w-32 rounded" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-20 rounded" />
                <Skeleton className="h-3.5 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>

        <div className="h-px w-full bg-border/60" />

        {/* Subtotal and tax */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-16 rounded" />
            <Skeleton className="h-3.5 w-14 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-10 rounded" />
            <Skeleton className="h-3.5 w-12 rounded" />
          </div>
        </div>

        <div className="h-px w-full bg-border/60" />

        {/* Total */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-12 rounded" />
          <Skeleton className="h-7 w-24 rounded" />
        </div>

        <div className="h-px w-full bg-border/60" />

        {/* Action button */}
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="mx-auto h-3.5 w-32 rounded" />
      </CardContent>
    </Card>
  )
}
