import type { Event } from '@/types/events'
import type { BrandGradient } from '@/lib/gradients'
import type { EventDetailBodyProps } from '../EventDetailBody'
import { brandGradients } from '@/lib/gradients'
import { divisionPricingDefaults } from '@/data/divisions'
import { isRegistrationClosed } from '@/data/events'
import { buildEventGalleryImages } from '@/app/(events)/events/[eventId]/image-gallery'

type BuildEventDetailPropsInput = {
  event: Partial<Event>
  organizerGradient: BrandGradient
  organizerFollowers?: string
  organizerEventsCount?: number
  organizerHostingDuration?: string
}

export function buildEventDetailProps({
  event,
  organizerGradient,
  organizerFollowers = '—',
  organizerEventsCount,
  organizerHostingDuration,
}: BuildEventDetailPropsInput): EventDetailBodyProps {
  // Build gallery images
  const galleryImages = buildEventGalleryImages(event as Event)

  // Format timeline dates
  const formatTimelineDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })

  const competitionDate = event.date ? new Date(event.date) : new Date()
  const dayBefore = new Date(competitionDate)
  dayBefore.setDate(dayBefore.getDate() - 1)

  const eventDateParts = {
    month: competitionDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: competitionDate.getDate().toString(),
    weekday: competitionDate.toLocaleDateString('en-US', { weekday: 'long' }),
    fullDate: competitionDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' }),
  }

  // Parse location
  const location = event.location || ''
  const locationParts = location.split(', ')
  const venueName = locationParts[0] ?? location
  const cityState = locationParts.slice(1).join(', ')

  const registrationDeadlineISO = event.registrationDeadline
    ? new Date(event.registrationDeadline).toISOString()
    : dayBefore.toISOString()

  const registrationClosed = isRegistrationClosed(event as Event)

  // Build timeline phases
  const now = new Date()
  const earlyBirdDeadline = event.earlyBirdDeadline ? new Date(event.earlyBirdDeadline) : null
  const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : dayBefore

  const msPerDay = 1000 * 60 * 60 * 24
  const sevenDays = 7 * msPerDay

  type RegistrationPhase = 'early-bird' | 'early-bird-ending' | 'regular' | 'closing-soon' | 'closed'

  const formatCountdown = (target: Date) => {
    const diffMs = Math.max(0, target.getTime() - now.getTime())
    const totalMinutes = Math.floor(diffMs / (1000 * 60))
    const days = Math.floor(totalMinutes / (60 * 24))
    const hours = Math.floor((totalMinutes - days * 24 * 60) / 60)
    const mins = totalMinutes - days * 24 * 60 - hours * 60
    return `${days} days ${hours} hrs ${mins} mins`
  }

  const msUntilEarlyBird = earlyBirdDeadline ? earlyBirdDeadline.getTime() - now.getTime() : null
  const earlyBirdEnded = !!earlyBirdDeadline && now > earlyBirdDeadline
  const earlyBirdActive = !!earlyBirdDeadline && !!msUntilEarlyBird && msUntilEarlyBird > 0
  const earlyBirdWithinSeven = !!msUntilEarlyBird && msUntilEarlyBird > 0 && msUntilEarlyBird < sevenDays

  const msUntilClose = registrationDeadline.getTime() - now.getTime()
  const registrationOpen = msUntilClose > 0
  const registrationWithinSeven = registrationOpen && msUntilClose < sevenDays

  const getEarlyBirdCard = () => {
    // If no early bird date, return a placeholder card with no subtitle
    if (!earlyBirdDeadline) {
      return {
        title: 'Early Bird Pricing',
        subtitle: null,
      }
    }

    if (earlyBirdEnded) {
      return {
        title: 'Early Bird Pricing',
        subtitle: `Ended ${formatTimelineDate(earlyBirdDeadline)}`,
      }
    }
    if (earlyBirdWithinSeven) {
      return {
        title: 'Early Bird Pricing Ends Soon',
        subtitle: `Closes ${formatTimelineDate(earlyBirdDeadline)}`,
      }
    }
    return {
      title: 'Early Bird Pricing',
      subtitle: `Ends ${formatTimelineDate(earlyBirdDeadline)}`,
    }
  }

  const getRegistrationCard = () => {
    if (registrationWithinSeven) {
      return {
        title: 'Registration Closes Soon',
        subtitle: `Open for ${formatCountdown(registrationDeadline)}`,
      }
    }
    return {
      title: 'Registration Open',
      subtitle: `Open for ${formatCountdown(registrationDeadline)}`,
    }
  }

  const getClosedCard = () => {
    if (!registrationOpen) {
      return {
        title: 'Registration Closed',
        subtitle: formatTimelineDate(registrationDeadline),
      }
    }
    if (registrationWithinSeven) {
      return {
        title: 'Registration Closes Soon',
        subtitle: formatTimelineDate(registrationDeadline),
      }
    }
    return {
      title: 'Registration Closes',
      subtitle: formatTimelineDate(registrationDeadline),
    }
  }

  const earlyBirdCardContent = getEarlyBirdCard()
  const registrationCardContent = getRegistrationCard()
  const closedCardContent = getClosedCard()

  type TimelinePhase = {
    id: RegistrationPhase
    title: string
    subtitle: string | null
    description: string
    show: boolean
  }

  const allPhases: TimelinePhase[] = [
    {
      id: 'early-bird' as const,
      title: earlyBirdCardContent.title,
      subtitle: earlyBirdCardContent.subtitle,
      description: '',
      show: !!earlyBirdDeadline,
    },
    {
      id: 'regular' as const,
      title: registrationCardContent.title,
      subtitle: registrationCardContent.subtitle,
      description: '',
      show: registrationOpen,
    },
    {
      id: 'closed' as const,
      title: closedCardContent.title,
      subtitle: closedCardContent.subtitle,
      description: '',
      show: true,
    },
  ].filter((phase) => phase.show)

  const isCardActive = (phaseId: RegistrationPhase): boolean => {
    if (phaseId === 'early-bird') {
      return earlyBirdActive
    }
    if (phaseId === 'regular') {
      return registrationOpen && !earlyBirdActive
    }
    if (phaseId === 'closed') {
      return !registrationOpen
    }
    return false
  }

  const gradient = brandGradients[organizerGradient]
  const firstGradientColor = gradient.css.match(/#[0-9A-Fa-f]{6}/)?.[0] ?? '#8E69D0'

  const getPhaseStyles = (phaseId: RegistrationPhase) => {
    const isCurrent = isCardActive(phaseId)

    if (!isCurrent) {
      return {
        border: 'border-border/30',
        background: 'bg-muted/10',
        dot: 'bg-muted-foreground/20',
        usesGradient: false,
      }
    }

    return {
      border: '',
      background: '',
      dot: '',
      gradientBg: gradient.css,
      borderColor: firstGradientColor,
      dotColor: firstGradientColor,
      usesGradient: true,
    }
  }

  const formatAmount = (price?: number | null) => {
    if (price === null || price === undefined) {
      return '—'
    }
    if (price === 0) {
      return 'Free'
    }
    return `$${price}`
  }

  const PRICING_DEADLINE_LABEL = earlyBirdDeadline
    ? earlyBirdDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Early Bird'
  const divisionsForPricing = event.availableDivisions ?? []
  const pricingRowsMap = divisionsForPricing.reduce(
    (map, division) => {
      const defaults = divisionPricingDefaults[division.name as keyof typeof divisionPricingDefaults]
      const label = defaults?.label ?? division.name
      if (map.has(label)) {
        return map
      }
      const before = defaults?.before ?? division.earlyBird?.price ?? null
      const after = defaults?.after ?? division.regular?.price ?? null
      map.set(label, {
        label,
        before: formatAmount(before),
        after: formatAmount(after),
      })
      return map
    },
    new Map<string, { label: string; before: string; after: string }>()
  )
  const pricingRowsArray = Array.from(pricingRowsMap.values())

  const timelinePhases = allPhases.map((phase) => {
    const phaseStyles = getPhaseStyles(phase.id)
    const isCurrent = isCardActive(phase.id)
    return {
      id: phase.id,
      title: phase.title,
      subtitle: phase.subtitle,
      border: phaseStyles.border,
      background: phaseStyles.background,
      dot: phaseStyles.dot,
      usesGradient: phaseStyles.usesGradient,
      gradientBg: phaseStyles.gradientBg,
      borderColor: phaseStyles.borderColor,
      dotColor: phaseStyles.dotColor,
      isCurrent,
    }
  })

  // Documents - use from event or empty array
  const documents = event.documents || []

  return {
    event: {
      id: event.id || '',
      name: event.name || '',
      date: event.date || '',
      description: event.description || '',
      organizer: event.organizer || '',
      location: event.location || '',
    },
    organizerGradient,
    organizerFollowers,
    organizerEventsCount,
    organizerHostingDuration,
    galleryImages,
    eventDateParts,
    venueName,
    cityState,
    registrationDeadlineISO,
    registrationClosed,
    timelinePhases,
    pricingDeadlineLabel: PRICING_DEADLINE_LABEL,
    pricingRows: pricingRowsArray,
    documents,
  }
}

