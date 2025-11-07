import { Button } from '@workspace/ui/shadcn/button'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/shadcn/alert'

import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RegistrationFlow } from '@/components/blocks/event-registration/event-registration'
import type { RegistrationEntry, RegistrationMember } from '@/components/blocks/event-registration/types'
import { NavBar } from '@/components/blocks/layout/nav-bar'
import { demoRosters } from '@/data/club/members'
import { demoRegistrations } from '@/data/club/registrations'
import { demoTeams } from '@/data/club/teams'
import { findEventById } from '@/data/event-categories'
import type { Person } from '@/types/club'
import { formatFriendlyDate } from '@/utils/format'

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

  const registrationId = decodeURIComponent(resolvedParams.registrationId)
  const registration = demoRegistrations.find(item => item.id === registrationId)

  if (!registration) {
    notFound()
  }

  const event = findEventById(registration.eventId)
  const divisionPricing = event?.availableDivisions ?? []
  const eventTeams = demoTeams.map(({ id, name, division, size }) => ({ id, name, division, size }))
  const roster = demoRosters.find(item => item.teamId === registration.teamId)
  const initialEntries: RegistrationEntry[] = [
    {
      id: registration.id,
      division: registration.division,
      mode: 'existing',
      teamId: registration.teamId,
      teamName: eventTeams.find(team => team.id === registration.teamId)?.name ?? registration.teamId,
      teamSize: registration.athletes,
      members: flattenRosterMembers(roster),
    },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <NavBar showSearch={false} mode="clubs" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-4">
          <Button asChild variant="link" className="-ml-2 w-fit gap-2 px-2">
            <Link href="/clubs?view=registrations">← Back to registrations</Link>
          </Button>
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {event?.name ?? registration.eventName}
            </h1>
            <p className="text-muted-foreground text-sm">
              {registration.location} · {registration.eventDate}
            </p>
          </header>
          <Alert className="border-amber-200 bg-amber-50/70">
            <AlertTitle>Payment due {formatFriendlyDate(registration.paymentDeadline)}</AlertTitle>
            <AlertDescription>
              Submit payment to keep your spot locked. You can still adjust roster details until the invoice is paid in full.
            </AlertDescription>
          </Alert>
        </div>

        <RegistrationFlow
          divisionPricing={divisionPricing}
          teams={eventTeams}
          rosters={demoRosters}
          initialEntries={initialEntries}
          finalizeConfig={{
            ctaLabel: 'Pay invoice',
            dialogTitle: 'Pay invoice',
            dialogDescription: 'Confirm the outstanding balance and submit payment for this registration.',
            dialogConfirmLabel: 'Submit payment',
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
