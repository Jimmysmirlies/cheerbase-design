/**
 * Event Registration Page
 *
 * Purpose
 * - Dedicated route presenting full event details before a club registers.
 * - Mirrors the registration detail page layout with PageHeader.
 *
 * Structure
 * - PageHeader with gradient banner
 * - Main content: overview, gallery, organizer, details
 * - Aside card: pricing, availability, primary CTA
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventDetailContent } from "@/components/features/events/EventDetailContent";
import { findEventById, listEvents, isRegistrationClosed } from "@/data/events";
import { findOrganizerByName, formatFollowers, formatHostingDuration } from "@/data/events/organizers";
import { divisionPricingDefaults } from "@/data/divisions";
import { buildEventGalleryImages } from "./image-gallery";
import { brandGradients, type BrandGradient } from "@/lib/gradients";

type EventPageParams = {
  eventId: string;
};

type EventPageProps = {
  params?: Promise<EventPageParams>;
};

export async function generateStaticParams() {
  return listEvents().map((event) => ({
    eventId: event.id,
  }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const resolvedParams = params ? await params : null;
  const eventId = resolvedParams?.eventId ? decodeURIComponent(resolvedParams.eventId) : null;
  const event = eventId ? findEventById(eventId) : null;
  if (!event) {
    return {
      title: "Event not found",
    };
  }

  return {
    title: `${event.name} · Register`,
    description: event.description,
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const resolvedParams = params ? await params : null;
  if (!resolvedParams) {
    notFound();
  }

  const eventId = decodeURIComponent(resolvedParams.eventId);
  const event = findEventById(eventId);

  if (!event) {
    notFound();
  }

  const galleryImages = buildEventGalleryImages(event);

  // Look up organizer data for gradient and stats
  const organizer = findOrganizerByName(event.organizer);

  // "Milestone Rail": timeline posts for critical event dates shown in the vertical rail.
  const formatTimelineDate = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

  const competitionDate = new Date(event.date);
  const dayBefore = new Date(competitionDate);
  dayBefore.setDate(dayBefore.getDate() - 1);
  
  // Format date parts for the key info row
  const eventDateParts = {
    month: competitionDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: competitionDate.getDate().toString(),
    weekday: competitionDate.toLocaleDateString("en-US", { weekday: "long" }),
    fullDate: competitionDate.toLocaleDateString("en-US", { day: "numeric", month: "long" }),
  };
  
  // Extract city/state from location for display
  const locationParts = event.location.split(", ");
  const venueName = locationParts[0] ?? event.location;
  const cityState = locationParts.slice(1).join(", ");
  
  // Use event's registration deadline if available, otherwise day before event
  const registrationDeadlineISO = event.registrationDeadline 
    ? new Date(event.registrationDeadline).toISOString()
    : dayBefore.toISOString();
  
  // Check if registration is closed
  const registrationClosed = isRegistrationClosed(event);

  // Registration status - determine current phase
  const now = new Date();
  const earlyBirdDeadline = event.earlyBirdDeadline ? new Date(event.earlyBirdDeadline) : null;
  const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : dayBefore;
  
  const msPerDay = 1000 * 60 * 60 * 24;
  const sevenDays = 7 * msPerDay;
  
  type RegistrationPhase = 
    | 'early-bird' 
    | 'early-bird-ending' 
    | 'regular' 
    | 'closing-soon' 
    | 'closed';
  
  // Build all timeline phases
  type TimelinePhase = {
    id: RegistrationPhase;
    title: string;
    subtitle: string | null;
    description: string;
    show: boolean;
  };
  
  
  const formatCountdown = (target: Date) => {
    const diffMs = Math.max(0, target.getTime() - now.getTime());
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes - days * 24 * 60) / 60);
    const mins = totalMinutes - days * 24 * 60 - hours * 60;
    return `${days} days ${hours} hrs ${mins} mins`;
  };
  
  const msUntilEarlyBird = earlyBirdDeadline ? earlyBirdDeadline.getTime() - now.getTime() : null;
  const earlyBirdEnded = !!earlyBirdDeadline && now > earlyBirdDeadline;
  const earlyBirdActive = !!earlyBirdDeadline && !!msUntilEarlyBird && msUntilEarlyBird > 0;
  const earlyBirdWithinSeven = !!msUntilEarlyBird && msUntilEarlyBird > 0 && msUntilEarlyBird < sevenDays;
  
  const msUntilClose = registrationDeadline.getTime() - now.getTime();
  const registrationOpen = msUntilClose > 0;
  const registrationWithinSeven = registrationOpen && msUntilClose < sevenDays;
  
  // Dynamic card content based on current state
  const getEarlyBirdCard = () => {
    if (earlyBirdEnded) {
      return {
        title: 'Early Bird Pricing',
        subtitle: `Ended ${formatTimelineDate(earlyBirdDeadline!)}`,
      };
    }
    if (earlyBirdWithinSeven) {
      return {
        title: 'Early Bird Pricing Ends Soon',
        subtitle: `Closes ${formatTimelineDate(earlyBirdDeadline!)}`,
      };
    }
    return {
      title: 'Early Bird Pricing',
      subtitle: `Ends ${formatTimelineDate(earlyBirdDeadline!)}`,
    };
  };
  
  const getRegistrationCard = () => {
    if (registrationWithinSeven) {
      return {
        title: 'Registration Closes Soon',
        subtitle: `Open for ${formatCountdown(registrationDeadline)}`,
      };
    }
    return {
      title: 'Registration Open',
      subtitle: `Open for ${formatCountdown(registrationDeadline)}`,
    };
  };
  
  const getClosedCard = () => {
    if (!registrationOpen) {
      return {
        title: 'Registration Closed',
        subtitle: formatTimelineDate(registrationDeadline),
      };
    }
    if (registrationWithinSeven) {
      return {
        title: 'Registration Closes Soon',
        subtitle: formatTimelineDate(registrationDeadline),
      };
    }
    return {
      title: 'Registration Closes',
      subtitle: formatTimelineDate(registrationDeadline),
    };
  };
  
  const earlyBirdCardContent = getEarlyBirdCard();
  const registrationCardContent = getRegistrationCard();
  const closedCardContent = getClosedCard();
  
  const allPhases: TimelinePhase[] = [
    // Card 1: Early Bird Pricing (only if event has early bird)
    {
      id: 'early-bird' as const,
      title: earlyBirdCardContent.title,
      subtitle: earlyBirdCardContent.subtitle,
      description: '',
      show: !!earlyBirdDeadline,
    },
    // Card 2: Registration Open / Closes Soon (only while registration is open)
    {
      id: 'regular' as const,
      title: registrationCardContent.title,
      subtitle: registrationCardContent.subtitle,
      description: '',
      show: registrationOpen,
    },
    // Card 3: Registration Closes / Closed
    {
      id: 'closed' as const,
      title: closedCardContent.title,
      subtitle: closedCardContent.subtitle,
      description: '',
      show: true,
    },
  ].filter(phase => phase.show);
  
  // Determine which card is currently active
  const isCardActive = (phaseId: RegistrationPhase): boolean => {
    if (phaseId === 'early-bird') {
      // Early bird card is active if early bird is still open
      return earlyBirdActive;
    }
    if (phaseId === 'regular') {
      // Registration card is active if registration is open AND early bird has ended (or doesn't exist)
      return registrationOpen && !earlyBirdActive;
    }
    if (phaseId === 'closed') {
      // Closed card is active only when registration has closed
      return !registrationOpen;
    }
    return false;
  };
  
  // Get organizer gradient styling for the current phase
  const gradientKey: BrandGradient = organizer?.gradient ?? 'primary';
  const gradient = brandGradients[gradientKey];
  
  // Extract the first color from the gradient for border
  // gradient.css format: 'linear-gradient(160deg, #8E69D0 0%, #576AE6 50.22%, #3B9BDF 100%)'
  const firstGradientColor = gradient.css.match(/#[0-9A-Fa-f]{6}/)?.[0] ?? '#8E69D0';
  
  const getPhaseStyles = (phaseId: RegistrationPhase) => {
    const isCurrent = isCardActive(phaseId);
    
    if (!isCurrent) {
      // Inactive phases - subtle styling
      return {
        border: 'border-border/30',
        background: 'bg-muted/10',
        dot: 'bg-muted-foreground/20',
        usesGradient: false,
      };
    }
    
    // Current phase uses organizer gradient
    return {
      border: '', // Will use inline style
      background: '', // Will use overlay
      dot: '', // Will use inline style
      gradientBg: gradient.css, // Pass the full gradient for inline styling
      borderColor: firstGradientColor,
      dotColor: firstGradientColor,
      usesGradient: true,
    };
  };

  // "Pricing Grid": divisions and tiered fees rendered in the table body.
  const formatAmount = (price?: number | null) => {
    if (price === null || price === undefined) {
      return "—";
    }
    if (price === 0) {
      return "Free";
    }
    return `$${price}`;
  };

  // Format early bird deadline for pricing table header
  const PRICING_DEADLINE_LABEL = earlyBirdDeadline 
    ? earlyBirdDeadline.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Early Bird";
  const divisionsForPricing = event.availableDivisions ?? [];
  const pricingRowsMap = divisionsForPricing.reduce((map, division) => {
    const defaults = divisionPricingDefaults[division.name as keyof typeof divisionPricingDefaults];
    const label = defaults?.label ?? division.name;
    if (map.has(label)) {
      return map;
    }
    const before = defaults?.before ?? division.earlyBird?.price ?? null;
    const after = defaults?.after ?? division.regular?.price ?? null;
    map.set(label, {
      label,
      before: formatAmount(before),
      after: formatAmount(after),
    });
    return map;
  }, new Map<string, { label: string; before: string; after: string }>());
  const pricingRowsArray = Array.from(pricingRowsMap.values());

  // "Prep Pack": downloadable resources for coaches and admins.
  const documents = [
    {
      name: "Event information packet",
      description: "Schedule overview, scoring rubric, venue policies",
      href: "#",
    },
    {
      name: "Routine music licensing form",
      description: "Submit proof of music licensing for each team",
      href: "#",
    },
    {
      name: "Insurance waiver",
      description: "Collect signed waivers for athletes and staff",
      href: "#",
    },
  ];

  // Build timeline phases data for client component
  const timelinePhases = allPhases.map((phase) => {
    const phaseStyles = getPhaseStyles(phase.id);
    const isCurrent = isCardActive(phase.id);
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
    };
  });

  return (
    <EventDetailContent
      event={{
        id: event.id,
        name: event.name,
        date: event.date,
        description: event.description,
        organizer: event.organizer,
        location: event.location,
      }}
      organizerGradient={organizer?.gradient ?? 'primary'}
      organizerFollowers={organizer ? formatFollowers(organizer.followers) : '—'}
      organizerEventsCount={organizer?.eventsCount}
      organizerHostingDuration={organizer ? formatHostingDuration(organizer.hostingYears) : undefined}
      galleryImages={galleryImages}
      eventDateParts={eventDateParts}
      venueName={venueName}
      cityState={cityState}
      registrationDeadlineISO={registrationDeadlineISO}
      registrationClosed={registrationClosed}
      timelinePhases={timelinePhases}
      pricingDeadlineLabel={PRICING_DEADLINE_LABEL}
      pricingRows={pricingRowsArray}
      documents={documents}
    />
  );
}
