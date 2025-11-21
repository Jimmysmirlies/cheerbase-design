import type { HeroSlide } from "@/components/ui";

import { featuredEvents } from "./featured";

export const heroSlides: HeroSlide[] = featuredEvents.map((event) => ({
  id: `featured-${event.id}`,
  fullImage: true,
  headline: event.title,
  organizer: event.organizer,
  image: event.image,
  imageAlt: `${event.title} highlight`,
  primaryAction: { label: "View event", href: event.href },
}));
