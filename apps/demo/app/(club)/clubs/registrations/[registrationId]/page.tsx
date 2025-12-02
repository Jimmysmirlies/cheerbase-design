import { notFound } from 'next/navigation'
import Link from 'next/link'

import { findEventById } from '@/data/events'
import { formatCurrency, formatFriendlyDate } from '@/utils/format'
import { isRegistrationLocked } from '@/utils/registrations'
import { getClubData } from '@/lib/club-data'
import { ClubSidebar } from '@/components/layout/ClubSidebar'
import { ClubPageHeader } from '@/components/layout/ClubPageHeader'
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
  const lockReason = registration.paidAt ? 'paid' : isLocked ? 'deadline' : undefined

  const paymentDeadlineDate = registration.paymentDeadline ? new Date(registration.paymentDeadline) : undefined
  let paymentStatus: 'Paid' | 'Unpaid' | 'Overdue' = 'Unpaid'
  if (registration.paidAt || registration.status === 'paid') paymentStatus = 'Paid'
  else if (paymentDeadlineDate && paymentDeadlineDate < new Date()) paymentStatus = 'Overdue'
  const invoiceTotalNumber = Number(registration.invoiceTotal ?? 0)

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
          metadataItems={[
            { label: 'Location', value: registration.location },
            { label: 'Event Date', value: formatFriendlyDate(registration.eventDate) },
            { label: 'Organizer', value: event?.organizer ?? 'TBD' },
          ]}
        />

        <div className="mx-auto w-full max-w-6xl space-y-12 px-6 py-6">
          {/* NOTICE — Registration lock + CTA (stacked) */}
          <div className="flex flex-col gap-4">
            <div className="rounded-md border border-border bg-background/80 px-4 py-3 text-sm text-foreground">
              {lockReason === 'paid' ? (
                <p>Registration locked — payment received. Contact the organizer for any changes.</p>
              ) : isLocked ? (
                <p>Registration locked — the registration deadline has passed. Contact the organizer for any inquiries.</p>
              ) : (
                <p>
                  Registration open — you can still update your roster until{' '}
                  <span className="font-medium">
                    {registration.registrationDeadline
                      ? formatFriendlyDate(registration.registrationDeadline)
                      : 'the deadline'}
                  </span>
                  .
                </p>
              )}
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-semibold">Modify registration</p>
              <p className="mt-1 text-amber-900/80">
                Changes may affect pricing and availability. If this registration is locked, contact the event organizer to request updates.
              </p>
            </div>
          </div>

          {/* SUMMARY — Key figures */}
          <div className="flex flex-col gap-3">
            <p className="heading-4">Summary</p>
            <div className="h-px w-full bg-border" />
            <div className="grid gap-6 text-sm text-foreground sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Invoice total</span>
                  <span className="font-semibold">{formatCurrency(invoiceTotalNumber)}</span>
                </div>
                <div className="h-px w-full bg-border/70" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Payment status</span>
                  <span className="font-semibold">
                    {paymentStatus}
                    {paymentDeadlineDate && paymentStatus !== 'Paid'
                      ? ` · Due ${formatFriendlyDate(paymentDeadlineDate)}`
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

          {/* REGISTERED TEAMS — Receipt view */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="heading-4">Registered Teams</p>
            </div>
            <div className="h-px w-full bg-border" />
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
        </div>
      </section>
    </main>
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
