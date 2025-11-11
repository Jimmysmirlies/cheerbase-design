'use client'

import { useMemo, type ReactNode } from 'react'

import { cn } from '@workspace/ui/lib/utils'
import { Card } from '@workspace/ui/shadcn/card'

import type { RegistrationEntry } from '@/components/features/registration/flow/types'
import type { DivisionPricing } from '@/types/events'
import { formatCurrency, formatFriendlyDate } from '@/utils/format'
import { resolveDivisionPricing } from '@/utils/pricing'

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
    <Card className={cn('rounded-3xl p-4 shadow-sm', className)}>
      <PricingBreakdownPanel {...panelProps} />
      {children ? <div className="mt-4">{children}</div> : null}
    </Card>
  )
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

  const totalTeams = useMemo(
    () => Object.values(entriesByDivision).reduce((sum, list) => sum + list.length, 0),
    [entriesByDivision]
  )
  const totalParticipants = pricingSummary.reduce((sum, item) => sum + item.participants, 0)
  const totalDue = pricingSummary.reduce((sum, item) => sum + item.total, 0)
  const hasUnpricedDivision = pricingSummary.some(item => !item.hasPricing && item.participants > 0)

  const hasAnySummary = pricingSummary.length > 0

  return (
    <div className="space-y-3 text-sm">
      {hasAnySummary ? (
        pricingSummary.map(item => (
          <div key={item.division} className="space-y-1">
            <div className="text-foreground flex items-center justify-between">
              <span>{item.division}</span>
              <span>{formatCurrency(item.total)}</span>
            </div>
            <div className="text-muted-foreground flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between">
              <span>{item.unitLabel}</span>
              <span className="sm:text-right">{item.tierLabel}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="border-border/60 text-muted-foreground rounded-xl border border-dashed p-4 text-xs">
          Add teams to see pricing breakdown by division.
        </div>
      )}
      {hasUnpricedDivision && (
        <p className="text-xs text-amber-600">
          Pricing is still pending for at least one division and is excluded from the total.
        </p>
      )}
      <div className="border-border/60 text-foreground space-y-2 border-t pt-3">
        <div className="flex items-center justify-between">
          <span>Total teams</span>
          <span>{totalTeams}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Total participants</span>
          <span>{totalParticipants}</span>
        </div>
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Subtotal</span>
          <span>{formatCurrency(totalDue)}</span>
        </div>
      </div>
      {taxSummary ? (
        <div className="border-border/60 mt-4 rounded-xl border px-4 py-3 text-sm">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span>GST ({Math.round(taxSummary.gstRate * 100)}%)</span>
              <span>{formatCurrency(taxSummary.baseAmount * taxSummary.gstRate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>QST ({Math.round(taxSummary.qstRate * 100)}%)</span>
              <span>{formatCurrency(taxSummary.baseAmount * taxSummary.qstRate)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-base font-semibold">
              <span>Total due</span>
              <span>
                {formatCurrency(
                  taxSummary.baseAmount * (1 + taxSummary.gstRate + taxSummary.qstRate)
                )}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function getEntryMemberCount(entry: RegistrationEntry): number {
  return entry.members?.length ?? entry.teamSize ?? 0
}
