'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@workspace/ui/shadcn/card'
import { Badge } from '@workspace/ui/shadcn/badge'
import { formatCurrency, formatFriendlyDate } from '@/utils/format'
import type { RegistrationEntry } from '../flow/types'
import type { DivisionPricing } from '@/types/events'
import { getEntryMemberCount } from '@/utils/registration-stats'
import { resolveDivisionPricing } from '@/utils/pricing'

export type InvoiceData = {
  invoiceNumber: string
  orderVersion: number
  issuedDate: Date
  eventName: string
  clubName: string
  entriesByDivision: Record<string, RegistrationEntry[]>
  divisionPricing: DivisionPricing[]
  payments?: Array<{
    amount: number
    method: string
    lastFour: string
    date: Date
  }>
  status?: 'paid' | 'partial' | 'unpaid'
  gstNumber?: string
  qstNumber?: string
  gstRate?: number
  qstRate?: number
}

export type InvoiceViewProps = {
  invoice: InvoiceData
  variant?: 'web' | 'print'
}

export function InvoiceView({ invoice, variant = 'web' }: InvoiceViewProps) {
  const {
    invoiceNumber,
    orderVersion,
    issuedDate,
    eventName,
    clubName,
    entriesByDivision,
    divisionPricing,
    payments = [],
    status = 'unpaid',
    gstNumber = '122351737TQ001',
    qstNumber = '784571093RT0001',
    gstRate = 0.05,
    qstRate = 0.09975,
  } = invoice

  const pricingByDivision = useMemo(() => {
    return divisionPricing.reduce<Record<string, DivisionPricing>>((acc, option) => {
      acc[option.name] = option
      return acc
    }, {})
  }, [divisionPricing])

  const lineItems = useMemo(() => {
    const referenceDate = issuedDate || new Date()
    return Object.entries(entriesByDivision).map(([divisionName, entries]) => {
      const qty = entries.reduce((sum, entry) => sum + getEntryMemberCount(entry), 0)
      const pricing = pricingByDivision[divisionName]

      if (!pricing) {
        return {
          category: divisionName,
          qty,
          unit: 0,
          lineTotal: 0,
        }
      }

      const activeTier = resolveDivisionPricing(pricing, referenceDate)
      return {
        category: divisionName,
        qty,
        unit: activeTier.price,
        lineTotal: qty * activeTier.price,
      }
    })
  }, [entriesByDivision, pricingByDivision, issuedDate])

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
  const gstAmount = subtotal * gstRate
  const qstAmount = subtotal * qstRate
  const totalTax = gstAmount + qstAmount
  const total = subtotal + totalTax

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const balanceDue = total - totalPaid

  const isPrint = variant === 'print'

  return (
    <div className={isPrint ? 'print-invoice' : ''}>
      <Card className={isPrint ? 'shadow-none border-none' : 'rounded-3xl shadow-sm'}>
        <CardHeader className={isPrint ? 'p-8' : 'p-6'}>
          <div className="flex items-start justify-between">
            <div>
              <h1 className={isPrint ? 'text-2xl font-bold mb-1' : 'heading-2 mb-1'}>
                Invoice #{invoiceNumber}
              </h1>
              <p className="text-muted-foreground body-text">
                Issued: {formatFriendlyDate(issuedDate)}
              </p>
            </div>
            {!isPrint && status && (
              <Badge
                variant={status === 'paid' ? 'default' : status === 'partial' ? 'secondary' : 'outline'}
                className="text-xs font-semibold"
              >
                {status === 'paid' ? 'Paid' : status === 'partial' ? 'Partially Paid' : 'Unpaid'}
              </Badge>
            )}
          </div>

          <div className="mt-4 text-muted-foreground body-small">
            <p>Order: v{orderVersion} | Event: {eventName} | Club: {clubName}</p>
          </div>
        </CardHeader>

        <CardContent className={isPrint ? 'p-8 pt-0' : 'p-6 pt-0'}>
          {/* A. CURRENT CHARGES */}
          <div className="mb-6">
            <h2 className={isPrint ? 'text-lg font-semibold mb-3' : 'heading-4 mb-3'}>
              Current Charges
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full body-text">
                <thead className="border-b border-border/60">
                  <tr className="text-left">
                    <th className="pb-2 font-medium">Category</th>
                    <th className="pb-2 text-right font-medium">Qty</th>
                    <th className="pb-2 text-right font-medium">Unit</th>
                    <th className="pb-2 text-right font-medium">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-border/30">
                      <td className="py-3">{item.category}</td>
                      <td className="py-3 text-right">{item.qty}</td>
                      <td className="py-3 text-right">{formatCurrency(item.unit)}</td>
                      <td className="py-3 text-right">{formatCurrency(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
              <div className="flex items-center justify-between body-text">
                <span>Subtotal (before tax)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between body-text text-muted-foreground">
                <span>QST: {qstNumber}</span>
                <span>{formatCurrency(qstAmount)}</span>
              </div>
              <div className="flex items-center justify-between body-text text-muted-foreground">
                <span>GST: {gstNumber}</span>
                <span>{formatCurrency(gstAmount)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 pt-2">
                <span className="body-large font-semibold">Total</span>
                <span className="body-large font-semibold">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* B. PAYMENTS */}
          {payments.length > 0 && (
            <div className="mb-6">
              <h2 className={isPrint ? 'text-lg font-semibold mb-3' : 'heading-4 mb-3'}>Payments</h2>
              <div className="space-y-2">
                {payments.map((payment, idx) => (
                  <div key={idx} className="flex items-center justify-between body-text">
                    <span>
                      Payment received: {formatCurrency(payment.amount)} ({payment.method} ••{payment.lastFour})
                    </span>
                    <span className="text-muted-foreground body-small">
                      {formatFriendlyDate(payment.date)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                <span className="body-large font-semibold">Balance Due</span>
                <span className="body-large font-semibold">{formatCurrency(balanceDue)}</span>
              </div>
            </div>
          )}

          {/* Show amount due when no payments */}
          {payments.length === 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between border-t border-border/60 pt-4">
                <span className="body-large font-semibold">Amount Due</span>
                <span className="body-large font-semibold">{formatCurrency(total)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
