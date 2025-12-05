import { notFound } from 'next/navigation'
import Link from 'next/link'

import { findEventById } from '@/data/events'
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
import { ClubSidebar } from '@/components/layout/ClubSidebar'
import { ClubPageHeader } from '@/components/layout/ClubPageHeader'
import { Button } from '@workspace/ui/shadcn/button'
import { RegistrationPaymentCTA } from '@/components/features/clubs/RegistrationPaymentCTA'
import { RegisteredTeamCard } from '@/components/features/clubs/RegisteredTeamCard'
import { FadeInSection } from '@/components/ui'
import type { RegisteredTeamMember } from '@/components/features/clubs/RegisteredTeamCard'

type PageParams = {
  registrationId: string
}

type PageProps = {
  params?: Promise<PageParams>
}

type RegisteredTeamCardData = {
  id: string
  name: string
  division: string
  members?: RegisteredTeamMember[]
  detailId: string
}

export default async function EditClubRegistrationPage({ params }: PageProps) {
  const resolvedParams = params ? await params : null
  if (!resolvedParams) {
    notFound()
  }

  const data = await getClubData()
  const user = { name: "Demo Club Owner", email: "demo@club.com", role: "club_owner" };
  const clubLabel = user.name ? `${user.name}'s Club` : "Your Club";
  const clubInitial = (user.name ?? "Club")[0]?.toUpperCase() ?? "C";
  const ownerName = user.name ?? user.email ?? clubLabel;

  const registrationId = decodeURIComponent(resolvedParams.registrationId)
  const registration = data.registrations.find(item => item.id === registrationId)
  if (!registration) {
    notFound()
  }

  const event = findEventById(registration.eventId)
  const invoiceTeamEntries = buildInvoiceTeamEntries(data, registration.eventId, event, { scope: 'event' })
  const registeredTeamCards: RegisteredTeamCardData[] = invoiceTeamEntries.map(buildRegisteredTeamCardFromInvoiceEntry)

  const participantsRegistered = invoiceTeamEntries.reduce(
    (total, entry) => total + entry.members.length,
    0
  )
  const teamsRegistered = invoiceTeamEntries.length
  const participantsLabel = `${participantsRegistered} ${participantsRegistered === 1 ? 'participant' : 'participants'}`
  const teamsLabel = `${teamsRegistered} ${teamsRegistered === 1 ? 'team' : 'teams'}`

  const isLocked = isRegistrationLocked({
    paymentDeadline: registration.paymentDeadline ?? undefined,
    registrationDeadline: registration.registrationDeadline ?? undefined,
    paidAt: registration.paidAt ?? undefined,
  })

  const invoiceEntries = convertInvoiceTeamsToRegistrationEntries(invoiceTeamEntries)
  const invoiceData = buildInvoiceDataFromEntries(invoiceEntries, registration, event ?? null, data, {
    clubName: clubLabel,
  })
  const { total: computedInvoiceTotal } = calculateInvoiceTotals(invoiceData)

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
  const eventPageHref = `/events/${registration.eventId}`
  const invoiceHref = `/clubs/registrations/${registration.id}/invoice`
  const paymentCtaDescription =
    paymentStatus === 'Overdue'
      ? `This registration is overdue. Pay the ${invoiceTotalLabel} balance now to keep ${registration.eventName} active.`
      : `Pay the outstanding balance for ${registration.eventName} to keep this registration active.`

  return (
    <main className="flex w-full">
      {/* NAV RAIL — Club navigation */}
      <ClubSidebar clubInitial={clubInitial} clubLabel={clubLabel} ownerName={ownerName} active="registrations" />

      <section className="flex flex-1 flex-col">
        {/* HERO — Club header */}
        <ClubPageHeader
          title={registration.eventName}
          hideSubtitle
          breadcrumbs={<span>Clubs / Registrations / {registration.eventName}</span>}
          eventStartDate={registration.eventDate}
        />

        <div className="mx-auto w-full max-w-6xl space-y-12 px-4 lg:px-8 py-8">
          {/* ACTIONS + PAYMENT NOTICES */}
          <div className="space-y-6">
            {/* ACTIONS — Primary buttons */}
            <FadeInSection className="w-full">
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link href={invoiceHref}>View Invoice</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={eventPageHref}>View Event Listing</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/clubs/registrations/${registration.id}?mode=edit`}>Update Registration</Link>
                </Button>
              </div>
            </FadeInSection>

            {/* PAYMENT NOTICES */}
            {paymentStatus === 'Overdue' || paymentStatus === 'Paid' ? (
              <div className="space-y-4">
                {paymentStatus === 'Overdue' ? (
                  <FadeInSection className="w-full" delay={40}>
                    <PaymentStatusNotice
                      status="Overdue"
                      amountLabel={invoiceTotalLabel}
                      dueLabel={paymentDeadlineLabel}
                      eventName={registration.eventName}
                      invoiceHref={invoiceHref}
                    />
                  </FadeInSection>
                ) : null}
                {paymentStatus === 'Paid' ? (
                  <FadeInSection className="w-full" delay={40}>
                    <PaymentStatusNotice
                      status="Paid"
                      amountLabel={invoiceTotalLabel}
                      dueLabel={paymentDeadlineLabel}
                      eventName={registration.eventName}
                      invoiceHref={invoiceHref}
                    />
                  </FadeInSection>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* PAYMENT CTA */}
          {paymentStatus !== 'Paid' && !isLocked ? (
            <FadeInSection className="w-full" delay={80}>
              <RegistrationPaymentCTA
                amountLabel={`Invoice total ${invoiceTotalLabel}`}
                dueLabel={paymentDeadlineLabel}
                description={paymentCtaDescription}
              />
            </FadeInSection>
          ) : null}

          {/* SUMMARY — Key figures */}
          <FadeInSection className="w-full" delay={160}>
            <div className="flex flex-col gap-4 px-1">
              <div className="flex flex-col gap-2">
                <p className="heading-4">Summary</p>
                <div className="h-px w-full bg-border" />
              </div>
              <div className="grid gap-6 text-sm text-foreground sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Invoice total</span>
                    <span className="font-semibold">{invoiceTotalLabel}</span>
                  </div>
                  <div className="h-px w-full bg-border/70" />
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Payment status</span>
                    <span className="font-semibold">
                      {paymentStatus}
                      {paymentDeadlineLabel && paymentStatus !== 'Paid'
                        ? ` · Due ${paymentDeadlineLabel}`
                        : ''}
                    </span>
                  </div>
                  <div className="h-px w-full bg-border/70" />
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Participants registered</span>
                    <span className="font-semibold">{participantsLabel}</span>
                  </div>
                  <div className="h-px w-full bg-border/70" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Invoice number</span>
                    <span className="font-semibold">{invoiceData.invoiceNumber}</span>
                  </div>
                  <div className="h-px w-full bg-border/70" />
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Registration deadline</span>
                    <span className="font-semibold">
                      {registration.registrationDeadline
                        ? formatFriendlyDate(registration.registrationDeadline)
                        : 'Not set'}
                    </span>
                  </div>
                  <div className="h-px w-full bg-border/70" />
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Teams registered</span>
                    <span className="font-semibold">{teamsLabel}</span>
                  </div>
                  <div className="h-px w-full bg-border/70" />
                </div>
              </div>
            </div>
          </FadeInSection>

          {/* REGISTERED TEAMS — Receipt view */}
          <FadeInSection className="w-full" delay={320}>
            <div className="flex flex-col gap-4 px-1">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="heading-4">Registered Teams</p>
                </div>
                <div className="h-px w-full bg-border" />
              </div>
              {registeredTeamCards.length ? (
                <div className="flex flex-col gap-4">
                  {registeredTeamCards.map(card => (
                    <RegisteredTeamCard key={card.id} card={card} />
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground rounded-md border border-dashed border-border/60 p-6 text-sm">
                  No teams registered for this event yet.
                </div>
              )}
            </div>
          </FadeInSection>
        </div>
      </section>
    </main>
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

type PaymentStatusNoticeProps = {
  status: 'Paid' | 'Overdue'
  amountLabel: string
  dueLabel?: string
  eventName: string
  invoiceHref: string
}

function PaymentStatusNotice({ status, amountLabel, dueLabel, eventName, invoiceHref }: PaymentStatusNoticeProps) {
  const isPaid = status === 'Paid'
  const containerClasses = isPaid
    ? 'border-lime-200 bg-lime-50 text-lime-900'
    : 'border-red-200 bg-red-50 text-red-900'
  const supportingTextClasses = isPaid ? 'text-lime-800' : 'text-red-800'

  return (
    <div className={`rounded-md border px-4 py-4 text-sm ${containerClasses}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-semibold">
            {isPaid ? 'Payment received' : 'Payment overdue'}
            {!isPaid && dueLabel ? <span className="font-normal">{` · Due ${dueLabel}`}</span> : null}
          </p>
          <p className={supportingTextClasses}>
            {isPaid
              ? `The invoice for ${eventName} is paid in full.`
              : `The ${amountLabel} invoice for ${eventName} ${
                  dueLabel ? `was due ${dueLabel}` : 'is overdue'
                }. Pay immediately to keep this registration active.`}
          </p>
        </div>
        {isPaid ? null : (
          <Button
            asChild
            size="sm"
            variant="destructive"
            className="bg-red-600 text-white hover:bg-red-600/90"
          >
            <Link href={invoiceHref}>Pay Now</Link>
          </Button>
        )}
      </div>
    </div>
  )
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
