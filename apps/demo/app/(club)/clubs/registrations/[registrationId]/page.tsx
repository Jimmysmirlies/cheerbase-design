import { notFound } from 'next/navigation'

import { findEventById, listEvents, organizers } from '@/data/events'
import { formatCurrency, formatFriendlyDate } from '@/utils/format'
import { isRegistrationLocked } from '@/utils/registrations'
import {
  buildInvoiceDataFromEntries,
  buildInvoiceTeamEntries,
  calculateInvoiceTotals,
  convertInvoiceTeamsToRegistrationEntries,
  type InvoiceTeamEntry,
} from '@/lib/invoices'
import { getClubData, type RegisteredMemberDTO } from '@/lib/club-data'
import { RegistrationDetailContent, type TeamRosterData } from '@/components/features/clubs/RegistrationDetailContent'
import type { RegisteredTeamMember } from '@/components/features/clubs/RegisteredTeamCard'
import { demoRosters } from '@/data/clubs/members'

type PageParams = {
  registrationId: string
}

type SearchParams = {
  mode?: string
}

type PageProps = {
  params?: Promise<PageParams>
  searchParams?: Promise<SearchParams>
}

type RegisteredTeamCardData = {
  id: string
  name: string
  division: string
  members?: RegisteredTeamMember[]
  detailId: string
}

export default async function EditClubRegistrationPage({ params, searchParams }: PageProps) {
  const resolvedParams = params ? await params : null
  if (!resolvedParams) {
    notFound()
  }

  const resolvedSearchParams = searchParams ? await searchParams : null
  const isEditMode = resolvedSearchParams?.mode === 'edit'

  const data = await getClubData()
  const clubLabel = "Demo Club Owner's Club"
  const registrationId = decodeURIComponent(resolvedParams.registrationId)
  const registration = data.registrations.find(item => item.id === registrationId)
  if (!registration) {
    notFound()
  }

  const event = findEventById(registration.eventId)
  const invoiceTeamEntries = buildInvoiceTeamEntries(data, registration.eventId, event, { scope: 'event' })
  const registeredTeamCards: RegisteredTeamCardData[] = invoiceTeamEntries.map(buildRegisteredTeamCardFromInvoiceEntry)

  // Group registered teams by division
  const teamsByDivision = new Map<string, RegisteredTeamCardData[]>()
  registeredTeamCards.forEach(card => {
    const existing = teamsByDivision.get(card.division) ?? []
    existing.push(card)
    teamsByDivision.set(card.division, existing)
  })

  // Get all available divisions from event, or fall back to registered divisions
  const availableDivisions = event?.availableDivisions?.map(d => d.name) ?? Array.from(teamsByDivision.keys())
  // Also include any registered divisions not in availableDivisions
  const allDivisions = [...new Set([...availableDivisions, ...Array.from(teamsByDivision.keys())])]

  const isLocked = isRegistrationLocked({
    paymentDeadline: registration.paymentDeadline ?? undefined,
    registrationDeadline: registration.registrationDeadline ?? undefined,
    paidAt: registration.paidAt ?? undefined,
  })

  const invoiceEntries = convertInvoiceTeamsToRegistrationEntries(invoiceTeamEntries)
  const invoiceData = buildInvoiceDataFromEntries(invoiceEntries, registration, event ?? null, data, {
    clubName: clubLabel,
  })
  const invoiceTotals = calculateInvoiceTotals(invoiceData)
  const { total: computedInvoiceTotal, lineItems, subtotal, totalTax } = invoiceTotals

  const paymentDeadlineDate = registration.paymentDeadline ? new Date(registration.paymentDeadline) : undefined
  let paymentStatus: 'Paid' | 'Unpaid' | 'Overdue' = 'Unpaid'
  if (registration.paidAt || registration.status === 'paid') paymentStatus = 'Paid'
  else if (paymentDeadlineDate && paymentDeadlineDate < new Date()) paymentStatus = 'Overdue'
  const fallbackInvoiceTotal = Number(registration.invoiceTotal ?? 0)
  const invoiceTotalNumber =
    Number.isFinite(computedInvoiceTotal) && computedInvoiceTotal > 0 ? computedInvoiceTotal : fallbackInvoiceTotal
  const invoiceTotalLabel = formatCurrency(invoiceTotalNumber)
  const paymentDeadlineLabel =
    paymentDeadlineDate && !Number.isNaN(paymentDeadlineDate.getTime())
      ? formatFriendlyDate(paymentDeadlineDate)
      : undefined
  const dueDateMonth = paymentDeadlineDate && !Number.isNaN(paymentDeadlineDate.getTime())
    ? paymentDeadlineDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()
    : null
  const dueDateDay = paymentDeadlineDate && !Number.isNaN(paymentDeadlineDate.getTime())
    ? paymentDeadlineDate.getDate()
    : null
  const paidAtDate = registration.paidAt ? new Date(registration.paidAt) : null
  const paidAtLabel = paidAtDate && !Number.isNaN(paidAtDate.getTime())
    ? formatFriendlyDate(paidAtDate)
    : null
  const paymentTitle = paymentStatus === 'Paid'
    ? 'Payment received'
    : paymentStatus === 'Overdue'
      ? 'Payment overdue'
      : 'Payment required'
  const eventPageHref = `/events/${registration.eventId}`
  const invoiceHref = `/clubs/registrations/${registration.id}/invoice`
  
  // Generate invoice number (based on registration ID)
  const invoiceNumber = registration.id.replace('r-', '').padStart(6, '0') + '-001'
  // Use registration snapshot date or event date for invoice date
  const invoiceDate = registration.snapshotTakenAt || registration.eventDate
  const organizerName = registration.organizer ?? event?.organizer ?? 'Event organizer'
  const organizerData = organizers.find(org => org.name === organizerName)
  const organizerGradientVariant = organizerData?.gradient ?? 'primary'
  const organizerEvents = listEvents().filter(evt => evt.organizer === organizerName)
  const organizerEventsCount = organizerEvents.length
  const organizerFollowers = organizerName
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0)
  const organizerFollowersLabel = organizerFollowers ? organizerFollowers.toLocaleString() : '—'
  const organizerHostingYears = (() => {
    const years = organizerEvents
      .map(evt => new Date(evt.date).getFullYear())
      .filter(year => Number.isFinite(year))
    if (!years.length) return null
    const earliest = Math.min(...years)
    const currentYear = new Date().getFullYear()
    return Math.max(1, currentYear - earliest)
  })()
  const organizerHostingLabel =
    organizerHostingYears !== null
      ? `${organizerHostingYears} year${organizerHostingYears === 1 ? '' : 's'}`
      : '—'
  const locationLabel = registration.location ?? event?.location ?? 'Location to be announced'
  const googleMapsHref =
    locationLabel && locationLabel !== 'Location to be announced'
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationLabel)}`
      : null
  const eventDateLabel = registration.eventDate ? formatFriendlyDate(registration.eventDate) : 'Date pending'
  const eventDateObj = registration.eventDate ? new Date(registration.eventDate) : null
  const eventDateWeekday =
    eventDateObj && !Number.isNaN(eventDateObj.getTime())
      ? eventDateObj.toLocaleString('en-US', { weekday: 'long' })
      : null
  const registrationDeadlineLabel = registration.registrationDeadline
    ? formatFriendlyDate(registration.registrationDeadline)
    : null

  // Convert Map to serializable format for client component
  const teamsByDivisionArray = Array.from(teamsByDivision.entries())

  // Division pricing for registration dialogs
  const divisionPricing = event?.availableDivisions ?? []

  // Team options for registration dialogs
  const teamOptions = (data.teams ?? []).map(team => ({
    id: team.id,
    name: team.name,
    division: team.division ?? undefined,
    size: team.size,
  }))

  // Build roster map for team lookups
  const teamRosters: TeamRosterData[] = demoRosters.map(roster => ({
    teamId: roster.teamId,
    members: [
      ...roster.coaches.map(p => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`.trim(),
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        dob: p.dob,
        role: 'Coach' as const,
      })),
      ...roster.athletes.map(p => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`.trim(),
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        dob: p.dob,
        role: 'Athlete' as const,
      })),
      ...roster.reservists.map(p => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`.trim(),
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        dob: p.dob,
        role: 'Reservist' as const,
      })),
      ...roster.chaperones.map(p => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`.trim(),
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone,
        dob: p.dob,
        role: 'Chaperone' as const,
      })),
    ],
  }))

  return (
    <RegistrationDetailContent
      registration={{
        id: registration.id,
        eventName: registration.eventName,
        eventId: registration.eventId,
      }}
      isEditMode={isEditMode}
      divisionPricing={divisionPricing}
      teamOptions={teamOptions}
      teamRosters={teamRosters}
      organizerName={organizerName}
      organizerGradientVariant={organizerGradientVariant}
      organizerFollowersLabel={organizerFollowersLabel}
      organizerEventsCount={organizerEventsCount}
      organizerHostingLabel={organizerHostingLabel}
      locationLabel={locationLabel}
      googleMapsHref={googleMapsHref}
      eventDateLabel={eventDateLabel}
      eventDateWeekday={eventDateWeekday}
      registrationDeadlineLabel={registrationDeadlineLabel}
      isLocked={isLocked}
      allDivisions={allDivisions}
      teamsByDivisionArray={teamsByDivisionArray}
      invoiceLineItems={lineItems}
      subtotal={subtotal}
      totalTax={totalTax}
      invoiceTotal={invoiceTotalNumber}
      invoiceTotalLabel={invoiceTotalLabel}
      invoiceNumber={invoiceNumber}
      invoiceDate={invoiceDate}
      invoiceHref={invoiceHref}
      eventPageHref={eventPageHref}
      paymentStatus={paymentStatus}
      paymentDeadlineLabel={paymentDeadlineLabel}
      paymentTitle={paymentTitle}
      paidAtLabel={paidAtLabel}
      dueDateMonth={dueDateMonth}
      dueDateDay={dueDateDay}
    />
  )
}

function buildRegisteredTeamCardFromInvoiceEntry(entry: InvoiceTeamEntry): RegisteredTeamCardData {
  return {
    id: entry.id,
    name: entry.teamName ?? 'Registered Team',
    division: entry.division,
    members: normalizeRegisteredMembers(entry.members),
    detailId: entry.teamId ?? entry.registeredTeamId ?? entry.id,
  }
}

function normalizeRegisteredMembers(members?: RegisteredMemberDTO[] | null): RegisteredTeamMember[] {
  if (!members?.length) return []
  return members.map((member, index) => ({
    id: member.personId ?? member.id ?? `registered-member-${index}`,
    name: `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim() || undefined,
    firstName: member.firstName ?? null,
    lastName: member.lastName ?? null,
    email: member.email ?? null,
    phone: member.phone ?? null,
    dob: member.dob ?? null,
    role: member.role ?? null,
  }))
}
