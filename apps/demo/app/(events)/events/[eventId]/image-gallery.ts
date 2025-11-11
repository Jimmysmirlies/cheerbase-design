import type { Event } from "@/types/events";

export function buildEventGalleryImages(event: Event) {
  const gallery = event.gallery ?? [];
  const unique = Array.from(new Set([event.image, ...gallery]));
  return unique;
}
