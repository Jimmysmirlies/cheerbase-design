import type { Event, EventCategory } from "@/types/events";

import { eventCategories } from "./categories";

type EventSummary = {
  id: string;
  title: string;
  organizer: string;
  type: string;
  date: string;
  location: string;
  teams: string;
  fee: string;
  image: string;
  description: string;
  pricePerParticipant?: string;
  tags?: string[];
};

const allEvents: EventSummary[] = eventCategories.flatMap((category: EventCategory) =>
  category.events.map((event: Event) => ({
    id: event.id,
    title: event.name,
    organizer: event.organizer,
    type: event.type,
    date: event.date,
    location: event.location,
    teams: event.teams,
    fee: event.fee,
    image: event.image,
    description: event.description,
    pricePerParticipant: event.pricePerParticipant,
    tags: event.tags,
  })),
);

export const featuredEvents: Array<EventSummary & { href: string }> = allEvents.slice(0, 3).map((event) => ({
  ...event,
  href: `/events/${encodeURIComponent(event.id)}`,
}));
