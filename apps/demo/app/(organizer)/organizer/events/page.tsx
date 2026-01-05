"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@workspace/ui/shadcn/badge";
import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import { GlassSelect } from "@workspace/ui/components/glass-select";
import { TagTabs } from "@/components/ui/controls/TagTabs";
import { Alert, AlertDescription } from "@workspace/ui/shadcn/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/shadcn/dialog";
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
import { useOrganizerEventDrafts } from "@/hooks/useOrganizerEventDrafts";
import type { Event } from "@/types/events";
import {
  getEventsByOrganizerId,
  getActiveEventCount,
  parseEventDate,
  isEventInSeason,
} from "@/data/events/selectors";
import { PageHeader } from "@/components/layout/PageHeader";
import { ActionBar } from "@/components/layout/ActionBar";
import { type BrandGradient } from "@/lib/gradients";
import { CardSkeleton } from "@/components/ui";
import {
  OrganizerEventCard,
  getRegistrationStatus,
  type OrganizerEventCardProps,
} from "@/components/ui/cards/OrganizerEventCard";
import { fadeInUp, staggerContainer } from "@/lib/animations";

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

const ALL_SEASONS_ID = "all"

const defaultSeason =
  seasonOptions.find((season) => season.type === "current") ?? seasonOptions[0]!
const defaultSeasonId = defaultSeason.id

function resolveSeasonById(seasonId: string): SeasonOption | null {
  if (seasonId === ALL_SEASONS_ID) return null
  return seasonOptions.find((season) => season.id === seasonId) ?? defaultSeason
}

export default function OrganizerEventsPage() {
  const router = useRouter();
  const { organizer, organizerId, isLoading } = useOrganizer();
  const {
    plan,
    canAddActiveEvent,
    isLoading: subscriptionLoading,
  } = useOrganizerSubscription();
  const [selectedSeasonId, setSelectedSeasonId] =
    useState<string>(defaultSeasonId);
  const [organizerGradient, setOrganizerGradient] = useState<BrandGradient | undefined>(undefined);

  // New event modal state
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [newEventType, setNewEventType] = useState<"Championship" | "Friendly Competition">("Championship");
  const [newEventCapacity, setNewEventCapacity] = useState<string>("");

  // Load organizer gradient from settings or default
  useEffect(() => {
    const loadGradient = () => {
      if (organizerId) {
        try {
          const stored = localStorage.getItem(`cheerbase-organizer-settings-${organizerId}`)
          if (stored) {
            const settings = JSON.parse(stored)
            if (settings.gradient) {
              setOrganizerGradient(settings.gradient)
              return
            }
          }
        } catch {
          // Ignore storage errors
        }
      }
      // Fall back to organizer's default gradient
      setOrganizerGradient(organizer?.gradient as BrandGradient | undefined)
    }

    loadGradient()

    // Listen for settings changes
    const handleSettingsChange = (event: CustomEvent<{ gradient: string }>) => {
      if (event.detail?.gradient) {
        setOrganizerGradient(event.detail.gradient as BrandGradient)
      }
    }

    window.addEventListener('organizer-settings-changed', handleSettingsChange as EventListener)
    return () => {
      window.removeEventListener('organizer-settings-changed', handleSettingsChange as EventListener)
    }
  }, [organizerId, organizer?.gradient])

  const organizerIdOrUndefined = organizerId ?? undefined;
  const { drafts, saveDraft } = useOrganizerEventDrafts(organizerIdOrUndefined);
  // Memoize base events so downstream memoized selectors stay stable between renders
  const baseEvents = useMemo(
    () => (organizerId ? getEventsByOrganizerId(organizerId) : []),
    [organizerId]
  );
  
  // Merge drafts with base events (drafts override by id)
  const allEvents = useMemo(() => {
    const eventMap = new Map(baseEvents.map(e => [e.id, e]));
    drafts.forEach(draft => {
      eventMap.set(draft.id, draft);
    });
    return Array.from(eventMap.values());
  }, [baseEvents, drafts]);
  
  const activeEventCount = organizerId ? getActiveEventCount(organizerId) : 0;
  const canCreateEvent = canAddActiveEvent(activeEventCount);
  const atLimit = !canCreateEvent;

  const selectedSeason = resolveSeasonById(selectedSeasonId);

  const seasonSelectOptions = useMemo(() => {
    // All seasons in descending order (newest first)
    const allSeasonsSorted = [...seasonOptions].sort((a, b) => {
      // Sort by start date descending
      return b.start.getTime() - a.start.getTime();
    }).map((option) => ({ value: option.id, label: option.label }));
    
    return [
      { value: ALL_SEASONS_ID, label: "All Seasons" },
      { type: "separator" as const },
      ...allSeasonsSorted,
    ];
  }, []);

  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [allEventsBucket, setAllEventsBucket] = useState<"upcoming" | "past" | "drafts">(
    "upcoming"
  );
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Handler to create new event - saves draft immediately
  const handleNewEventContinue = () => {
    if (!organizerId) return;

    // Generate ID now so it's in drafts immediately
    const eventId = `event-${Date.now()}`;
    const capacity = newEventCapacity ? Number(newEventCapacity) : 0;

    // Save draft immediately
    const draftEvent: Event = {
      id: eventId,
      name: newEventName,
      type: newEventType,
      slots: { filled: 0, capacity },
      status: 'draft',
      organizer: organizer?.name || '',
      date: '',
      location: '',
      description: '',
      image: '',
      teams: capacity > 0 ? `0 / ${capacity} teams` : '0 / 0 teams',
      updatedAt: new Date().toISOString(),
    };
    saveDraft(draftEvent);

    // Navigate to edit page (draft already exists)
    router.push(`/organizer/events/${eventId}/edit`);
    setShowNewEventModal(false);

    // Reset form
    setNewEventName("");
    setNewEventType("Championship");
    setNewEventCapacity("");
  };

  if (isLoading || subscriptionLoading) {
    return (
      <section className="flex flex-1 flex-col">
        <PageHeader title="Events" gradient={organizerGradient} />
        <ActionBar
          actions={
            <Button size="sm" disabled>
              <PlusIcon className="size-4 mr-2" />
              New Event
            </Button>
          }
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
        gradient={organizerGradient}
      />

      <ActionBar
        leftContent={
          <GlassSelect
            value={selectedSeasonId}
            onValueChange={(val) => {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/0539df34-fe7d-4aed-8499-019797bffb2a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H2',location:'organizer/events/page.tsx:ActionBarSelect',message:'season select change',data:{nextVal:val},timestamp:Date.now()})}).catch(()=>{});
              // #endregion
              setSelectedSeasonId(val);
            }}
            options={seasonSelectOptions}
          />
        }
        actions={
          <div className="flex items-center gap-3">
            {/* New Event button */}
            <TooltipProvider delayDuration={120}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={atLimit}
                    onClick={() => setShowNewEventModal(true)}
                  >
                    <PlusIcon className="size-4 mr-2" />
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

            {/* Vertical divider */}
            <div className="h-6 w-px bg-border" />

            {/* View mode toggle */}
            <TooltipProvider delayDuration={120}>
              <div className="relative inline-flex shrink-0 items-center rounded-md border border-border/70 bg-muted/40 p-1">
                <div
                  className={`absolute left-1 top-1 h-9 w-9 rounded-md bg-card shadow transition-transform duration-200 ease-out ${
                    viewMode === "month" ? "translate-x-9" : ""
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
                      aria-label="All events"
                      aria-pressed={viewMode === "all"}
                    onClick={() => {
                      // #region agent log
                      fetch('http://127.0.0.1:7242/ingest/0539df34-fe7d-4aed-8499-019797bffb2a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H3',location:'organizer/events/page.tsx:ActionBarToggle',message:'set viewMode all',data:{from:viewMode},timestamp:Date.now()})}).catch(()=>{});
                      // #endregion
                      setViewMode("all");
                    }}
                    >
                      <ListIcon className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">All events</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="relative z-10 size-9 rounded-md"
                      aria-label="Month view"
                      aria-pressed={viewMode === "month"}
                    onClick={() => {
                      // #region agent log
                      fetch('http://127.0.0.1:7242/ingest/0539df34-fe7d-4aed-8499-019797bffb2a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H3',location:'organizer/events/page.tsx:ActionBarToggle',message:'set viewMode month',data:{from:viewMode},timestamp:Date.now()})}).catch(()=>{});
                      // #endregion
                      setViewMode("month");
                    }}
                    >
                      <CalendarRangeIcon className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Month view</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
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
            events={allEvents}
            season={selectedSeason}
            selectedSeasonId={selectedSeasonId}
            activeEventCount={activeEventCount}
            plan={plan}
            atLimit={atLimit}
            viewMode={viewMode}
            allEventsBucket={allEventsBucket}
            setAllEventsBucket={setAllEventsBucket}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        </motion.div>
      </div>

      {/* New Event Setup Modal */}
      <Dialog open={showNewEventModal} onOpenChange={setShowNewEventModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Set up your event basics to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-event-name">Event Name *</Label>
              <Input
                id="new-event-name"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="e.g., National Cheerleading Championship"
              />
            </div>
            <div className="space-y-2">
              <GlassSelect
                label="Event Type"
                value={newEventType}
                onValueChange={(value) => setNewEventType(value as "Championship" | "Friendly Competition")}
                options={[
                  { value: "Championship", label: "Championship" },
                  { value: "Friendly Competition", label: "Friendly Competition" },
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-event-capacity">Team Capacity</Label>
              <Input
                id="new-event-capacity"
                type="number"
                min="0"
                value={newEventCapacity}
                onChange={(e) => setNewEventCapacity(e.target.value)}
                placeholder="Leave empty for unlimited"
              />
              <p className="text-xs text-muted-foreground">
                Set a team slot limit to restrict the number of registrants.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewEventModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleNewEventContinue} disabled={!newEventName.trim()}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function EventsContent({
  events,
  season,
  selectedSeasonId,
  activeEventCount,
  plan,
  atLimit,
  viewMode,
  allEventsBucket,
  setAllEventsBucket,
  collapsed,
  setCollapsed,
}: {
  events: Event[]
  season: SeasonOption | null
  selectedSeasonId: string
  activeEventCount: number
  plan: { id: string; name: string; activeEventLimit: number }
  atLimit: boolean
  viewMode: ViewMode
  allEventsBucket: "upcoming" | "past" | "drafts"
  setAllEventsBucket: (bucket: "upcoming" | "past" | "drafts") => void
  collapsed: Record<string, boolean>
  setCollapsed: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}) {
  const isAllSeasons = selectedSeasonId === ALL_SEASONS_ID;
  // Transform events into card rows with parsed dates
  const rows = useMemo(() => {
    return events.map((event): EventRow => {
      const eventDate = parseEventDate(event.date);
      // If event is draft, show DRAFT status, otherwise compute registration status
      const statusLabel = event.status === 'draft' 
        ? 'DRAFT' as const
        : getRegistrationStatus(event);
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
        status: event.status,
      };
    });
  }, [events]);

  // Filter rows by selected season
  const filteredRows = useMemo(
    () => {
      if (isAllSeasons || !season) {
        return rows;
      }
      return rows.filter((row) =>
        isEventInSeason(row.eventDate, season.start, season.end)
      );
    },
    [rows, season, isAllSeasons]
  );

  // Build month sections for month view
  const sections = useMemo(
    () => {
      if (isAllSeasons || !season) {
        // For "All Seasons", build sections from all available event dates
        return buildMonthSectionsFromRows(filteredRows);
      }
      return buildMonthSections(filteredRows, season);
    },
    [filteredRows, season, isAllSeasons]
  );

  // Split into upcoming/past/drafts for all view
  const bucketedRows = useMemo(() => {
    const now = new Date();
    const upcoming: EventRow[] = [];
    const past: EventRow[] = [];
    const drafts: EventRow[] = [];

    filteredRows.forEach((row) => {
      // Draft events go to drafts bucket
      if (row.status === 'draft') {
        drafts.push(row);
        return;
      }

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

    return { upcoming, past, drafts };
  }, [filteredRows]);

  const listRows = useMemo(
    () => {
      if (allEventsBucket === "past") return bucketedRows.past;
      if (allEventsBucket === "drafts") return bucketedRows.drafts;
      return bucketedRows.upcoming;
    },
    [allEventsBucket, bucketedRows]
  );

  // Initialize collapse state for month sections
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0539df34-fe7d-4aed-8499-019797bffb2a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'run1',hypothesisId:'H1',location:'organizer/events/page.tsx:EventsContent useEffect',message:'reset collapsed for sections',data:{sectionCount:sections.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    // Only reset collapsed map when the set of section keys changes to avoid re-render loops
    const nextState: Record<string, boolean> = {};
    sections.forEach((section) => {
      nextState[section.key] = false;
    });

    const keysChanged =
      Object.keys(nextState).length !== Object.keys(collapsed).length ||
      sections.some((section) => !(section.key in collapsed));

    if (!keysChanged) return;
    setCollapsed(nextState);
  }, [sections, collapsed, setCollapsed]);

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

      {/* Upcoming/Past tabs for all view */}
      {viewMode === "all" ? (
        <motion.div
          className="w-full"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <TagTabs
            tabs={[
              { id: "upcoming", label: "Upcoming" },
              { id: "past", label: "Past" },
              { id: "drafts", label: `Drafts${bucketedRows.drafts.length > 0 ? ` (${bucketedRows.drafts.length})` : ''}` },
            ]}
            value={allEventsBucket}
            onValueChange={(value) => setAllEventsBucket(value as "upcoming" | "past" | "drafts")}
          />
        </motion.div>
      ) : null}

      {/* Month view */}
      {viewMode === "month" ? (
        <motion.div
          key={`month-view-${selectedSeasonId}`}
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
                      <div className="rounded-md border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
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
          key={`list-view-${selectedSeasonId}-${allEventsBucket}`}
          className="w-full"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-4">
            {listRows.length ? (
              <motion.div
                className="grid grid-cols-1 justify-items-start gap-4 pb-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
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
              <div className="rounded-md border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                {allEventsBucket === "past"
                  ? "No past events in this season."
                  : allEventsBucket === "drafts"
                    ? "No draft events. Click 'New Event' to start creating one."
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

function buildMonthSectionsFromRows(rows: EventRow[]): MonthSection[] {
  // Build sections from all unique months in the rows
  const monthMap = new Map<string, EventRow[]>();
  
  rows.forEach((row) => {
    const d = row.eventDate;
    if (Number.isNaN(d.getTime())) return; // Skip invalid dates
    
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const existing = monthMap.get(key) ?? [];
    existing.push(row);
    monthMap.set(key, existing);
  });

  // Convert to sections and sort by date
  const months: MonthSection[] = Array.from(monthMap.entries())
    .map(([key, items]) => {
      const [year = 0, month = 0] = key.split('-').map((value) => Number.isFinite(Number(value)) ? Number(value) : 0);
      const date = new Date(year, month, 1);
      const label = date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
      return { key, label, items };
    })
    .sort((a, b) => {
      const [yearA = 0, monthA = 0] = a.key.split('-').map((value) => Number.isFinite(Number(value)) ? Number(value) : 0);
      const [yearB = 0, monthB = 0] = b.key.split('-').map((value) => Number.isFinite(Number(value)) ? Number(value) : 0);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

  return months;
}
