import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/layout/PageHeader'
import { NewRegistrationContent } from '@/components/features/registration/flow/NewRegistrationContent'
import { findEventById } from '@/data/events'
import { findOrganizerByName } from '@/data/events/organizers'
import { getClubData } from '@/lib/club-data'
import { formatFriendlyDate } from '@/utils/format'
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

  const clubData = await getClubData()
  const eventId = decodeURIComponent(resolvedParams.eventId)
  const eventData = findEventById(eventId) as ShowcaseEvent | undefined

  if (!eventData) {
    notFound()
  }

  const eventDetails = eventData
  const divisionPricing = eventDetails.availableDivisions ?? []

  // Get organizer data for gradient
  const organizer = findOrganizerByName(eventDetails.organizer)
  const gradientVariant = organizer?.gradient ?? 'primary'

  // Calculate registration deadline (day before event)
  const eventDate = new Date(eventDetails.date)
  const registrationDeadline = new Date(eventDate)
  registrationDeadline.setDate(registrationDeadline.getDate() - 1)
  const registrationDeadlineLabel = formatFriendlyDate(registrationDeadline)

  // Build rosters from club data
  const rosters = clubData.rosters ?? []

  return (
    <section className="flex flex-1 flex-col">
      <PageHeader
        title={eventDetails.name}
        hideSubtitle
        hideBorder
        gradientVariant={gradientVariant}
        breadcrumbItems={[
          { label: 'Events', href: '/events/search' },
          { label: eventDetails.name, href: `/events/${encodeURIComponent(eventId)}` },
          { label: 'Register' },
        ]}
      />

      <NewRegistrationContent
        eventId={eventId}
        eventName={eventDetails.name}
        organizer={eventDetails.organizer}
        organizerGradient={gradientVariant}
        eventDate={eventDetails.date}
        location={eventDetails.location}
        divisionPricing={divisionPricing}
        teams={clubData.teams.map(({ id, name, division, size }) => ({ id, name, division, size }))}
        rosters={rosters}
        registrationDeadline={registrationDeadlineLabel}
      />
    </section>
  )
}
