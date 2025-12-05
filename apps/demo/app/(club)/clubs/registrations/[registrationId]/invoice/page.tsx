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

  const user = { name: 'Demo Club Owner', email: 'demo@club.com' }
  const clubLabel = user.name ? `${user.name}'s Club` : 'Your Club'
  const clubInitial = (user.name ?? 'Club')[0]?.toUpperCase() ?? 'C'
  const ownerName = user.name ?? user.email ?? clubLabel

  const invoiceTeamEntries = buildInvoiceTeamEntries(clubData, registration.eventId, event, { scope: 'event' })
  const invoiceEntries = convertInvoiceTeamsToRegistrationEntries(invoiceTeamEntries)
  const invoice = buildInvoiceDataFromEntries(invoiceEntries, registration, event ?? null, clubData, {
    clubName: clubLabel,
  })
  const invoices = [invoice]

  const registrationHref = `/clubs/registrations/${registration.id}`

  return (
    <InvoicePageClient
      invoices={invoices}
      registrationHref={registrationHref}
      clubInitial={clubInitial}
      clubLabel={clubLabel}
      ownerName={ownerName}
    />
  )
}
