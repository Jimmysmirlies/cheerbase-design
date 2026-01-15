import type { EventCardV2Props } from "@/components/ui/cards/EventCardV2";
import type { SeasonOption } from "@/components/providers/SeasonProvider";

export type EventRow = EventCardV2Props & { eventDate: Date };

export type MonthSection = {
  key: string;
  label: string;
  items: EventRow[];
};

export type ViewMode = "month" | "all";

export type AllEventsBucket = "upcoming" | "past" | "drafts";

export type EventsContentProps = {
  events: Event[];
  season: SeasonOption | null;
  selectedSeasonId: string;
  isAllSeasons: boolean;
  plan: { id: string; name: string; activeEventLimit: number };
  atLimit: boolean;
  viewMode: ViewMode;
  allEventsBucket: AllEventsBucket;
  collapsed: Record<string, boolean>;
  setCollapsed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
};

// Re-export for convenience
import type { Event } from "@/types/events";
export type { Event };
