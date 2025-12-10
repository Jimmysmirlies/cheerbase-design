'use client'

import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { CheckCircle2Icon, FileTextIcon, SendIcon, CreditCardIcon, ClockIcon, RefreshCwIcon } from 'lucide-react'
import { TextSelect, type TextSelectSection } from '@workspace/ui/components/text-select'
import { formatCurrency, formatFriendlyDate } from '@/utils/format'
import type { RegistrationEntry } from '../flow/types'
import type { DivisionPricing } from '@/types/events'
import { getEntryMemberCount } from '@/utils/registration-stats'
import { resolveDivisionPricing } from '@/utils/pricing'

export type InvoiceChangeInfo = {
  newDivisions: Set<string>
  modifiedDivisions: Set<string>
  removedDivisions: Set<string>
}

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
  status?: 'paid' | 'partial' | 'unpaid' | 'void'
  gstNumber?: string
  qstNumber?: string
  gstRate?: number
  qstRate?: number
  changeInfo?: InvoiceChangeInfo
  // Original entries for showing "was X" on modified items
  originalEntriesByDivision?: Record<string, RegistrationEntry[]>
  // Additional metadata
  dueDate?: Date
  billedToEmail?: string
}

export type InvoiceSelectOption = {
  invoiceNumber: string
  label: string
  isCurrent?: boolean
  status?: 'paid' | 'unpaid' | 'void' | 'partial'
}

export type InvoiceHistoryItem = {
  invoiceNumber: string
  issuedDate: Date
  isCurrent?: boolean
}

export type InvoiceViewProps = {
  invoice: InvoiceData
  variant?: 'web' | 'print'
  actions?: ReactNode
  // For invoice selector dropdown
  invoiceOptions?: InvoiceSelectOption[]
  onInvoiceSelect?: (invoiceNumber: string) => void
  // Full invoice history for activity timeline
  invoiceHistory?: InvoiceHistoryItem[]
}

export function InvoiceView({ invoice, variant = 'web', actions, invoiceOptions, onInvoiceSelect, invoiceHistory }: InvoiceViewProps) {
  const {
    invoiceNumber,
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
    dueDate,
    billedToEmail = 'billing@club.com',
  } = invoice

  const pricingByDivision = useMemo(() => {
    return divisionPricing.reduce<Record<string, DivisionPricing>>((acc, option) => {
      acc[option.name] = option
      return acc
    }, {})
  }, [divisionPricing])

  const changeInfo = invoice.changeInfo
  const originalEntriesByDivision = invoice.originalEntriesByDivision

  const lineItems = useMemo(() => {
    const referenceDate = issuedDate || new Date()
    return Object.entries(entriesByDivision).map(([divisionName, entries]) => {
      const qty = entries.reduce((sum, entry) => sum + getEntryMemberCount(entry), 0)
      const pricing = pricingByDivision[divisionName]

      // Calculate original qty if we have original entries
      const originalEntries = originalEntriesByDivision?.[divisionName]
      const originalQty = originalEntries 
        ? originalEntries.reduce((sum, entry) => sum + getEntryMemberCount(entry), 0)
        : undefined

      // Determine change status
      let changeStatus: 'new' | 'modified' | 'removed' | null = null
      if (changeInfo) {
        if (changeInfo.newDivisions.has(divisionName)) {
          changeStatus = 'new'
        } else if (changeInfo.modifiedDivisions.has(divisionName)) {
          changeStatus = 'modified'
        } else if (changeInfo.removedDivisions.has(divisionName)) {
          changeStatus = 'removed'
        }
      }

      if (!pricing) {
        return {
          category: divisionName,
          qty,
          originalQty: changeStatus === 'modified' && originalQty !== qty ? originalQty : undefined,
          unit: 0,
          lineTotal: 0,
          changeStatus,
        }
      }

      const activeTier = resolveDivisionPricing(pricing, referenceDate)
      return {
        category: divisionName,
        qty,
        originalQty: changeStatus === 'modified' && originalQty !== qty ? originalQty : undefined,
        unit: activeTier.price,
        lineTotal: qty * activeTier.price,
        changeStatus,
      }
    })
  }, [entriesByDivision, pricingByDivision, issuedDate, changeInfo, originalEntriesByDivision])

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
  const gstAmount = subtotal * gstRate
  const qstAmount = subtotal * qstRate
  const totalTax = gstAmount + qstAmount
  const total = subtotal + totalTax

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const balanceDue = total - totalPaid

  const isPrint = variant === 'print'

  // Build activity timeline - includes full history if provided
  const activityItems = useMemo(() => {
    const items: Array<{ icon: typeof FileTextIcon; label: string; date: Date; highlight?: boolean }> = []
    
    // If we have invoice history, build timeline from all invoices
    if (invoiceHistory && invoiceHistory.length > 0) {
      // Sort history by date (oldest first for processing)
      const sortedHistory = [...invoiceHistory].sort(
        (a, b) => new Date(a.issuedDate).getTime() - new Date(b.issuedDate).getTime()
      )
      
      sortedHistory.forEach((historyItem, idx) => {
        const invDate = new Date(historyItem.issuedDate)
        const isFirstInvoice = idx === 0
        
        if (isFirstInvoice) {
          // First invoice - just "Invoice created"
          items.push({
            icon: FileTextIcon,
            label: `Invoice #${historyItem.invoiceNumber} created`,
            date: invDate,
          })
        } else {
          // Subsequent invoices - "Registration Updated"
          items.push({
            icon: RefreshCwIcon,
            label: `Registration Updated - Invoice #${historyItem.invoiceNumber} created`,
            date: invDate,
          })
        }
        
        // Invoice sent (simulated - a day after creation)
        const sentDate = new Date(invDate)
        sentDate.setDate(sentDate.getDate() + 1)
        items.push({
          icon: SendIcon,
          label: `Invoice #${historyItem.invoiceNumber} sent to ${billedToEmail}`,
          date: sentDate,
        })
      })
    } else {
      // Fallback: just current invoice
      items.push({
        icon: FileTextIcon,
        label: `Invoice #${invoiceNumber} created`,
        date: issuedDate,
      })

      // Invoice sent (simulated - a day after creation)
      const sentDate = new Date(issuedDate)
      sentDate.setDate(sentDate.getDate() + 1)
      items.push({
        icon: SendIcon,
        label: `Invoice #${invoiceNumber} sent to ${billedToEmail}`,
        date: sentDate,
      })
    }

    // Payments
    payments.forEach(payment => {
      items.push({
        icon: CreditCardIcon,
        label: `Payment received: ${formatCurrency(payment.amount)} (${payment.method} ••${payment.lastFour})`,
        date: payment.date,
        highlight: true,
      })
    })

    // Sort by date ascending (oldest first, reading top to bottom)
    return items.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [issuedDate, invoiceNumber, payments, billedToEmail, invoiceHistory])

  // Status badge component
  const StatusBadge = () => {
    if (status === 'void') {
      return (
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-1 rounded">
          VOID
        </span>
      )
    }
    if (status === 'unpaid') {
      return (
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-900 bg-amber-100 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100 px-2 py-1 rounded">
          UNPAID
        </span>
      )
    }
    if (status === 'paid') {
      return (
        <span className="text-xs font-semibold uppercase tracking-wide text-green-900 bg-green-100 border border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100 px-2 py-1 rounded">
          PAID
        </span>
      )
    }
    return (
      <span className="text-xs font-semibold uppercase tracking-wide text-blue-900 bg-blue-100 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100 px-2 py-1 rounded">
        PARTIAL
      </span>
    )
  }

  // Build invoice select sections if there are multiple invoices
  const hasMultipleInvoices = invoiceOptions && invoiceOptions.length > 1
  const invoiceSelectSections: TextSelectSection[] | undefined = hasMultipleInvoices
    ? [
        {
          label: 'Current',
          options: invoiceOptions
            .filter(opt => opt.isCurrent)
            .map(opt => ({ value: opt.invoiceNumber, label: `#${opt.invoiceNumber}` })),
        },
        {
          label: 'Past Invoices',
          options: invoiceOptions
            .filter(opt => !opt.isCurrent)
            .map(opt => ({ value: opt.invoiceNumber, label: `#${opt.invoiceNumber}` })),
          showDivider: true,
        },
      ].filter(section => section.options.length > 0)
    : undefined

  return (
    <div className={isPrint ? 'print-invoice' : 'flex flex-col gap-8'}>
      {/* Invoice Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              {hasMultipleInvoices && onInvoiceSelect ? (
                <TextSelect
                  value={invoiceNumber}
                  onValueChange={onInvoiceSelect}
                  sections={invoiceSelectSections}
                  size="large"
                  triggerClassName="heading-2 text-foreground"
                  itemClassName="text-lg font-semibold"
                  contentClassName="min-w-[220px]"
                />
              ) : (
                <h1 className={isPrint ? 'text-2xl font-bold' : 'heading-2'}>
                  #{invoiceNumber}
                </h1>
              )}
              {!isPrint && <StatusBadge />}
            </div>
            <p className="body-text text-muted-foreground">
              Billed to <span className="text-foreground font-medium">{clubName}</span> · {formatCurrency(total)}
            </p>
          </div>
          {!isPrint && actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="flex flex-col gap-4">
        <div className="h-px w-full bg-border" />
        <div className="flex items-center justify-between gap-4">
          <p className="heading-4">Summary</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Left: Billed To */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <p className="label text-muted-foreground">Billed to</p>
              <p className="body-text text-foreground font-medium">{clubName}</p>
              <p className="body-small text-muted-foreground">{billedToEmail}</p>
            </div>
          </div>

          {/* Right: Invoice Details */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <p className="label text-muted-foreground">Invoice number</p>
                <p className="body-text text-foreground">{invoiceNumber}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="label text-muted-foreground">Issued</p>
                <p className="body-text text-foreground">{formatFriendlyDate(issuedDate)}</p>
              </div>
              {dueDate && (
                <div className="flex flex-col gap-1">
                  <p className="label text-muted-foreground">Due date</p>
                  <p className="body-text text-foreground">{formatFriendlyDate(dueDate)}</p>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <p className="label text-muted-foreground">Event</p>
                <p className="body-text text-foreground">{eventName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      {!isPrint && activityItems.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="h-px w-full bg-border" />
          <p className="heading-4">Recent Activity</p>
          <div className="relative flex flex-col gap-4">
            {/* Vertical timeline line */}
            {activityItems.length > 1 && (
              <div 
                className="absolute left-4 top-4 bottom-4 w-px bg-border -translate-x-1/2"
                aria-hidden="true"
              />
            )}
            {activityItems.map((item, idx) => (
              <div key={idx} className="relative flex items-start gap-3">
                <div className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${
                  item.highlight 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-muted'
                }`}>
                  <item.icon className={`size-4 ${
                    item.highlight 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex flex-col gap-0.5 pt-1">
                  <p className="body-small text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{formatFriendlyDate(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Charges Section */}
      <div className="flex flex-col gap-4">
        <div className="h-px w-full bg-border" />
        <p className="heading-4">Current Charges</p>
        <div className="overflow-x-auto">
          <table className="w-full body-text">
            <thead className="border-b border-border/60">
              <tr className="text-left">
                <th className="pb-3 font-medium text-muted-foreground">Category</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Qty</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Unit</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr 
                  key={idx} 
                  className={`border-b border-border/30 ${item.changeStatus === 'removed' ? 'opacity-60' : ''}`}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className={item.changeStatus === 'removed' ? 'line-through' : ''}>
                        {item.category}
                      </span>
                      {item.changeStatus === 'new' && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                          New
                        </span>
                      )}
                      {item.changeStatus === 'modified' && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                          Modified
                        </span>
                      )}
                      {item.changeStatus === 'removed' && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                          Removed
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`py-3 text-right ${item.changeStatus === 'removed' ? 'line-through' : ''}`}>
                    {item.qty}
                    {item.originalQty !== undefined && (
                      <span className="ml-1 text-amber-600 dark:text-amber-400">
                        (was {item.originalQty})
                      </span>
                    )}
                  </td>
                  <td className={`py-3 text-right ${item.changeStatus === 'removed' ? 'line-through' : ''}`}>
                    {formatCurrency(item.unit)}
                  </td>
                  <td className={`py-3 text-right ${item.changeStatus === 'removed' ? 'line-through' : ''}`}>
                    {item.changeStatus === 'new' && '+'}
                    {item.changeStatus === 'removed' && '-'}
                    {formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2 border-t border-border/60 pt-4">
          <div className="flex items-center justify-between body-text">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between body-small text-muted-foreground">
            <span>QST ({qstNumber})</span>
            <span>{formatCurrency(qstAmount)}</span>
          </div>
          <div className="flex items-center justify-between body-small text-muted-foreground">
            <span>GST ({gstNumber})</span>
            <span>{formatCurrency(gstAmount)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-3 mt-3">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-lg font-semibold text-foreground">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Payments Section */}
      {payments.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="h-px w-full bg-border" />
          <p className="heading-4">Payments</p>
          <div className="space-y-3">
            {payments.map((payment, idx) => (
              <div key={idx} className="flex items-center justify-between body-text">
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="size-4 text-green-600 dark:text-green-400" />
                  <span>
                    {formatCurrency(payment.amount)} ({payment.method} ••{payment.lastFour})
                  </span>
                </div>
                <span className="text-muted-foreground body-small">
                  {formatFriendlyDate(payment.date)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-4">
            <span className="font-semibold text-foreground">Balance Due</span>
            <span className="text-lg font-semibold text-foreground">{formatCurrency(balanceDue)}</span>
          </div>
        </div>
      )}

      {/* Amount Due (when no payments) */}
      {payments.length === 0 && status !== 'void' && (
        <div className="flex flex-col gap-4">
          <div className="h-px w-full bg-border" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClockIcon className="size-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">Amount Due</span>
            </div>
            <span className="text-lg font-semibold text-foreground">{formatCurrency(total)}</span>
          </div>
          {dueDate && (
            <p className="text-sm text-muted-foreground">
              Payment due by {formatFriendlyDate(dueDate)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
