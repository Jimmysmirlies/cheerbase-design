import { notFound } from 'next/navigation'

import { findEventById } from '@/data/events'
import { getClubData } from '@/lib/club-data'
import {
  buildInvoiceDataFromEntries,
  buildInvoiceTeamEntries,
  convertInvoiceTeamsToRegistrationEntries,
} from '@/lib/invoices'
import { InvoicePageClient } from './InvoicePageClient'

type PageParams = {
  registrationId: string
}

type PageProps = {
  params?: Promise<PageParams>
}

export default async function InvoicePage({ params }: PageProps) {
  const resolvedParams = params ? await params : null
  if (!resolvedParams) {
    notFound()
  }

  const clubData = await getClubData()

  const registrationId = decodeURIComponent(resolvedParams.registrationId)
  const registration = clubData.registrations.find(item => item.id === registrationId)
  if (!registration) {
    notFound()
  }

  const event = findEventById(registration.eventId)

  const clubLabel = "Demo Club Owner's Club"

  const invoiceTeamEntries = buildInvoiceTeamEntries(clubData, registration.eventId, event, { scope: 'event' })
  const invoiceEntries = convertInvoiceTeamsToRegistrationEntries(invoiceTeamEntries)
  
  // Build the current invoice (this is the base invoice from server data)
  const invoice = buildInvoiceDataFromEntries(invoiceEntries, registration, event ?? null, clubData, {
    clubName: clubLabel,
  })

  const registrationHref = `/clubs/registrations/${registration.id}`

  return (
    <InvoicePageClient 
      invoices={[invoice]} 
      registrationHref={registrationHref}
      registrationId={registrationId}
      originalPaymentStatus={registration.status === 'paid' ? 'paid' : 'unpaid'}
    />
  )
}
