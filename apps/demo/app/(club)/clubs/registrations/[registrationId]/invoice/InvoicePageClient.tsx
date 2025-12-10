'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { PrinterIcon, ArrowLeftIcon } from 'lucide-react'

import { Button } from '@workspace/ui/shadcn/button'
import { ToggleGroup, ToggleGroupItem } from '@workspace/ui/shadcn/toggle-group'
import { InvoiceView, type InvoiceData, type InvoiceChangeInfo, type InvoiceSelectOption, type InvoiceHistoryItem } from '@/components/features/registration/invoice/InvoiceView'
import { PaymentMethodsDialog } from '@/components/features/registration/PaymentMethods'
import { WalkthroughSpotlight } from '@/components/ui/RegistrationWalkthrough'
import { FadeInSection } from '@/components/ui'
import { formatFriendlyDate } from '@/utils/format'
import { useRegistrationStorage } from '@/hooks/useRegistrationStorage'
import type { RegistrationEntry } from '@/components/features/registration/flow/types'

type LayoutVariant = 'A' | 'B'

function LayoutToggle({
  variant,
  onChange,
}: {
  variant: LayoutVariant
  onChange: (variant: LayoutVariant) => void
}) {
  return (
    <div className="relative inline-flex items-center rounded-md border p-1 transition-all duration-300 border-border/70 bg-muted/40">
      <ToggleGroup
        type="single"
        value={variant}
        onValueChange={v => v && onChange(v as LayoutVariant)}
        className="gap-0"
      >
        {(['A', 'B'] as const).map(v => (
          <ToggleGroupItem
            key={v}
            value={v}
            aria-label={`Layout ${v}`}
            className="size-7 rounded-sm data-[state=on]:bg-background data-[state=on]:shadow-sm text-xs font-semibold"
          >
            {v}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .print-invoice,
    .print-invoice * {
      visibility: visible;
    }
    .print-invoice {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print {
      display: none !important;
    }
  }
`

type InvoicePageClientProps = {
  invoices: InvoiceData[]
  registrationHref: string
  registrationId: string
  originalPaymentStatus: 'paid' | 'unpaid'
}

export function InvoicePageClient({
  invoices,
  registrationHref,
  registrationId,
  originalPaymentStatus,
}: InvoicePageClientProps) {
  // Get saved changes from localStorage to check for past invoices
  const { savedChanges, hasStoredChanges } = useRegistrationStorage(registrationId)

  // Build the full list of invoices including past invoices from saved changes
  const allInvoices = useMemo(() => {
    const baseInvoice = invoices[0]
    if (!baseInvoice) return []

    // If there are saved changes with original invoice info, create both invoices
    if (hasStoredChanges && savedChanges?.originalInvoice && savedChanges?.newInvoice) {
      const removedTeamIds = new Set(savedChanges.removedTeamIds)
      
      // Past invoice entries = base entries (the original registration before changes)
      // These are the entries from the server/database
      const pastEntriesByDivision: Record<string, RegistrationEntry[]> = {}
      for (const [division, entries] of Object.entries(baseInvoice.entriesByDivision)) {
        pastEntriesByDivision[division] = [...entries]
      }

      // Current invoice entries = base entries + added teams - removed teams + modified rosters
      const currentEntriesByDivision: Record<string, RegistrationEntry[]> = {}
      
      // Start with base entries, excluding removed teams and applying roster modifications
      for (const [division, entries] of Object.entries(baseInvoice.entriesByDivision)) {
        const remainingEntries = entries
          .filter(entry => !removedTeamIds.has(entry.id))
          .map(entry => {
            // Check if this entry's roster was modified
            const modifiedRoster = savedChanges.modifiedRosters?.[entry.id] || savedChanges.modifiedRosters?.[entry.teamId ?? '']
            if (modifiedRoster) {
              // Update the entry with new member count from modified roster
              return {
                ...entry,
                teamSize: modifiedRoster.length,
                members: modifiedRoster.map(m => ({
                  name: m.name ?? `${m.firstName} ${m.lastName}`.trim(),
                  type: m.role ? m.role.charAt(0).toUpperCase() + m.role.slice(1) : 'Athlete',
                  dob: m.dob ?? undefined,
                  email: m.email ?? undefined,
                  phone: m.phone ?? undefined,
                })),
              }
            }
            return entry
          })
        if (remainingEntries.length > 0) {
          currentEntriesByDivision[division] = [...remainingEntries]
        }
      }
      
      // Track which divisions have changes
      const newDivisions = new Set<string>()
      const modifiedDivisions = new Set<string>()
      const removedDivisionsSet = new Set<string>()

      // Add new teams from savedChanges
      for (const addedTeam of savedChanges.addedTeams) {
        const division = addedTeam.division
        const newEntry: RegistrationEntry = {
          id: addedTeam.id,
          division: addedTeam.division,
          mode: 'existing',
          teamId: addedTeam.id,
          teamName: addedTeam.name,
          teamSize: addedTeam.members?.length ?? 0,
          members: addedTeam.members?.map(m => ({
            name: `${m.firstName} ${m.lastName}`.trim(),
            type: m.role ? m.role.charAt(0).toUpperCase() + m.role.slice(1) : 'Athlete',
            dob: m.dob ?? undefined,
            email: m.email ?? undefined,
            phone: m.phone ?? undefined,
          })),
        }
        
        // Check if this division already exists (then it's modified) or is entirely new
        if (currentEntriesByDivision[division]) {
          modifiedDivisions.add(division)
        } else {
          newDivisions.add(division)
          currentEntriesByDivision[division] = []
        }
        currentEntriesByDivision[division].push(newEntry)
      }

      // Check for removed teams - mark their divisions as modified or removed
      for (const removedId of removedTeamIds) {
        // Find which division this removed team belonged to
        for (const [division, entries] of Object.entries(baseInvoice.entriesByDivision)) {
          const hadTeam = entries.some(e => e.id === removedId)
          if (hadTeam) {
            // Check if the division still has entries after removal
            const remainingInDivision = currentEntriesByDivision[division]?.length ?? 0
            if (remainingInDivision === 0) {
              removedDivisionsSet.add(division)
            } else {
              modifiedDivisions.add(division)
            }
          }
        }
      }

      // Check for modified rosters - mark their divisions as modified
      if (savedChanges.modifiedRosters) {
        for (const modifiedTeamId of Object.keys(savedChanges.modifiedRosters)) {
          // Find which division this modified team belongs to
          for (const [division, entries] of Object.entries(baseInvoice.entriesByDivision)) {
            const hasTeam = entries.some(e => e.id === modifiedTeamId || e.teamId === modifiedTeamId)
            if (hasTeam && !removedDivisionsSet.has(division)) {
              modifiedDivisions.add(division)
            }
          }
        }
      }

      // Build change info for the invoice
      const changeInfo: InvoiceChangeInfo = {
        newDivisions,
        modifiedDivisions,
        removedDivisions: removedDivisionsSet,
      }

      // Calculate version number based on history
      const pastInvoicesCount = savedChanges.pastInvoices?.length ?? 0
      const currentVersion = pastInvoicesCount + 2 // +1 for original, +1 for current

      // Current invoice (new version after changes) - includes added teams
      const currentInvoice: InvoiceData = {
        ...baseInvoice,
        entriesByDivision: currentEntriesByDivision,
        invoiceNumber: savedChanges.newInvoice.invoiceNumber,
        orderVersion: currentVersion,
        issuedDate: new Date(savedChanges.newInvoice.invoiceDate),
        status: 'unpaid', // New invoice is unpaid
        changeInfo,
        originalEntriesByDivision: pastEntriesByDivision, // For showing "was X" on modified items
      }

      // Original invoice (first version before any changes)
      // If original was unpaid, mark as 'void' since it's superseded
      // If original was paid, keep as 'paid'
      const originalInvoice: InvoiceData = {
        ...baseInvoice,
        entriesByDivision: pastEntriesByDivision,
        invoiceNumber: savedChanges.originalInvoice.invoiceNumber,
        orderVersion: 1,
        issuedDate: new Date(savedChanges.originalInvoice.invoiceDate),
        status: originalPaymentStatus === 'paid' ? 'paid' : 'void',
        payments: originalPaymentStatus === 'paid' ? [{
          amount: savedChanges.originalInvoice.total,
          method: 'Visa',
          lastFour: '4242',
          date: new Date(savedChanges.originalInvoice.invoiceDate),
        }] : [],
      }

      // Build intermediate invoices from pastInvoices array
      const intermediateInvoices: InvoiceData[] = (savedChanges.pastInvoices ?? []).map((pastInv, idx) => ({
        ...baseInvoice,
        invoiceNumber: pastInv.invoiceNumber,
        orderVersion: idx + 2, // Version 2, 3, 4, etc.
        issuedDate: new Date(pastInv.invoiceDate),
        status: pastInv.status ?? 'void', // Past invoices are typically void
        payments: [],
        // Note: We don't have the exact entriesByDivision for intermediate invoices
        // They would need to be reconstructed from the change snapshots if needed
      }))

      return [currentInvoice, ...intermediateInvoices, originalInvoice]
    }

    // No changes - just return the base invoice
    return [baseInvoice]
  }, [invoices, hasStoredChanges, savedChanges, originalPaymentStatus])

  const normalizedInvoices = useMemo(
    () =>
      allInvoices.map(invoice => ({
        ...invoice,
        issuedDate: new Date(invoice.issuedDate),
        payments: invoice.payments?.map(payment => ({ ...payment, date: new Date(payment.date) })) ?? [],
      })),
    [allInvoices]
  )

  // Sort by version number (higher version = current), not by date
  const sortedInvoices = useMemo(
    () => [...normalizedInvoices].sort((a, b) => b.orderVersion - a.orderVersion),
    [normalizedInvoices]
  )
  
  // Current invoice is the one with highest version number
  const currentInvoice = sortedInvoices[0] ?? null
  const currentInvoiceNumber = currentInvoice?.invoiceNumber ?? ''
  const pastInvoices = sortedInvoices.slice(1)
  
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState(currentInvoiceNumber)
  const [isPrinting, setIsPrinting] = useState(false)
  const [showPaymentMethods, setShowPaymentMethods] = useState(false)
  const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>('A')

  const selectedInvoice =
    sortedInvoices.find(inv => inv.invoiceNumber === selectedInvoiceNumber) ?? currentInvoice

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 100)
  }

  // Determine if invoice is payable (not paid or void)
  const isPayable = selectedInvoice?.status !== 'paid' && selectedInvoice?.status !== 'void'

  // Build invoice options for the selector
  const invoiceOptions: InvoiceSelectOption[] = sortedInvoices.map((invoice, idx) => ({
    invoiceNumber: invoice.invoiceNumber,
    label: `#${invoice.invoiceNumber}`,
    isCurrent: idx === 0,
    status: invoice.status,
  }))

  // Build invoice history for activity timeline (sorted oldest to newest)
  const invoiceHistory: InvoiceHistoryItem[] = sortedInvoices
    .map((invoice, idx) => ({
      invoiceNumber: invoice.invoiceNumber,
      issuedDate: invoice.issuedDate,
      isCurrent: idx === 0,
    }))
    .sort((a, b) => new Date(a.issuedDate).getTime() - new Date(b.issuedDate).getTime())

  // Shared actions for InvoiceView
  const invoiceActions = (
    <>
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <PrinterIcon className="mr-2 h-4 w-4" />
        Print
      </Button>
      {isPayable && (
        <WalkthroughSpotlight step="complete" side="bottom" align="end">
          <Button size="sm" onClick={() => setShowPaymentMethods(true)}>
            Pay Invoice
          </Button>
        </WalkthroughSpotlight>
      )}
    </>
  )

  // Sidebar component for Layout A
  const Sidebar = (
    <FadeInSection className="hidden lg:block border-l border-border" delay={120}>
      <aside className="sticky top-8 w-full pl-4">
        <div className="space-y-3 text-sm">
          <div className="text-muted-foreground text-xs uppercase tracking-wide">Current Invoice</div>
          {currentInvoice && (
            <div className="border-b border-border pb-3">
              <button
                type="button"
                className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm transition ${
                  selectedInvoiceNumber === currentInvoiceNumber 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground hover:bg-muted hover:text-primary'
                }`}
                aria-label="Current invoice"
                onClick={() => setSelectedInvoiceNumber(currentInvoiceNumber)}
              >
                <span className="font-medium">#{currentInvoiceNumber}</span>
                <span className="text-muted-foreground text-xs">
                  {formatFriendlyDate(currentInvoice.issuedDate)}
                </span>
              </button>
            </div>
          )}
          <div className="text-muted-foreground text-xs uppercase tracking-wide pt-2">Past Invoices</div>
          {pastInvoices.length > 0 ? (
            <div className="flex flex-col gap-1">
              {pastInvoices.map(invoice => (
                <button
                  key={invoice.invoiceNumber}
                  type="button"
                  onClick={() => setSelectedInvoiceNumber(invoice.invoiceNumber)}
                  className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm transition ${
                    invoice.invoiceNumber === selectedInvoiceNumber
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted hover:text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">#{invoice.invoiceNumber}</span>
                    {invoice.status === 'paid' && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                        Paid
                      </span>
                    )}
                    {invoice.status === 'void' && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        Void
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {formatFriendlyDate(invoice.issuedDate)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border/60 p-4 text-center">
              <p className="text-xs text-muted-foreground">No past invoices</p>
            </div>
          )}
        </div>
      </aside>
    </FadeInSection>
  )


  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      <section className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8">
          {/* Header with back button and layout toggle */}
          <FadeInSection className="no-print mb-6">
            <div className="flex items-center justify-between">
              <Button asChild variant="ghost" size="icon" className="-ml-2 h-10 w-10">
                <Link href={registrationHref} aria-label="Back to registration">
                  <ArrowLeftIcon className="size-5" />
                </Link>
              </Button>
              <LayoutToggle variant={layoutVariant} onChange={setLayoutVariant} />
            </div>
          </FadeInSection>

          {layoutVariant === 'A' ? (
            // LAYOUT A: Two-column with sidebar, plain text title
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                <FadeInSection className="flex flex-col gap-6">
                  {selectedInvoice ? (
                    <InvoiceView 
                      invoice={selectedInvoice} 
                      variant={isPrinting ? 'print' : 'web'}
                      actions={invoiceActions}
                      invoiceHistory={invoiceHistory}
                    />
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-muted-foreground">
                      No invoices available for this registration yet.
                    </div>
                  )}
                </FadeInSection>
                {Sidebar}
              </div>
          ) : (
            // LAYOUT B: Single column, TextSelect dropdown for invoice selection
            <FadeInSection className="flex flex-col gap-6">
              {selectedInvoice ? (
                <InvoiceView 
                  invoice={selectedInvoice} 
                  variant={isPrinting ? 'print' : 'web'}
                  invoiceOptions={invoiceOptions}
                  onInvoiceSelect={setSelectedInvoiceNumber}
                  actions={invoiceActions}
                  invoiceHistory={invoiceHistory}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-muted-foreground">
                  No invoices available for this registration yet.
                </div>
              )}
            </FadeInSection>
          )}
        </div>
      </section>

      <PaymentMethodsDialog 
        open={showPaymentMethods} 
        onOpenChange={setShowPaymentMethods} 
      />
    </>
  )
}
