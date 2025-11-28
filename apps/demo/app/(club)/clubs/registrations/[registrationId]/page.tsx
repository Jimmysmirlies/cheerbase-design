import { Button } from '@workspace/ui/shadcn/button'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/shadcn/alert'

import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RegistrationFlow } from '@/components/features/registration/flow/RegistrationFlow'
import { GlassCard } from '@/components/ui/glass/GlassCard'
import { ArrowLeftIcon, MailIcon, MapPinIcon, SquareGanttChartIcon, UserCircle2Icon } from 'lucide-react'
import type { RegistrationEntry, RegistrationMember } from '@/components/features/registration/flow/types'
import { findEventById } from '@/data/events'
import type { Person } from '@/types/club'
import { formatFriendlyDate } from '@/utils/format'
import { isRegistrationLocked } from '@/utils/registrations'
import { getClubData, type RegisteredMemberDTO } from '@/lib/club-data'

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
        summaryCard: (
          <InvoiceSummaryCard
            invoiceNumber="INV-759"
            manager="Amy Jordan Arsenaul"
            email="info@506eliteallstars.com"
            address="669 Babin St, Dieppe, NB E1A5M7, Canada"
          />
        ),
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
        summaryCard: (
          <InvoiceSummaryCard
            invoiceNumber="INV-759"
            manager="Amy Jordan Arsenaul"
            email="info@506eliteallstars.com"
            address="669 Babin St, Dieppe, NB E1A5M7, Canada"
          />
        ),
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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-4">
          <Button asChild variant="ghost" size="icon" className="-ml-2 h-10 w-10">
            <Link href="/clubs?view=registrations" aria-label="Back to registrations">
              <ArrowLeftIcon className="size-5" />
            </Link>
          </Button>
          <header className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {event?.name ?? registration.eventName}
              </h1>
              <p className="text-muted-foreground text-sm">
                {registration.location} · {registration.eventDate}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/clubs/registrations/${registrationId}/invoice`}>View Invoice</Link>
            </Button>
          </header>
          {isLocked ? (
            <Alert className="border-charcoal-200 bg-charcoal-50/70">
              <AlertTitle>Registration locked</AlertTitle>
              <AlertDescription>
                The deadline has passed. Event details can no longer be changed. Please contact the organizer for assistance.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-amber-200 bg-amber-50/70">
              <AlertTitle>Payment due {formatFriendlyDate(registration.paymentDeadline)}</AlertTitle>
              <AlertDescription>Submit payment to keep your spot secured.</AlertDescription>
            </Alert>
          )}
        </div>

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

type InvoiceSummaryCardProps = {
  invoiceNumber: string
  manager: string
  email: string
  address: string
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

function InvoiceSummaryCard({ invoiceNumber, manager, email, address }: InvoiceSummaryCardProps) {
  return (
    <GlassCard className="mb-4 border-none p-4 shadow-sm">
      <div className="space-y-3 text-sm">
        <SummaryRow icon={<SquareGanttChartIcon className="size-4 text-primary" />} label="Invoice #">
          {invoiceNumber}
        </SummaryRow>
        <SummaryRow icon={<UserCircle2Icon className="size-4 text-primary" />} label="Account Manager">
          {manager}
        </SummaryRow>
        <SummaryRow icon={<MailIcon className="size-4 text-primary" />} label="Club Email">
          {email}
        </SummaryRow>
        <SummaryRow icon={<MapPinIcon className="size-4 text-primary" />} label="Club Address">
          {address}
        </SummaryRow>
      </div>
    </GlassCard>
  )
}

function SummaryRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-full bg-primary/10 p-2">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-foreground">{children}</p>
      </div>
    </div>
  )
}
