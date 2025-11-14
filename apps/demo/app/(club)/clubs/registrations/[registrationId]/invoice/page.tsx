'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/shadcn/button'
import { Badge } from '@workspace/ui/shadcn/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/shadcn/select'
import { PrinterIcon, DownloadIcon, ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { InvoiceView, type InvoiceData } from '@/components/features/registration/invoice/InvoiceView'
import { formatFriendlyDate } from '@/utils/format'

// Mock data - in production this would come from API/database based on registrationId
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

const mockInvoices: InvoiceData[] = [
  {
    invoiceNumber: '1002',
    orderVersion: 2,
    issuedDate: new Date('2025-10-20'),
    eventName: 'Spring Regional Competition',
    clubName: 'North Shore Cheer',
    entriesByDivision: {
      'All Star Cheer - U16 - 4': [
        {
          id: '1',
          division: 'All Star Cheer - U16 - 4',
          teamName: 'U16 Thunder',
          teamSize: 26,
          mode: 'existing',
        },
      ],
    },
    divisionPricing: [
      {
        name: 'All Star Cheer - U16 - 4',
        regular: { price: 95 },
      },
    ],
    payments: [
      {
        amount: 2470,
        method: 'Visa',
        lastFour: '1287',
        date: new Date('2025-10-21'),
      },
    ],
    status: 'paid' as const,
  },
  {
    invoiceNumber: '1001',
    orderVersion: 1,
    issuedDate: new Date('2025-10-15'),
    eventName: 'Spring Regional Competition',
    clubName: 'North Shore Cheer',
    entriesByDivision: {
      'All Star Cheer - U16 - 4': [
        {
          id: '1',
          division: 'All Star Cheer - U16 - 4',
          teamName: 'U16 Thunder',
          teamSize: 24,
          mode: 'existing',
        },
      ],
    },
    divisionPricing: [
      {
        name: 'All Star Cheer - U16 - 4',
        regular: { price: 95 },
      },
    ],
    payments: [],
    status: 'unpaid' as const,
  },
]

export default function InvoicePage() {
  const params = useParams()
  const registrationId =
    typeof params?.registrationId === 'string' ? (params.registrationId as string) : undefined
  const registrationHref = registrationId ? `/clubs/registrations/${registrationId}` : '/clubs/registrations'
  const defaultInvoiceNumber = mockInvoices[0]?.invoiceNumber ?? ''
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState(defaultInvoiceNumber)
  const [isPrinting, setIsPrinting] = useState(false)

  const selectedInvoice =
    mockInvoices.find(inv => inv.invoiceNumber === selectedInvoiceNumber) ?? (mockInvoices[0] ?? null)

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 100)
  }

  if (!selectedInvoice) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-muted-foreground">
          No invoices available for this registration yet.
        </div>
      </div>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="no-print mb-6 flex items-center justify-between">
          <Button asChild variant="ghost" size="icon" className="-ml-2 h-10 w-10">
            <Link href={registrationHref} aria-label="Back to registration">
              <ArrowLeftIcon className="size-5" />
            </Link>
          </Button>

          <div className="flex gap-2">
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

        {mockInvoices.length > 1 && (
          <div className="no-print mb-6">
            <label htmlFor="invoice-select" className="mb-2 block body-small font-medium text-muted-foreground">
              Invoice History
            </label>
            <Select value={selectedInvoiceNumber} onValueChange={setSelectedInvoiceNumber}>
              <SelectTrigger id="invoice-select" className="w-full sm:w-[400px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockInvoices.map(invoice => (
                  <SelectItem key={invoice.invoiceNumber} value={invoice.invoiceNumber}>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">Invoice #{invoice.invoiceNumber}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground body-small">
                        {formatFriendlyDate(invoice.issuedDate)}
                      </span>
                      <Badge
                        variant={
                          invoice.status === 'paid'
                            ? 'default'
                            : invoice.status === 'partial'
                              ? 'secondary'
                              : 'outline'
                        }
                        className="ml-2 text-xs"
                      >
                        {invoice.status === 'paid'
                          ? 'Paid'
                          : invoice.status === 'partial'
                            ? 'Partially Paid'
                            : 'Unpaid'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <InvoiceView invoice={selectedInvoice} variant={isPrinting ? 'print' : 'web'} />
      </div>
    </>
  )
}
