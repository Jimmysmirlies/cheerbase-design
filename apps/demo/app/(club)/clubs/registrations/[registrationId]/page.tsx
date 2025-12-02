import { notFound } from 'next/navigation'

import { RegistrationFlow } from '@/components/features/registration/flow/RegistrationFlow'
import type { RegistrationEntry, RegistrationMember } from '@/components/features/registration/flow/types'
import { findEventById } from '@/data/events'
import type { Person } from '@/types/club'
import { formatFriendlyDate } from '@/utils/format'
import { isRegistrationLocked } from '@/utils/registrations'
import { getClubData, type RegisteredMemberDTO } from '@/lib/club-data'
import { ClubSidebar } from '@/components/layout/ClubSidebar'
import { ClubPageHeader } from '@/components/layout/ClubPageHeader'
import { EventHeader } from '@/components/layout/EventHeader'

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
  const registeredTeam = registration
    ? registration.registeredTeam ?? data.registeredTeams.find(rt => rt.id === registration.registeredTeamId) ?? null
    : null

  if (!registration) {
    notFound()
  }

  const event = findEventById(registration.eventId)
  const divisionPricing = event?.availableDivisions ?? []
  const eventTeams = data.teams.map(({ id, name, division, size }) => ({ id, name, division, size }))
  const roster =
    registeredTeam?.sourceTeamId && data.rosters.find(item => item.teamId === registeredTeam.sourceTeamId)
      ? data.rosters.find(item => item.teamId === registeredTeam.sourceTeamId)
      : registeredTeam
        ? rosterFromRegisteredTeam(registeredTeam.members)
        : undefined
  const contactHref = `mailto:events@mobilytics.app?subject=Registration%20update%3A%20${encodeURIComponent(
    registration.eventName
  )}&body=Registration%20ID%3A%20${registration.id}`
  const snapshotTakenAt = registration.createdAt ?? new Date().toISOString()
  const isLocked = isRegistrationLocked({
    paymentDeadline: registration.paymentDeadline ?? undefined,
    paidAt: registration.paidAt ?? undefined,
  })
  const lockReason = registration.paidAt ? 'paid' : isLocked ? 'deadline' : undefined
  const initialEntries: RegistrationEntry[] = [
    {
      id: registration.id,
      division: registration.division,
      mode: registeredTeam?.sourceTeamId ? 'existing' : 'upload',
      teamId: registeredTeam?.sourceTeamId ?? registeredTeam?.id,
      teamName: registeredTeam?.name ?? registeredTeam?.sourceTeamId ?? registration.registeredTeamId,
      teamSize: registration.athletes,
      members: flattenRosterMembers(roster),
      snapshotTakenAt,
      snapshotSourceTeamId: registeredTeam?.sourceTeamId ?? undefined,
      paymentDeadline: registration.paymentDeadline ?? undefined,
      paidAt: registration.paidAt ?? undefined,
      locked: isLocked,
      lockReason,
      lockMessage:
        lockReason === 'paid'
          ? 'Payment received. Contact the organizer to request changes. No refunds or participant adjustments are available.'
          : lockReason === 'deadline'
            ? 'The registration deadline passed. Contact the organizer to request changes; totals will remain the same.'
            : undefined,
      contactEmail: contactHref,
    },
  ]

  const baseAmount = registration.invoiceTotal
  const gstRate = 0.13
  const qstRate = 0.08
  const finalizeConfig = isLocked
    ? {
        ctaLabel: 'Contact organizer',
        dialogTitle: '',
        dialogDescription: '',
        dialogConfirmLabel: '',
        redirectPath: '',
        onCtaHref: contactHref,
        ctaDisabled: false,
        isReadOnly: true,
        summaryCard: null,
        taxSummary: {
          gstNumber: '784571093RT0001',
          qstNumber: '1223517737TQ001',
          baseAmount,
          gstRate,
          qstRate,
        },
      }
    : {
        ctaLabel: 'Pay invoice',
        dialogTitle: 'Pay invoice',
        dialogDescription: 'Confirm the outstanding balance and submit payment for this registration.',
        dialogConfirmLabel: 'Submit payment',
        redirectPath: '/clubs?view=registrations',
        summaryCard: null,
        taxSummary: {
          gstNumber: '784571093RT0001',
          qstNumber: '1223517737TQ001',
          baseAmount,
          gstRate,
          qstRate,
        },
      }

  const rostersForFlow =
    registeredTeam && !registeredTeam.sourceTeamId
      ? [...data.rosters, { teamId: registeredTeam.id, ...rosterFromRegisteredTeam(registeredTeam.members) }]
      : data.rosters

  const clubInitial = (user.name ?? "Club")[0]?.toUpperCase() ?? "C";
  const clubLabel = user.name ? `${user.name}'s Club` : "Your Club";
  const ownerName = user.name ?? user.email ?? clubLabel;

  return (
    <main className="flex w-full">
      <ClubSidebar clubInitial={clubInitial} clubLabel={clubLabel} ownerName={ownerName} active="registrations" />

      <section className="flex flex-1 flex-col">
        <ClubPageHeader
          title="Registrations"
          hideSubtitle
          breadcrumbs={<span>Clubs / Registrations / {registration.eventName}</span>}
        />

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
          <EventHeader
            title={event?.name ?? registration.eventName}
            location={registration.location}
            date={formatFriendlyDate(registration.eventDate)}
            organizer={event?.organizer}
            backHref="/clubs/registrations"
            listingHref={event ? `/events/${event.id}` : undefined}
            invoiceHref={`/clubs/registrations/${registrationId}/invoice`}
          />

          <RegistrationFlow
            divisionPricing={divisionPricing}
            teams={eventTeams}
            rosters={rostersForFlow}
            initialEntries={initialEntries}
            finalizeConfig={finalizeConfig}
            readOnly={isLocked}
            hideStats={true}
            hideSubmitButton={true}
            showPaymentMethods={!registration.paidAt}
            stepLabels={{
              step1: 'Registered Teams',
              step2: 'Price',
            }}
          />
        </div>
      </section>
    </main>
  )
}

type RosterShape = {
  coaches: Person[]
  athletes: Person[]
  reservists: Person[]
  chaperones: Person[]
}

function rosterFromRegisteredTeam(members: RegisteredMemberDTO[]): RosterShape {
  const empty: RosterShape = { coaches: [], athletes: [], reservists: [], chaperones: [] }
  if (!members?.length) return empty

  const toPerson = (member: RegisteredMemberDTO): Person => ({
    id: member.personId ?? member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    dob: member.dob ?? undefined,
    email: member.email ?? undefined,
    phone: member.phone ?? undefined,
  })

  members.forEach(member => {
    if (member.role === 'coach') empty.coaches.push(toPerson(member))
    if (member.role === 'athlete') empty.athletes.push(toPerson(member))
    if (member.role === 'reservist') empty.reservists.push(toPerson(member))
    if (member.role === 'chaperone') empty.chaperones.push(toPerson(member))
  })

  return empty
}

function flattenRosterMembers(roster?: RosterShape): RegistrationMember[] {
  if (!roster) return []

  const roleMap: Array<{ key: keyof RosterShape; label: string }> = [
    { key: 'coaches', label: 'Coach' },
    { key: 'athletes', label: 'Athlete' },
    { key: 'reservists', label: 'Reservist' },
    { key: 'chaperones', label: 'Chaperone' },
  ]

  return roleMap.flatMap(({ key, label }) => {
    const group = roster[key] ?? []
    return group.map(member => ({
      name: formatMemberName(member),
      type: label,
      dob: member.dob,
      email: member.email,
      phone: member.phone,
    }))
  })
}

function formatMemberName(member: Pick<Person, 'firstName' | 'lastName'>): string {
  const parts = [member.firstName, member.lastName].filter(Boolean)
  return parts.length ? parts.join(' ') : 'Unnamed'
}
