"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTabs } from "@/components/ui/PageTabs";
import { Button } from "@workspace/ui/shadcn/button";
import { GlassSelect } from "@workspace/ui/components/glass-select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/shadcn/tooltip";
import {
  CalendarRangeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ListIcon,
} from "lucide-react";

import { motion } from "framer-motion";
import {
  EventCardV2,
  type EventCardV2Props,
  type RegistrationStatus,
} from "@/components/ui/cards/EventCardV2";
import { CardSkeleton, EmptyState } from "@/components/ui";
import { PageTitle } from "@/components/layout/PageTitle";
import { type BrandGradient, getGradientStartColor } from "@/lib/gradients";
import { staggerContainer } from "@/lib/animations";
import { useAuth } from "@/components/providers/AuthProvider";
import { useClubData } from "@/hooks/useClubData";
import { findEventById } from "@/data/events";
import { formatFriendlyDate } from "@/utils/format";
import type { ClubData } from "@/lib/club-data";
import type { TeamRoster } from "@/types/club";

export default function ClubRegistrationsPage() {
  const { user, status } = useAuth();
  const router = useRouter();
  const [selectedSeasonId, setSelectedSeasonId] =
    useState<string>(defaultSeasonId);
  const [clubGradient, setClubGradient] = useState<BrandGradient | undefined>(
    undefined,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("all");

  // Load club gradient settings
  useEffect(() => {
    const loadGradient = () => {
      if (user?.id) {
        try {
          const stored = localStorage.getItem(
            `cheerbase-club-settings-${user.id}`,
          );
          if (stored) {
            const settings = JSON.parse(stored);
            if (settings.gradient) {
              setClubGradient(settings.gradient);
              return;
            }
          }
        } catch {
          // Ignore storage errors
        }
      }
      setClubGradient(undefined);
    };

    loadGradient();

    const handleSettingsChange = (event: CustomEvent<{ gradient: string }>) => {
      if (event.detail?.gradient) {
        setClubGradient(event.detail.gradient as BrandGradient);
      }
    };

    window.addEventListener(
      "club-settings-changed",
      handleSettingsChange as EventListener,
    );
    return () => {
      window.removeEventListener(
        "club-settings-changed",
        handleSettingsChange as EventListener,
      );
    };
  }, [user?.id]);

  // ACCESS CONTROL — "Gatekeeper": keep non-club-owners out of the registrations experience
  useEffect(() => {
    if (status === "loading") return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (user.role !== "club_owner") {
      router.replace(user.role === "organizer" ? "/organizer" : "/");
    }
  }, [user, status, router]);

  if (status === "loading") {
    return <main className="min-h-screen bg-background" />;
  }
  if (!user || user.role !== "club_owner") return null;

  const selectedSeason = resolveSeasonById(selectedSeasonId);
  const isAllSeasons = selectedSeasonId === ALL_SEASONS_ID;
  const isHistoricalSeason = selectedSeason?.type === "past";

  return (
    <section className="mx-auto w-full max-w-6xl">
      {/* Header */}
      <PageTitle
        title="Registrations"
        gradient={clubGradient}
        actions={
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
        }
      />

      {/* Season Filter */}
      <div className="pt-6">
        <GlassSelect
          value={selectedSeasonId}
          onValueChange={setSelectedSeasonId}
          options={seasonSelectOptions}
          triggerClassName="w-[220px]"
        />
      </div>

      {/* Content Area */}
      <RegistrationsContent
        userId={user.id}
        season={selectedSeason}
        isAllSeasons={isAllSeasons}
        readOnly={isHistoricalSeason}
        clubGradient={clubGradient}
        viewMode={viewMode}
      />
    </section>
  );
}

type RegistrationRow = Omit<EventCardV2Props, "statusLabel"> & {
  eventDate: Date;
  statusLabel: RegistrationStatus;
  participants: number;
};
type MonthSection = {
  key: string;
  label: string;
  items: RegistrationRow[];
};
type SeasonOption = {
  id: string;
  label: string;
  start: Date;
  end: Date;
  type: "current" | "past";
};
type ViewMode = "month" | "all";

const seasonOptions: SeasonOption[] = [
  {
    id: "2025-2026",
    label: "Nov 2025 - May 2026",
    start: new Date(2025, 10, 1),
    end: new Date(2026, 4, 1),
    type: "current",
  },
  {
    id: "2024-2025",
    label: "Nov 2024 - May 2025",
    start: new Date(2024, 10, 1),
    end: new Date(2025, 4, 1),
    type: "past",
  },
  {
    id: "2023-2024",
    label: "Nov 2023 - May 2024",
    start: new Date(2023, 10, 1),
    end: new Date(2024, 4, 1),
    type: "past",
  },
];
const ALL_SEASONS_ID = "all";
const defaultSeason = (seasonOptions.find(
  (season) => season.type === "current",
) ?? seasonOptions[0])!;
const defaultSeasonId = defaultSeason.id;
function resolveSeasonById(seasonId: string): SeasonOption | null {
  if (seasonId === ALL_SEASONS_ID) return null;
  return (
    seasonOptions.find((season) => season.id === seasonId) ?? defaultSeason
  );
}

const seasonSelectOptions = (() => {
  // All seasons sorted by start date (newest first)
  const allSeasonsSorted = [...seasonOptions]
    .sort((a, b) => b.start.getTime() - a.start.getTime())
    .map((option) => ({ value: option.id, label: option.label }));

  return [
    { value: "all", label: "All Seasons" },
    { type: "separator" as const },
    ...allSeasonsSorted,
  ];
})();

function RegistrationsContent({
  userId,
  season,
  isAllSeasons,
  readOnly,
  clubGradient,
  viewMode,
}: {
  userId?: string;
  season: SeasonOption | null;
  isAllSeasons: boolean;
  readOnly: boolean;
  clubGradient?: BrandGradient;
  viewMode: ViewMode;
}) {
  // DATA PIPELINE — "Command Center": pull club data, then memoize categorized + sectioned outputs
  const { data, loading, error } = useClubData(userId);
  const categorized = useMemo(
    () => categorizeRegistrations(data ?? undefined),
    [data],
  );
  const rows = useMemo(() => {
    const all = [...categorized.upcoming, ...categorized.past];
    return all.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  }, [categorized]);
  const filteredRows = useMemo(
    () =>
      isAllSeasons || !season
        ? rows
        : rows.filter((row) => isWithinSeason(row.eventDate, season)),
    [rows, season, isAllSeasons],
  );
  const sections = useMemo(
    () => (season ? buildMonthSections(filteredRows, season) : []),
    [filteredRows, season],
  );
  const [allEventsBucket, setAllEventsBucket] = useState<"upcoming" | "past">(
    "upcoming",
  );
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const bucketedSeasonRows = useMemo(() => {
    const now = new Date();
    const upcoming: RegistrationRow[] = [];
    const past: RegistrationRow[] = [];

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
  const listRows = useMemo(
    () =>
      allEventsBucket === "past"
        ? bucketedSeasonRows.past
        : bucketedSeasonRows.upcoming,
    [allEventsBucket, bucketedSeasonRows],
  );

  // COLLAPSE MEMORY — "Accordion Brain": initialize per-month expansion state
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

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-4 pt-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} rows={3} showMedia />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="pt-8">
        <div className="text-destructive rounded-2xl border border-dashed p-6 text-center text-sm">
          Failed to load registrations.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-8">
      {/* PageTabs for "all" view mode */}
      {viewMode === "all" && (
        <PageTabs
          tabs={[
            { id: "upcoming", label: "Upcoming" },
            { id: "past", label: "Past" },
          ]}
          value={allEventsBucket}
          onValueChange={(value) =>
            setAllEventsBucket(value as "upcoming" | "past")
          }
          accentColor={
            clubGradient ? getGradientStartColor(clubGradient) : undefined
          }
        />
      )}

      {/* Read-only notice for historical seasons */}
      {readOnly && season && (
        <div className="rounded-md border border-dashed border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          You are viewing historical registrations for {season.label}. Records
          are read-only and cannot be modified.
        </div>
      )}

      {/* Month view - only available when a specific season is selected */}
      {viewMode === "month" && !isAllSeasons && season ? (
        <motion.div
          key={`month-view-${season.id}`}
          className="space-y-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {sections.map((section) => (
            <div
              key={section.key}
              className="space-y-3 border-b border-border pb-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="heading-3 text-foreground">{section.label}</div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="text-foreground font-semibold">
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
                      collapsed[section.key] ? "Expand month" : "Collapse month"
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
                    className="grid grid-cols-2 justify-items-start gap-x-4 gap-y-8 pb-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {section.items.map((row) => (
                      <div
                        key={row.id}
                        className={`h-full w-full ${readOnly ? "pointer-events-none opacity-75" : ""}`}
                      >
                        <EventCardV2 {...row} />
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState>No events this month.</EmptyState>
                )
              ) : null}
            </div>
          ))}
        </motion.div>
      ) : (
        /* List view */
        <div>
          {listRows.length ? (
            <motion.div
              key={`all-events-${allEventsBucket}`}
              className="grid grid-cols-2 justify-items-start gap-x-4 gap-y-8 pb-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {listRows.map((row) => (
                <div
                  key={row.id}
                  className={`h-full w-full ${readOnly ? "pointer-events-none opacity-75" : ""}`}
                >
                  <EventCardV2 {...row} />
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
              {allEventsBucket === "past"
                ? `No past events${isAllSeasons ? "" : " in this season"}.`
                : `No upcoming events${isAllSeasons ? "" : " in this season"}.`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function categorizeRegistrations(data?: ClubData) {
  if (!data)
    return { upcoming: [] as RegistrationRow[], past: [] as RegistrationRow[] };

  const { registrations, registeredTeams, rosters } = data;
  const registeredTeamMap = new Map(registeredTeams.map((rt) => [rt.id, rt]));
  const rosterByTeam = new Map(rosters.map((r) => [r.teamId, r]));
  const now = new Date();

  // Group registrations by eventId to avoid duplicate cards
  const eventMap = new Map<
    string,
    {
      reg: (typeof registrations)[0];
      participants: number;
      isPaid: boolean;
      paymentDeadline?: Date;
    }
  >();

  registrations.forEach((reg) => {
    const inferredRegisteredTeamId =
      reg.registeredTeamId ?? (reg.teamId ? `rt-${reg.teamId}` : undefined);
    const registeredTeam =
      reg.registeredTeam ??
      (inferredRegisteredTeamId
        ? registeredTeamMap.get(inferredRegisteredTeamId)
        : undefined);
    const roster = registeredTeam?.sourceTeamId
      ? rosterByTeam.get(registeredTeam.sourceTeamId)
      : null;
    const participants =
      registeredTeam?.members?.length ??
      (roster
        ? countRosterParticipants(roster)
        : (reg.athletes ?? registeredTeam?.size ?? 0));
    const isPaid = reg.status === "paid" || Boolean(reg.paidAt);
    const paymentDeadline = reg.paymentDeadline
      ? new Date(reg.paymentDeadline)
      : undefined;

    const existing = eventMap.get(reg.eventId);
    if (existing) {
      // Aggregate participants and track if ANY team is unpaid
      existing.participants += participants;
      existing.isPaid = existing.isPaid && isPaid;
      // Use earliest payment deadline
      if (
        paymentDeadline &&
        (!existing.paymentDeadline ||
          paymentDeadline < existing.paymentDeadline)
      ) {
        existing.paymentDeadline = paymentDeadline;
      }
    } else {
      eventMap.set(reg.eventId, { reg, participants, isPaid, paymentDeadline });
    }
  });

  const upcoming: RegistrationRow[] = [];
  const past: RegistrationRow[] = [];

  eventMap.forEach(({ reg, participants, isPaid, paymentDeadline }) => {
    const event = findEventById(reg.eventId);
    // Map payment status to RegistrationStatus for visual consistency
    let statusLabel: RegistrationStatus = "OPEN";
    if (isPaid) statusLabel = "OPEN"; // Green - paid is good
    else if (paymentDeadline && paymentDeadline < now)
      statusLabel = "CLOSED"; // Red-ish - overdue
    else statusLabel = "CLOSING SOON"; // Amber - needs attention
    const eventDate = new Date(reg.eventDate);
    const bucket: "upcoming" | "past" = Number.isNaN(eventDate.getTime())
      ? "upcoming"
      : eventDate < now
        ? "past"
        : "upcoming";

    const card: RegistrationRow = {
      id: reg.id,
      image: event?.image,
      title: reg.eventName,
      date: formatFriendlyDate(reg.eventDate),
      // keep raw date for grouping
      eventDate,
      location: event?.location ?? reg.location,
      participants,
      teamsFilled: participants,
      teamsCapacity: participants, // Show as "X / X" since these are registered
      statusLabel,
      href: `/clubs/registrations/${reg.id}`,
    };

    if (bucket === "past") {
      past.push(card);
    } else {
      upcoming.push(card);
    }
  });

  return { upcoming, past };
}

function buildMonthSections(
  rows: (RegistrationRow & { eventDate: Date })[],
  season: SeasonOption,
) {
  // TIME WINDOW — "Season Envelope": limit calendar to the active cheer season months
  const start = new Date(
    season.start.getFullYear(),
    season.start.getMonth(),
    1,
  );
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

function isWithinSeason(date: Date, season: SeasonOption) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return false;
  return date >= season.start && date <= season.end;
}

function countRosterParticipants(roster: TeamRoster) {
  return (
    (roster.coaches?.length ?? 0) +
    (roster.athletes?.length ?? 0) +
    (roster.reservists?.length ?? 0) +
    (roster.chaperones?.length ?? 0)
  );
}
