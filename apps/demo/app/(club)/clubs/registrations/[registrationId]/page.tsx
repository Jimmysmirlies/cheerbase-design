import { notFound } from 'next/navigation'
import Link from 'next/link'

import { findEventById } from '@/data/events'
import { formatCurrency, formatFriendlyDate } from '@/utils/format'
import { isRegistrationLocked } from '@/utils/registrations'
import { getClubData } from '@/lib/club-data'
import { ClubSidebar } from '@/components/layout/ClubSidebar'
import { ClubPageHeader } from '@/components/layout/ClubPageHeader'
import { Button } from '@workspace/ui/shadcn/button'
import { RegistrationPaymentCTA } from '@/components/features/clubs/RegistrationPaymentCTA'
import { FadeInSection } from '@/components/ui'
import type { TeamRoster } from '@/types/club'

type PageParams = {
  registrationId: string
}

type PageProps = {
  params?: Promise<PageParams>
}

export default async function EditClubRegistrationPage({ params }: PageProps) {
  const resolvedParams = params ? await params : null
  if (!resolvedParams) {
    notFound()
  }

  const data = await getClubData()
  const user = { name: "Demo Club Owner", email: "demo@club.com", role: "club_owner" };

  const registrationId = decodeURIComponent(resolvedParams.registrationId)
  const registration = data.registrations.find(item => item.id === registrationId)
  if (!registration) {
    notFound()
  }

  const registeredTeam =
    registration.registeredTeam ??
    (registration.registeredTeamId ? data.registeredTeams.find(rt => rt.id === registration.registeredTeamId) : null) ??
    (registration.teamId ? data.registeredTeams.find(rt => rt.sourceTeamId === registration.teamId) : null) ??
    null

  const teamRecord = registration.teamId ? data.teams.find(team => team.id === registration.teamId) : undefined
  const roster = registration.teamId ? data.rosters.find(r => r.teamId === registration.teamId) : undefined
  const registeredTeamCard = registeredTeam
    ? {
        id: registeredTeam.id,
        name: registeredTeam.name,
        division: registeredTeam.division,
        members: registeredTeam.members?.length ?? 0,
        detailId: registeredTeam.sourceTeamId ?? registration.teamId ?? registeredTeam.id,
      }
    : teamRecord
      ? {
          id: teamRecord.id,
          name: teamRecord.name,
          division: teamRecord.division,
          members: roster ? rosterMemberCount(roster) : 0,
          detailId: teamRecord.id,
        }
      : null

  const event = findEventById(registration.eventId)
  const isLocked = isRegistrationLocked({
    paymentDeadline: registration.paymentDeadline ?? undefined,
    registrationDeadline: registration.registrationDeadline ?? undefined,
    paidAt: registration.paidAt ?? undefined,
  })

  const paymentDeadlineDate = registration.paymentDeadline ? new Date(registration.paymentDeadline) : undefined
  let paymentStatus: 'Paid' | 'Unpaid' | 'Overdue' = 'Unpaid'
  if (registration.paidAt || registration.status === 'paid') paymentStatus = 'Paid'
  else if (paymentDeadlineDate && paymentDeadlineDate < new Date()) paymentStatus = 'Overdue'
  const invoiceTotalNumber = Number(registration.invoiceTotal ?? 0)
  const invoiceTotalLabel = formatCurrency(invoiceTotalNumber)
  const paymentDeadlineLabel =
    paymentDeadlineDate && !Number.isNaN(paymentDeadlineDate.getTime())
      ? formatFriendlyDate(paymentDeadlineDate)
      : undefined
  const eventDetailItems = [
    { label: 'Location', value: registration.location ?? 'TBD' },
    { label: 'Event Date', value: formatFriendlyDate(registration.eventDate) },
    { label: 'Organizer', value: event?.organizer ?? 'TBD' },
  ]
  const eventPageHref = `/events/${registration.eventId}`
  const invoiceHref = `/clubs/registrations/${registration.id}/invoice`
  const paymentCtaDescription =
    paymentStatus === 'Overdue'
      ? `This registration is overdue. Pay the ${invoiceTotalLabel} balance now to keep ${registration.eventName} active.`
      : `Pay the outstanding balance for ${registration.eventName} to keep this registration active.`

  const clubInitial = (user.name ?? "Club")[0]?.toUpperCase() ?? "C";
  const clubLabel = user.name ? `${user.name}'s Club` : "Your Club";
  const ownerName = user.name ?? user.email ?? clubLabel;

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
            <div className="flex flex-col gap-4">
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
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Registration ID</span>
                    <span className="font-semibold">{registration.id}</span>
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
                </div>
              </div>
            </div>
          </FadeInSection>

          {/* EVENT DETAILS — Metadata */}
          <FadeInSection className="w-full" delay={240}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="heading-4">Event Details</p>
                <div className="h-px w-full bg-border" />
              </div>
              <div className="grid gap-6 text-sm text-foreground sm:grid-cols-3">
                {eventDetailItems.map(item => (
                  <div key={item.label} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-semibold text-right">{item.value}</span>
                    </div>
                    <div className="h-px w-full bg-border/70" />
                  </div>
                ))}
              </div>
            </div>
          </FadeInSection>

          {/* REGISTERED TEAMS — Receipt view */}
          <FadeInSection className="w-full" delay={320}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="heading-4">Registered Teams</p>
                </div>
                <div className="h-px w-full bg-border" />
              </div>
              {registeredTeamCard ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <RegisteredTeamCard card={registeredTeamCard} />
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

type RegisteredTeamCardProps = {
  card: {
    id: string
    name: string
    division: string
    members: number
    detailId: string
  }
}

function RegisteredTeamCard({ card }: RegisteredTeamCardProps) {
  const { divisionLabel, levelLabel } = parseDivision(card.division)
  return (
    <div className="border-border/70 bg-background/80 border shadow-sm">
      <div className="px-5 pt-6 pb-4">
        <h3 className="heading-4 text-foreground">{card.name}</h3>
        <div className="bg-border mt-2 h-px w-full" />
      </div>
      <div className="px-5 pb-2 text-sm text-foreground">
        <div className="flex items-center justify-between py-2">
          <span className="text-muted-foreground">Division</span>
          <span className="font-medium truncate text-right">{divisionLabel}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border/70 py-2">
          <span className="text-muted-foreground">Level</span>
          <span className="font-medium">{levelLabel}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border/70 py-2">
          <span className="text-muted-foreground">Athletes</span>
          <span className="font-medium">{card.members}</span>
        </div>
      </div>
      <div className="border-t border-border/70 px-5 py-3">
        <div className="flex justify-end">
          <Link
            href={`/clubs/teams/${card.detailId}`}
            className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted/50"
          >
            View team
          </Link>
        </div>
      </div>
    </div>
  )
}

function parseDivision(division: string) {
  const parts = division.split('-').map(part => part.trim()).filter(Boolean)
  if (!parts.length) {
    return { divisionLabel: '—', levelLabel: '—' }
  }
  if (parts.length === 1) {
    return { divisionLabel: parts[0], levelLabel: '—' }
  }
  const level = parts.pop() ?? '—'
  return { divisionLabel: parts.join(' - '), levelLabel: level }
}

function rosterMemberCount(roster: {
  coaches?: TeamRoster['coaches']
  athletes?: TeamRoster['athletes']
  reservists?: TeamRoster['reservists']
  chaperones?: TeamRoster['chaperones']
}) {
  return (
    (roster.coaches?.length ?? 0) +
    (roster.athletes?.length ?? 0) +
    (roster.reservists?.length ?? 0) +
    (roster.chaperones?.length ?? 0)
  )
}
