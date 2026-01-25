"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@workspace/ui/shadcn/button";
import { PageTabs } from "@/components/ui/PageTabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/shadcn/tooltip";
import { PlusIcon, CalendarRangeIcon, ListIcon } from "lucide-react";

import { useOrganizer } from "@/hooks/useOrganizer";
import { useOrganizerSubscription } from "@/hooks/useOrganizerSubscription";
import { useOrganizerEventDrafts } from "@/hooks/useOrganizerEventDrafts";
import {
  getEventsByOrganizerId,
  getActiveEventCount,
} from "@/data/events/selectors";
import { PageTitle } from "@/components/layout/PageTitle";
import { SeasonDropdown } from "@/components/layout/SeasonDropdown";
import { useSeason } from "@/components/providers/SeasonProvider";
import { type BrandGradient, getGradientStartColor } from "@/lib/gradients";
import { CardSkeleton } from "@/components/ui";

import {
  EventsContent,
  NewEventModal,
  type ViewMode,
  type AllEventsBucket,
} from "./_components";

export default function OrganizerEventsPage() {
  const { organizer, organizerId, isLoading } = useOrganizer();
  const {
    plan,
    canAddActiveEvent,
    isLoading: subscriptionLoading,
  } = useOrganizerSubscription();
  const { selectedSeasonId, selectedSeason, isAllSeasons } = useSeason();
  const [organizerGradient, setOrganizerGradient] = useState<
    BrandGradient | undefined
  >(undefined);

  // Modal state
  const [showNewEventModal, setShowNewEventModal] = useState(false);

  // Load organizer gradient from settings or default
  useEffect(() => {
    const loadGradient = () => {
      if (organizerId) {
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
      }
      setOrganizerGradient(organizer?.gradient as BrandGradient | undefined);
    };

    loadGradient();

    const handleSettingsChange = (event: CustomEvent<{ gradient: string }>) => {
      if (event.detail?.gradient) {
        setOrganizerGradient(event.detail.gradient as BrandGradient);
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
  }, [organizerId, organizer?.gradient]);

  const organizerIdOrUndefined = organizerId ?? undefined;
  const { drafts, saveDraft } = useOrganizerEventDrafts(organizerIdOrUndefined);

  // Memoize base events
  const baseEvents = useMemo(
    () => (organizerId ? getEventsByOrganizerId(organizerId) : []),
    [organizerId],
  );

  // Merge drafts with base events
  const allEvents = useMemo(() => {
    const eventMap = new Map(baseEvents.map((e) => [e.id, e]));
    drafts.forEach((draft) => {
      eventMap.set(draft.id, draft);
    });
    return Array.from(eventMap.values());
  }, [baseEvents, drafts]);

  const activeEventCount = organizerId ? getActiveEventCount(organizerId) : 0;
  const canCreateEvent = canAddActiveEvent(activeEventCount);
  const atLimit = !canCreateEvent;

  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [allEventsBucket, setAllEventsBucket] =
    useState<AllEventsBucket>("upcoming");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  if (isLoading || subscriptionLoading) {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <PageTitle
          title="Events"
          gradient={organizerGradient}
          actions={
            <div className="flex items-center gap-3">
              <Button disabled>
                <PlusIcon className="size-4 mr-2" />
                New Event
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="relative inline-flex shrink-0 items-center rounded-md border border-border bg-background p-1 opacity-50">
                <div className="h-9 w-9 rounded-md bg-muted" />
                <div className="h-9 w-9 rounded-md" />
              </div>
            </div>
          }
        />
        <div className="pt-6">
          <SeasonDropdown />
        </div>
        <div className="flex flex-col gap-4 pt-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} rows={3} showMedia />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      {/* Header */}
      <PageTitle
        title="Events"
        gradient={organizerGradient}
        actions={
          <div className="flex items-center gap-3">
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

            <div className="h-6 w-px bg-border" />

            {/* View mode toggle */}
            <TooltipProvider delayDuration={120}>
              <div className="relative inline-flex shrink-0 items-center rounded-md border border-border bg-background p-1">
                <div
                  className={`absolute left-1 top-1 h-9 w-9 rounded-md bg-muted shadow-sm transition-transform duration-200 ease-out ${
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
                      onClick={() => setViewMode("all")}
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
                      onClick={() => setViewMode("month")}
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

      {/* Season Filter */}
      <div className="pt-6">
        <SeasonDropdown />
      </div>

      {/* Content Area */}
      <div className="flex flex-col gap-4 pt-8">
        {viewMode === "all" && (
          <PageTabs
            tabs={[
              { id: "upcoming", label: "Upcoming" },
              { id: "past", label: "Past" },
              { id: "drafts", label: "Drafts" },
            ]}
            value={allEventsBucket}
            onValueChange={(value) =>
              setAllEventsBucket(value as AllEventsBucket)
            }
            accentColor={
              organizerGradient
                ? getGradientStartColor(organizerGradient)
                : undefined
            }
          />
        )}
        <EventsContent
          events={allEvents}
          season={selectedSeason}
          selectedSeasonId={selectedSeasonId}
          isAllSeasons={isAllSeasons}
          plan={plan}
          atLimit={atLimit}
          viewMode={viewMode}
          allEventsBucket={allEventsBucket}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* New Event Modal */}
      <NewEventModal
        open={showNewEventModal}
        onOpenChange={setShowNewEventModal}
        organizerId={organizerId}
        organizerName={organizer?.name || ""}
        saveDraft={saveDraft}
      />
    </section>
  );
}
