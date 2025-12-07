'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { DownloadIcon, PrinterIcon, ArrowLeftIcon } from 'lucide-react'

import { Button } from '@workspace/ui/shadcn/button'
import { InvoiceView, type InvoiceData } from '@/components/features/registration/invoice/InvoiceView'
import { FadeInSection } from '@/components/ui'
import { formatFriendlyDate } from '@/utils/format'

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
}

export function InvoicePageClient({
  invoices,
  registrationHref,
}: InvoicePageClientProps) {
  const normalizedInvoices = useMemo(
    () =>
      invoices.map(invoice => ({
        ...invoice,
        issuedDate: new Date(invoice.issuedDate),
        payments: invoice.payments?.map(payment => ({ ...payment, date: new Date(payment.date) })) ?? [],
      })),
    [invoices]
  )

  const sortedInvoices = useMemo(
    () => [...normalizedInvoices].sort((a, b) => b.issuedDate.getTime() - a.issuedDate.getTime()),
    [normalizedInvoices]
  )
  const currentInvoiceNumber = sortedInvoices[0]?.invoiceNumber ?? ''
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState(currentInvoiceNumber)
  const [isPrinting, setIsPrinting] = useState(false)

  const selectedInvoice =
    sortedInvoices.find(inv => inv.invoiceNumber === selectedInvoiceNumber) ?? (sortedInvoices[0] ?? null)

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 100)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      <section className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-10">
          <FadeInSection className="flex flex-1 flex-col gap-4">
            <div className="no-print flex items-center justify-between">
              <Button asChild variant="ghost" size="icon" className="-ml-2 h-10 w-10">
                <Link href={registrationHref} aria-label="Back to registration">
                  <ArrowLeftIcon className="size-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handlePrint}>
                  <PrinterIcon className="mr-2 h-4 w-4" />
                  Print Invoice
                </Button>
                <Button variant="outline">
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
            {selectedInvoice ? (
              <InvoiceView invoice={selectedInvoice} variant={isPrinting ? 'print' : 'web'} />
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-muted-foreground">
                No invoices available for this registration yet.
              </div>
            )}
          </FadeInSection>

          <FadeInSection className="w-64 shrink-0" delay={120}>
            <aside className="w-full border-l border-border pl-4">
              <div className="space-y-3 text-sm">
                <div className="text-muted-foreground text-xs uppercase tracking-wide">Current Invoice</div>
                <div className="border-b border-border pb-3">
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between text-left transition ${
                      selectedInvoiceNumber === currentInvoiceNumber ? 'text-primary' : 'text-foreground hover:text-primary'
                    }`}
                    aria-label="Current invoice"
                    onClick={() => setSelectedInvoiceNumber(currentInvoiceNumber)}
                  >
                    <span className="body-text font-medium">#{currentInvoiceNumber}</span>
                    <span className="text-muted-foreground text-xs">
                      {selectedInvoice ? formatFriendlyDate(selectedInvoice.issuedDate) : 'N/A'}
                    </span>
                  </button>
                </div>
                {sortedInvoices.length > 1 ? (
                  <>
                    <div className="text-muted-foreground text-xs uppercase tracking-wide pt-2">Past Invoices</div>
                    <div className="flex flex-col divide-y divide-border">
                      {sortedInvoices
                        .filter(inv => inv.invoiceNumber !== currentInvoiceNumber)
                        .map(invoice => (
                          <button
                            key={invoice.invoiceNumber}
                            type="button"
                            onClick={() => setSelectedInvoiceNumber(invoice.invoiceNumber)}
                            className={`flex h-10 w-full items-center justify-between text-left transition ${
                              invoice.invoiceNumber === selectedInvoiceNumber
                                ? 'text-primary border-b border-primary'
                                : 'text-foreground hover:text-primary'
                            }`}
                          >
                            <span className="body-text font-medium">#{invoice.invoiceNumber}</span>
                            <span className="text-muted-foreground text-xs">
                              {formatFriendlyDate(invoice.issuedDate)}
                            </span>
                          </button>
                        ))}
                    </div>
                  </>
                ) : null}
              </div>
            </aside>
          </FadeInSection>
        </div>
      </section>
    </>
  )
}
