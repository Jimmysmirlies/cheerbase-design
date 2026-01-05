import { FALLBACK_EVENT_IMAGE } from "@/data/events/fallbacks";
import type { Event } from "@/types/events";

export function buildEventGalleryImages(event: Event): string[] {
  const gallery = event.gallery ?? [];
  const items = [event.image, ...gallery].filter(
    (img): img is string => typeof img === "string" && img.length > 0,
  );
  const unique = Array.from(new Set(items));
  return unique.length ? unique : [FALLBACK_EVENT_IMAGE];
}
