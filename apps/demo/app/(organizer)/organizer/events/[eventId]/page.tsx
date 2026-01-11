"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OrganizerEventDetailContent } from "@/components/features/events/OrganizerEventDetailContent";
import {
  findEventByIdIncludingDrafts,
  isRegistrationClosed,
} from "@/data/events";
import {
  findOrganizerByName,
  formatFollowers,
  formatHostingDuration,
} from "@/data/events/organizers";
import { buildEventGalleryImages } from "@/app/(events)/events/[eventId]/image-gallery";
import { brandGradients, type BrandGradient } from "@/lib/gradients";
import { useAuth } from "@/components/providers/AuthProvider";

export default function OrganizerEventViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, status } = useAuth();
  const organizerId = user?.organizerId;

  const eventId =
    typeof params?.eventId === "string"
      ? decodeURIComponent(params.eventId)
      : null;

  const [organizerGradient, setOrganizerGradient] = useState<
    BrandGradient | undefined
  >(undefined);

  // Load event (including drafts)
  const event = useMemo(() => {
    if (!eventId) return null;
    return findEventByIdIncludingDrafts(eventId, organizerId || undefined);
  }, [eventId, organizerId]);

  // Load organizer gradient
  useEffect(() => {
    if (!organizerId) return;

    const loadGradient = () => {
      try {
        const stored = localStorage.getItem(
          `cheerbase-organizer-settings-${organizerId}`,
        );
        if (stored) {
          const settings = JSON.parse(stored);
          if (settings.gradient) {
            setOrganizerGradient(settings.gradient);
            return;
          }
        }
      } catch {
        // Ignore storage errors
      }
      // Fall back to organizer's default gradient
      const organizer = findOrganizerByName(event?.organizer || "");
      if (organizer) {
        setOrganizerGradient(organizer.gradient as BrandGradient);
      }
    };

    loadGradient();

    const handleSettingsChange = (
      settingsEvent: CustomEvent<{ gradient: string }>,
    ) => {
      if (settingsEvent.detail?.gradient) {
        setOrganizerGradient(settingsEvent.detail.gradient as BrandGradient);
      }
    };

    window.addEventListener(
      "organizer-settings-changed",
      handleSettingsChange as EventListener,
    );
    return () => {
      window.removeEventListener(
        "organizer-settings-changed",
        handleSettingsChange as EventListener,
      );
    };
  }, [organizerId, event?.organizer]);

  useEffect(() => {
    if (status === "loading") return;
    if (!user || user.role !== "organizer") {
      router.replace("/organizer/events");
      return;
    }
    if (!eventId || !event) {
      router.replace("/organizer/events");
      return;
    }
  }, [user, status, router, eventId, event]);

  if (status === "loading" || !event) {
    return (
      <section className="flex min-h-screen flex-1 flex-col gap-6 py-8">
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        </div>
      </section>
    );
  }

  const galleryImages = buildEventGalleryImages(event);
  const organizer = findOrganizerByName(event.organizer);

  // Format timeline dates
  const formatTimelineDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  const competitionDate = new Date(event.date);
  // Handle invalid dates (e.g., from draft events with missing date field)
  const isValidDate = !isNaN(competitionDate.getTime());
  const dayBefore = isValidDate ? new Date(competitionDate) : new Date();
  if (isValidDate) {
    dayBefore.setDate(dayBefore.getDate() - 1);
  }

  const eventDateParts = isValidDate
    ? {
        month: competitionDate
          .toLocaleDateString("en-US", { month: "short" })
          .toUpperCase(),
        day: competitionDate.getDate().toString(),
        weekday: competitionDate.toLocaleDateString("en-US", {
          weekday: "long",
        }),
        fullDate: competitionDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
        }),
      }
    : {
        month: "TBD",
        day: "—",
        weekday: "Date not set",
        fullDate: "Date not set",
      };

  const locationParts = event.location.split(", ");
  const venueName = locationParts[0] ?? event.location;
  const cityState = locationParts.slice(1).join(", ");

  const registrationDeadlineISO = event.registrationDeadline
    ? new Date(event.registrationDeadline).toISOString()
    : dayBefore.toISOString();

  const registrationClosed = isRegistrationClosed(event);

  // Build timeline phases
  const now = new Date();
  const earlyBirdDeadline = event.earlyBirdDeadline
    ? new Date(event.earlyBirdDeadline)
    : null;
  const registrationDeadline = event.registrationDeadline
    ? new Date(event.registrationDeadline)
    : dayBefore;

  type RegistrationPhase = "early-bird" | "regular" | "closed";

  const msUntilEarlyBird = earlyBirdDeadline
    ? earlyBirdDeadline.getTime() - now.getTime()
    : null;
  const earlyBirdActive =
    !!earlyBirdDeadline && !!msUntilEarlyBird && msUntilEarlyBird > 0;

  const msUntilClose = registrationDeadline.getTime() - now.getTime();
  const registrationOpen = msUntilClose > 0;

  const getEarlyBirdCard = () => {
    if (!earlyBirdDeadline) {
      return {
        title: "Early Bird Pricing",
        subtitle: null,
      };
    }
    return {
      title: "Early Bird Pricing",
      subtitle: `Ends ${formatTimelineDate(earlyBirdDeadline)}`,
    };
  };

  const getRegistrationCard = () => {
    return {
      title: "Registration Open",
      subtitle: `Ends ${formatTimelineDate(registrationDeadline)}`,
    };
  };

  const getClosedCard = () => {
    return {
      title: "Registration Closed",
      subtitle: formatTimelineDate(registrationDeadline),
    };
  };

  const earlyBirdCardContent = getEarlyBirdCard();
  const registrationCardContent = getRegistrationCard();
  const closedCardContent = getClosedCard();

  type TimelinePhase = {
    id: RegistrationPhase;
    title: string;
    subtitle: string | null;
    description: string;
    show: boolean;
  };

  const allPhases: TimelinePhase[] = [
    {
      id: "early-bird" as const,
      title: earlyBirdCardContent.title,
      subtitle: earlyBirdCardContent.subtitle,
      description: "",
      show: !!earlyBirdDeadline,
    },
    {
      id: "regular" as const,
      title: registrationCardContent.title,
      subtitle: registrationCardContent.subtitle,
      description: "",
      show: registrationOpen,
    },
    {
      id: "closed" as const,
      title: closedCardContent.title,
      subtitle: closedCardContent.subtitle,
      description: "",
      show: true,
    },
  ].filter((phase) => phase.show);

  const isCardActive = (phaseId: RegistrationPhase): boolean => {
    if (phaseId === "early-bird") {
      return earlyBirdActive;
    }
    if (phaseId === "regular") {
      return registrationOpen && !earlyBirdActive;
    }
    if (phaseId === "closed") {
      return !registrationOpen;
    }
    return false;
  };

  // Use saved gradient from settings (organizerGradient) or fall back to organizer's default
  const gradientKey: BrandGradient =
    organizerGradient ?? organizer?.gradient ?? "teal";
  const gradient = brandGradients[gradientKey];
  const firstGradientColor =
    gradient.css.match(/#[0-9A-Fa-f]{6}/)?.[0] ?? "#8E69D0";

  const getPhaseStyles = (phaseId: RegistrationPhase) => {
    const isCurrent = isCardActive(phaseId);

    if (!isCurrent) {
      return {
        border: "border-border/30",
        background: "bg-muted/10",
        dot: "bg-muted-foreground/20",
        usesGradient: false,
      };
    }

    return {
      border: "",
      background: "",
      dot: "",
      gradientBg: gradient.css,
      borderColor: firstGradientColor,
      dotColor: firstGradientColor,
      usesGradient: true,
    };
  };

  const formatAmount = (price?: number | null) => {
    if (price === null || price === undefined) {
      return "—";
    }
    if (price === 0) {
      return "Free";
    }
    return `$${price}`;
  };

  const PRICING_DEADLINE_LABEL = earlyBirdDeadline
    ? earlyBirdDeadline.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Early Bird";
  // Build pricing rows using the actual division names from the event
  const divisionsForPricing = event.availableDivisions ?? [];
  const pricingRowsArray = divisionsForPricing.map((division) => {
    // Use actual division name as the label
    const label = division.name;
    // Use event-specific pricing
    const before = division.earlyBird?.price ?? division.regular?.price ?? null;
    const after = division.regular?.price ?? null;
    return {
      label,
      subtitle: "", // Division names are self-descriptive
      before: formatAmount(before),
      after: formatAmount(after),
    };
  });

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

  const isDraft = event.status === "draft";

  return (
    <OrganizerEventDetailContent
      isDraft={isDraft}
      organizerPageGradient={organizerGradient}
      organizerId={organizerId}
      event={{
        id: event.id,
        name: event.name,
        date: event.date,
        description: event.description,
        organizer: event.organizer,
        location: event.location,
      }}
      organizerGradient={organizerGradient ?? organizer?.gradient ?? "teal"}
      organizerFollowers={
        organizer ? formatFollowers(organizer.followers) : "—"
      }
      organizerEventsCount={organizer?.eventsCount}
      organizerHostingDuration={
        organizer ? formatHostingDuration(organizer.hostingYears) : undefined
      }
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
