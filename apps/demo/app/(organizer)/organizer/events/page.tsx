"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Badge } from "@workspace/ui/shadcn/badge";
import { Button } from "@workspace/ui/shadcn/button";
import { TextSelect } from "@workspace/ui/components/text-select";
import { Alert, AlertDescription } from "@workspace/ui/shadcn/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/shadcn/tooltip";
import {
  PlusIcon,
  CalendarRangeIcon,
  ListIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  AlertCircleIcon,
} from "lucide-react";
import { motion } from "framer-motion";

import { useOrganizer } from "@/hooks/useOrganizer";
import { useOrganizerSubscription } from "@/hooks/useOrganizerSubscription";
import {
  getEventsByOrganizerId,
  getActiveEventCount,
  parseEventDate,
  isEventInSeason,
} from "@/data/events/selectors";
import { PageHeader } from "@/components/layout/PageHeader";
import { CardSkeleton } from "@/components/ui";
import {
  OrganizerEventCard,
  getRegistrationStatus,
  type OrganizerEventCardProps,
} from "@/components/ui/cards/OrganizerEventCard";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import type { Event } from "@/types/events";

type EventRow = OrganizerEventCardProps & { eventDate: Date }
type MonthSection = {
  key: string
  label: string
  items: EventRow[]
}
type SeasonOption = {
  id: string
  label: string
  start: Date
  end: Date
  type: "current" | "past"
}
type ViewMode = "month" | "all"

const seasonOptions: SeasonOption[] = [
  {
    id: "2025-2026",
    label: "Nov 2025 - May 2026",
    start: new Date(2025, 10, 1),
    end: new Date(2026, 4, 30),
    type: "current",
  },
  {
    id: "2024-2025",
    label: "Nov 2024 - May 2025",
    start: new Date(2024, 10, 1),
    end: new Date(2025, 4, 30),
    type: "past",
  },
  {
    id: "2023-2024",
    label: "Nov 2023 - May 2024",
    start: new Date(2023, 10, 1),
    end: new Date(2024, 4, 30),
    type: "past",
  },
]

const defaultSeason =
  seasonOptions.find((season) => season.type === "current") ?? seasonOptions[0]!
const defaultSeasonId = defaultSeason.id

function resolveSeasonById(seasonId: string): SeasonOption {
  return seasonOptions.find((season) => season.id === seasonId) ?? defaultSeason
}

export default function OrganizerEventsPage() {
  const { organizerId, isLoading } = useOrganizer();
  const {
    plan,
    canAddActiveEvent,
    isLoading: subscriptionLoading,
  } = useOrganizerSubscription();
  const [selectedSeasonId, setSelectedSeasonId] =
    useState<string>(defaultSeasonId);

  const events = organizerId ? getEventsByOrganizerId(organizerId) : [];
  const activeEventCount = organizerId ? getActiveEventCount(organizerId) : 0;
  const canCreateEvent = canAddActiveEvent(activeEventCount);
  const atLimit = !canCreateEvent;

  const selectedSeason = resolveSeasonById(selectedSeasonId);

  if (isLoading || subscriptionLoading) {
    return (
      <section className="flex flex-1 flex-col">
        <PageHeader
          title="Events"
          subtitle="Create, manage, and track your competitions."
          hideSubtitle
          breadcrumbItems={[
            { label: "Organizer", href: "/organizer" },
            { label: "Events", href: "/organizer/events" },
          ]}
        />
        <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} rows={3} showMedia />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col">
      <PageHeader
        title="Events"
        subtitle="Create, manage, and track your competitions."
        hideSubtitle
        breadcrumbItems={[
          { label: "Organizer", href: "/organizer" },
          { label: "Events", href: "/organizer/events" },
        ]}
        action={
          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="inline-flex items-center gap-2"
                  disabled={atLimit}
                >
                  <PlusIcon className="size-4" />
                  New Event
                </Button>
              </TooltipTrigger>
              {atLimit && (
                <TooltipContent side="bottom">
                  You&apos;ve reached your active event limit (
                  {plan.activeEventLimit})
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <motion.div
          className="w-full"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <EventsContent
            events={events}
            season={selectedSeason}
            selectedSeasonId={selectedSeasonId}
            onSelectSeason={setSelectedSeasonId}
            activeEventCount={activeEventCount}
            plan={plan}
            atLimit={atLimit}
          />
        </motion.div>
      </div>
    </section>
  );
}

function EventsContent({
  events,
  season,
  selectedSeasonId,
  onSelectSeason,
  activeEventCount,
  plan,
  atLimit,
}: {
  events: Event[]
  season: SeasonOption
  selectedSeasonId: string
  onSelectSeason: (seasonId: string) => void
  activeEventCount: number
  plan: { id: string; name: string; activeEventLimit: number }
  atLimit: boolean
}) {
  // Transform events into card rows with parsed dates
  const rows = useMemo(() => {
    return events.map((event): EventRow => {
      const eventDate = parseEventDate(event.date);
      const statusLabel = getRegistrationStatus(event);
      return {
        id: event.id,
        image: event.image,
        title: event.name,
        date: event.date,
        eventDate,
        location: event.location,
        teamsFilled: event.slots.filled,
        teamsCapacity: event.slots.capacity,
        statusLabel,
        fee: event.fee,
      };
    });
  }, [events]);

  // Filter rows by selected season
  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        isEventInSeason(row.eventDate, season.start, season.end)
      ),
    [rows, season]
  );

  // Build month sections for month view
  const sections = useMemo(
    () => buildMonthSections(filteredRows, season),
    [filteredRows, season]
  );

  // Split into upcoming/past for all view
  const bucketedRows = useMemo(() => {
    const now = new Date();
    const upcoming: EventRow[] = [];
    const past: EventRow[] = [];

    filteredRows.forEach((row) => {
      const bucket: "upcoming" | "past" = Number.isNaN(row.eventDate.getTime())
        ? "upcoming"
        : row.eventDate < now
          ? "past"
          : "upcoming";
      if (bucket === "past") {
        past.push(row);
      } else {
        upcoming.push(row);
      }
    });

    return { upcoming, past };
  }, [filteredRows]);

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [allEventsBucket, setAllEventsBucket] = useState<"upcoming" | "past">(
    "upcoming"
  );
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const listRows = useMemo(
    () =>
      allEventsBucket === "past" ? bucketedRows.past : bucketedRows.upcoming,
    [allEventsBucket, bucketedRows]
  );

  const seasonSelectSections = useMemo(() => {
    const current = seasonOptions
      .filter((option) => option.type === "current")
      .map((option) => ({ value: option.id, label: option.label }));
    const past = seasonOptions
      .filter((option) => option.type === "past")
      .map((option) => ({ value: option.id, label: option.label }));
    const sections: {
      label: string
      options: { value: string; label: string }[]
      showDivider?: boolean
    }[] = [];
    if (current.length) {
      sections.push({ label: "Current Season", options: current });
    }
    if (past.length) {
      sections.push({
        label: "Past Seasons",
        options: past,
        showDivider: current.length > 0,
      });
    }
    return sections;
  }, []);

  // Initialize collapse state for month sections
  useEffect(() => {
    const nextState: Record<string, boolean> = {};
    sections.forEach((section) => {
      nextState[section.key] = false;
    });
    setCollapsed(nextState);
  }, [sections]);

  const toggleSection = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section className="space-y-6">
      {/* Upgrade banner when at limit */}
      {atLimit && (
        <motion.div
          className="w-full"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20">
            <AlertCircleIcon className="size-4 text-amber-600" />
            <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-amber-800 dark:text-amber-200">
                You&apos;ve reached your active event limit (
                {plan.activeEventLimit}). Upgrade to create more.
              </span>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="gap-1.5 border-amber-300 hover:bg-amber-100 dark:border-amber-800 dark:hover:bg-amber-900/30"
              >
                <Link href="/organizer/settings/subscription">
                  <SparklesIcon className="size-3.5" />
                  Upgrade to Pro
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Season selector and view mode toggle */}
      <motion.div
        className="w-full"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="border-b border-border pb-4">
          <div className="flex flex-wrap items-end gap-3">
            <TextSelect
              value={selectedSeasonId}
              onValueChange={onSelectSeason}
              sections={seasonSelectSections}
              size="large"
              label="Viewing Season"
              triggerClassName="justify-between heading-3 text-primary"
              itemClassName="text-lg font-semibold"
              contentClassName="min-w-[340px]"
            />
            <div className="ml-auto flex items-center gap-3">
              <p className="text-xs text-muted-foreground">
                Active:{" "}
                <span
                  className={atLimit ? "font-medium text-amber-600" : ""}
                >
                  {activeEventCount} / {plan.activeEventLimit}
                </span>
                {plan.id === "free" && (
                  <span className="ml-1 text-muted-foreground/70">
                    ({plan.name})
                  </span>
                )}
              </p>
              <TooltipProvider delayDuration={120}>
                <div className="relative inline-flex shrink-0 items-center rounded-md border border-border/70 bg-muted/40 p-1">
                  <div
                    className={`absolute left-1 top-1 h-9 w-9 rounded-md bg-card shadow transition-transform duration-200 ease-out ${
                      viewMode === "all" ? "translate-x-9" : ""
                    }`}
                    aria-hidden
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="relative z-10 size-9 rounded-md"
                        aria-label="Month view"
                        aria-pressed={viewMode === "month"}
                        onClick={() => setViewMode("month")}
                      >
                        <CalendarRangeIcon className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Month view</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="relative z-10 size-9 rounded-md"
                        aria-label="All events"
                        aria-pressed={viewMode === "all"}
                        onClick={() => setViewMode("all")}
                      >
                        <ListIcon className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">All events</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upcoming/Past badges for all view */}
      {viewMode === "all" ? (
        <motion.div
          className="w-full"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2">
            <Badge
              role="button"
              tabIndex={0}
              variant={allEventsBucket === "upcoming" ? "default" : "outline"}
              className="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
              aria-pressed={allEventsBucket === "upcoming"}
              onClick={() => setAllEventsBucket("upcoming")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setAllEventsBucket("upcoming");
                }
              }}
            >
              Upcoming
            </Badge>
            <Badge
              role="button"
              tabIndex={0}
              variant={allEventsBucket === "past" ? "default" : "outline"}
              className="cursor-pointer rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
              aria-pressed={allEventsBucket === "past"}
              onClick={() => setAllEventsBucket("past")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setAllEventsBucket("past");
                }
              }}
            >
              Past
            </Badge>
          </div>
        </motion.div>
      ) : null}

      {/* Month view */}
      {viewMode === "month" ? (
        <motion.div
          key={`month-view-${season.id}`}
          className="w-full"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {sections.map((section) => (
              <motion.div key={section.key} className="w-full" variants={fadeInUp}>
                <div className="space-y-3 border-b border-border pb-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="heading-3 text-foreground">
                      {section.label}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {section.items.length}
                        </span>
                        <span>
                          {section.items.length === 1 ? "event" : "events"}
                        </span>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleSection(section.key)}
                        aria-label={
                          collapsed[section.key]
                            ? "Expand month"
                            : "Collapse month"
                        }
                      >
                        {collapsed[section.key] ? (
                          <ChevronDownIcon className="size-5" />
                        ) : (
                          <ChevronUpIcon className="size-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {!collapsed[section.key] ? (
                    section.items.length ? (
                      <motion.div
                        className="grid grid-cols-1 justify-items-start gap-4 pb-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                      >
                        {section.items.map((row) => (
                          <motion.div
                            key={row.id}
                            variants={fadeInUp}
                            className="h-full w-full"
                          >
                            <OrganizerEventCard {...row} />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                        No events this month.
                      </div>
                    )
                  ) : null}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      ) : (
        /* All events view */
        <motion.div
          key={`list-view-${season.id}`}
          className="w-full"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="space-y-4">
            {listRows.length ? (
              <motion.div
                className="grid grid-cols-1 justify-items-start gap-4 pb-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {listRows.map((row) => (
                  <motion.div
                    key={row.id}
                    variants={fadeInUp}
                    className="h-full w-full"
                  >
                    <OrganizerEventCard {...row} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                {allEventsBucket === "past"
                  ? "No past events in this season."
                  : "No upcoming events in this season."}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </section>
  );
}

function buildMonthSections(
  rows: EventRow[],
  season: SeasonOption
): MonthSection[] {
  const start = new Date(season.start.getFullYear(), season.start.getMonth(), 1);
  const end = new Date(season.end.getFullYear(), season.end.getMonth(), 1);

  const months: MonthSection[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
    const label = cursor.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
    const items = rows.filter((row) => {
      const d = row.eventDate;
      return (
        d.getFullYear() === cursor.getFullYear() &&
        d.getMonth() === cursor.getMonth()
      );
    });
    months.push({ key, label, items });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
}
