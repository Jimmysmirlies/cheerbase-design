import { notFound } from "next/navigation";

import { PageTitle } from "@/components/layout/PageTitle";
import { NewRegistrationContent } from "@/components/features/registration/flow/NewRegistrationContent";
import { findEventById } from "@/data/events";
import { findOrganizerByName } from "@/data/events/organizers";
import { getClubData } from "@/lib/club-data";
import { formatFriendlyDate } from "@/utils/format";
import type { Event as ShowcaseEvent } from "@/types/events";

type RegisterPageParams = {
  eventId: string;
};

type RegisterPageProps = {
  params?: Promise<RegisterPageParams>;
};

export default async function RegisterEventPage({ params }: RegisterPageProps) {
  const resolvedParams = params ? await params : null;
  if (!resolvedParams) {
    notFound();
  }

  const clubData = await getClubData();
  const eventId = decodeURIComponent(resolvedParams.eventId);
  const eventData = findEventById(eventId) as ShowcaseEvent | undefined;

  if (!eventData) {
    notFound();
  }

  const eventDetails = eventData;
  const divisionPricing = eventDetails.availableDivisions ?? [];

  // Get organizer data for gradient
  const organizer = findOrganizerByName(eventDetails.organizer);
  const gradient = organizer?.gradient ?? "teal";

  // Calculate registration deadline (day before event)
  const eventDate = new Date(eventDetails.date);
  const registrationDeadline = new Date(eventDate);
  registrationDeadline.setDate(registrationDeadline.getDate() - 1);
  const registrationDeadlineLabel = formatFriendlyDate(registrationDeadline);

  // Format date label to match event detail page
  const dateLabel = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Build rosters from club data
  const rosters = clubData.rosters ?? [];

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:px-8">
      <PageTitle
          title={eventDetails.name}
          gradient={gradient}
          dateLabel={dateLabel}
          locationLabel={eventDetails.location}
        />

      <NewRegistrationContent
        eventId={eventId}
        eventName={eventDetails.name}
        organizer={eventDetails.organizer}
        organizerGradient={gradient}
        eventDate={eventDetails.date}
        location={eventDetails.location}
        divisionPricing={divisionPricing}
        teams={clubData.teams.map(({ id, name, division, size }) => ({
          id,
          name,
          division,
          size,
        }))}
        rosters={rosters}
        registrationDeadline={registrationDeadlineLabel}
      />
    </section>
  );
}
