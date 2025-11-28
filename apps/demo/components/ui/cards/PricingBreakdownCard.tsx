'use client'

import { useMemo, type ReactNode } from 'react'

import { cn } from '@workspace/ui/lib/utils'
import { Card } from '@workspace/ui/shadcn/card'

import type { RegistrationEntry } from '@/components/features/registration/flow/types'
import type { DivisionPricing } from '@/types/events'
import { formatCurrency, formatFriendlyDate } from '@/utils/format'
import { resolveDivisionPricing } from '@/utils/pricing'
import { getEntryMemberCount } from '@/utils/registration-stats'

type TaxSummary = {
  gstNumber: string
  qstNumber: string
  baseAmount: number
  gstRate: number
  qstRate: number
}

export type PricingBreakdownPanelProps = {
  entriesByDivision: Record<string, RegistrationEntry[]>
  divisionPricing: DivisionPricing[]
  taxSummary?: TaxSummary
}

export type PricingBreakdownCardProps = PricingBreakdownPanelProps & {
  children?: ReactNode
  className?: string
}

export function PricingBreakdownCard({
  className,
  children,
  ...panelProps
}: PricingBreakdownCardProps) {
  return (
    <Card className={cn('rounded-3xl p-6 shadow-sm', className)}>
      <PricingBreakdownPanel {...panelProps} />
      {children ? <div>{children}</div> : null}
    </Card>
  )
}

// Default tax configuration for Quebec
const DEFAULT_TAX_SUMMARY: TaxSummary = {
  gstNumber: '122351737TQ001',
  qstNumber: '784571093RT0001',
  baseAmount: 0,
  gstRate: 0.05,
  qstRate: 0.09975,
}

// Section nickname: "Pricing Snapshot" – summarises totals and pricing tiers.
export function PricingBreakdownPanel({
  entriesByDivision,
  divisionPricing,
  taxSummary,
}: PricingBreakdownPanelProps) {
  const pricingByDivision = useMemo(() => {
    return divisionPricing.reduce<Record<string, DivisionPricing>>((acc, option) => {
      acc[option.name] = option
      return acc
    }, {})
  }, [divisionPricing])

  const pricingSummary = useMemo(() => {
    const referenceDate = new Date()
    return Object.entries(entriesByDivision).map(([divisionName, divisionEntries]) => {
      const participants = divisionEntries.reduce(
        (total, entry) => total + getEntryMemberCount(entry),
        0
      )
      const pricing = pricingByDivision[divisionName]
      if (!pricing) {
        const participantLabel = `${participants} ${participants === 1 ? 'participant' : 'participants'}`
        return {
          division: divisionName,
          participants,
          teams: divisionEntries.length,
          price: 0,
          total: 0,
          unitLabel: `${participantLabel} · pricing unavailable`,
          tierLabel: 'Pricing unavailable',
          hasPricing: false,
        }
      }

      const activeTier = resolveDivisionPricing(pricing, referenceDate)
      const total = participants * activeTier.price
      const participantLabel = `${participants} ${participants === 1 ? 'participant' : 'participants'}`
      const unitLabel = `${participantLabel} × ${formatCurrency(activeTier.price)}`
      const tierLabel =
        activeTier.tier === 'earlyBird'
          ? `Early bird · through ${formatFriendlyDate(pricing.earlyBird!.deadline)}`
          : pricing.earlyBird
            ? 'Regular pricing'
            : 'Standard pricing'

      return {
        division: divisionName,
        participants,
        teams: divisionEntries.length,
        price: activeTier.price,
        total,
        unitLabel,
        tierLabel,
        hasPricing: true,
      }
    })
  }, [entriesByDivision, pricingByDivision])

  const totalDue = pricingSummary.reduce((sum, item) => sum + item.total, 0)
  const hasUnpricedDivision = pricingSummary.some(item => !item.hasPricing && item.participants > 0)

  const hasAnySummary = pricingSummary.length > 0

  // Use provided tax summary or default, with actual baseAmount
  const activeTaxSummary = useMemo(() => {
    const base = taxSummary || DEFAULT_TAX_SUMMARY
    return {
      ...base,
      baseAmount: totalDue,
    }
  }, [taxSummary, totalDue])

  return (
    <div className="space-y-3 body-text">
      {hasAnySummary ? (
        pricingSummary.map(item => (
          <div key={item.division} className="space-y-1">
            <div className="text-foreground flex items-center justify-between">
              <span className="body-text">{item.division}</span>
              <span className="body-text">{formatCurrency(item.total)}</span>
            </div>
            <div className="text-muted-foreground flex flex-col gap-1 body-small sm:flex-row sm:items-center sm:justify-between">
              <span>{item.unitLabel}</span>
              <span className="sm:text-right">{item.tierLabel}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="border-border/60 text-muted-foreground rounded-xl border border-dashed p-4 body-text">
          Add teams to see pricing breakdown by division.
        </div>
      )}
      {hasUnpricedDivision && (
        <p className="body-text text-amber-600">
          Pricing is still pending for at least one division and is excluded from the total.
        </p>
      )}
      <div className="border-border/60 text-foreground space-y-2 border-t pt-3">
        <div className="flex items-center justify-between body-text">
          <span>Subtotal</span>
          <span>{formatCurrency(totalDue)}</span>
        </div>
        <div className="flex items-center justify-between body-text">
          <span>Tax Amount</span>
          <span>{formatCurrency(activeTaxSummary.baseAmount * (activeTaxSummary.gstRate + activeTaxSummary.qstRate))}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="body-large font-semibold">Total</span>
          <span className="body-large font-semibold">
            {formatCurrency(
              activeTaxSummary.baseAmount * (1 + activeTaxSummary.gstRate + activeTaxSummary.qstRate)
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
