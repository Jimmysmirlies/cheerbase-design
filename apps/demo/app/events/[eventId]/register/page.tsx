import { Button } from '@workspace/ui/shadcn/button'

import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { NavBar } from '@/components/nav-bar'
import { RegistrationFlow } from '@/components/ui/event-registration'
import { demoRosters } from '@/data/club/members'
import { demoTeams } from '@/data/club/teams'
import { findEventById } from '@/data/event-categories'

type RegisterPageParams = {
  eventId: string
}

type RegisterPageProps = {
  params?: Promise<RegisterPageParams>
}

export default async function RegisterEventPage({ params }: RegisterPageProps) {
  const resolvedParams = params ? await params : null
  if (!resolvedParams) {
    notFound()
  }

  const eventId = decodeURIComponent(resolvedParams.eventId)
  const event = findEventById(eventId)

  if (!event) {
    notFound()
  }

  const divisionPricing = event.availableDivisions ?? []

  return (
    <main className="bg-background text-foreground min-h-screen">
      <NavBar />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:px-10">
        <Button asChild variant="ghost" className="w-fit gap-2">
          <Link href={`/events/${encodeURIComponent(event.id)}`}>
            <ArrowLeftIcon className="size-4" />
            Back to competition overview
          </Link>
        </Button>

        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{event.name}</h1>
          <p className="text-muted-foreground text-sm">
            {event.location} · {event.date}
          </p>
        </header>

        <RegistrationFlow
          divisionPricing={divisionPricing}
          teams={demoTeams.map(({ id, name, division, size }) => ({ id, name, division, size }))}
          rosters={demoRosters}
        />
      </div>
    </main>
  )
}
