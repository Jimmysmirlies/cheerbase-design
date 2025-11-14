import { Button } from '@workspace/ui/shadcn/button'

import { ArrowLeftIcon, CalendarIcon, MapPinIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RegistrationFlow } from '@/components/features/registration/flow/RegistrationFlow'
import { demoRosters } from '@/data/clubs/members'
import { demoTeams } from '@/data/clubs/teams'
import { findEventById } from '@/data/events'
import type { Event as ShowcaseEvent } from '@/types/events'

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
  const eventData = findEventById(eventId) as ShowcaseEvent | undefined

  if (!eventData) {
    notFound()
  }

  const eventDetails = eventData
  const divisionPricing = eventDetails.availableDivisions ?? []

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10">
        <header className="space-y-3">
          <Button asChild variant="ghost" size="icon" className="-ml-2 h-10 w-10">
            <Link
              href={`/events/${encodeURIComponent(eventDetails.id)}`}
              aria-label="Back to competition overview"
            >
              <ArrowLeftIcon className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="heading-1 sm:text-4xl">{eventDetails.name}</h1>
            <div className="flex flex-wrap gap-3 text-muted-foreground body-small mt-2">
              <span className="inline-flex items-center gap-2">
                <MapPinIcon className="size-4" aria-hidden="true" />
                {eventDetails.location}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarIcon className="size-4" aria-hidden="true" />
                {eventDetails.date}
              </span>
            </div>
          </div>
        </header>

        <RegistrationFlow
          divisionPricing={divisionPricing}
          teams={demoTeams.map(({ id, name, division, size }) => ({ id, name, division, size }))}
          rosters={demoRosters}
          backHref={`/events/${encodeURIComponent(eventDetails.id)}`}
        />
      </div>
    </main>
  )
}
