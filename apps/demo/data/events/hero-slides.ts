import type { HeroSlide } from "@/components/ui";

import { featuredEvents } from "./featured";

export const heroSlides: HeroSlide[] = featuredEvents.map((event) => {
  const highlightCandidates = [
    `${event.location} · ${event.date}`,
    event.teams,
    event.pricePerParticipant,
    event.tags?.[0],
  ].filter(Boolean) as string[];

  return {
    id: `featured-${event.id}`,
    layout: "event-card",
    eyebrow: event.type,
    headline: event.title,
    description: event.description,
    highlights: highlightCandidates.slice(0, 3),
    featuredEvent: {
      image: event.image,
      type: event.type,
      title: event.title,
      organizer: event.organizer,
      date: event.date,
      location: event.location,
      teams: event.teams,
      fee: event.fee,
      href: event.href,
    },
    primaryAction: { label: "View event", href: event.href },
    secondaryActions: [{ label: "View pricing", href: `${event.href}#pricing`, variant: "secondary" }],
  };
});
