"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TagTabs } from "@/components/ui/controls/TagTabs";
import { Button } from "@workspace/ui/shadcn/button";
import { TextSelect } from "@workspace/ui/components/text-select";
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
  EventRegisteredCard,
  type EventRegisteredCardProps,
} from "@/components/ui/cards/EventRegisteredCard";
import { CardSkeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { type BrandGradient } from "@/lib/gradients";
import { fadeInUp, staggerContainer } from "@/lib/animations";
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
  const isHistoricalSeason = selectedSeason.type === "past";

  return (
    <section className="flex flex-1 flex-col">
      <PageHeader
        title="Registrations"
        gradient={clubGradient}
        breadcrumbs={[
          { label: "Clubs", href: "/clubs" },
          { label: "Registrations", href: "/clubs/registrations" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <motion.div
          className="w-full"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <RegistrationsContent
            userId={user.id}
            season={selectedSeason}
            readOnly={isHistoricalSeason}
            selectedSeasonId={selectedSeasonId}
            onSelectSeason={setSelectedSeasonId}
          />
        </motion.div>
      </div>
    </section>
  );
}

type RegistrationRow = EventRegisteredCardProps & {
  id: string;
  eventDate: Date;
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
const defaultSeason = (seasonOptions.find(
  (season) => season.type === "current",
) ?? seasonOptions[0])!;
const defaultSeasonId = defaultSeason.id;
function resolveSeasonById(seasonId: string): SeasonOption {
  return (
    seasonOptions.find((season) => season.id === seasonId) ?? defaultSeason
  );
}

function RegistrationsContent({
  userId,
  season,
  readOnly,
  selectedSeasonId,
  onSelectSeason,
}: {
  userId?: string;
  season: SeasonOption;
  readOnly: boolean;
  selectedSeasonId: string;
  onSelectSeason: (seasonId: string) => void;
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
    () => rows.filter((row) => isWithinSeason(row.eventDate, season)),
    [rows, season],
  );
  const sections = useMemo(
    () => buildMonthSections(filteredRows, season),
    [filteredRows, season],
  );
  const [viewMode, setViewMode] = useState<ViewMode>("all");
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
  const seasonSelectSections = useMemo(() => {
    const current = seasonOptions
      .filter((option) => option.type === "current")
      .map((option) => ({ value: option.id, label: option.label }));
    const past = seasonOptions
      .filter((option) => option.type === "past")
      .map((option) => ({ value: option.id, label: option.label }));
    const sections: {
      label: string;
      options: { value: string; label: string }[];
      showDivider?: boolean;
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

  return (
    <section className="space-y-6">
      {/* STATUS HANDOFF — "Loading Bay": surface fetch status before showing the grid */}
      {loading ? (
        <motion.div
          className="w-full"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} rows={3} showMedia />
            ))}
          </div>
        </motion.div>
      ) : error ? (
        <motion.div
          className="w-full"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="text-destructive rounded-2xl border border-dashed p-6 text-center text-sm">
            Failed to load registrations.
          </div>
        </motion.div>
      ) : null}

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
            <TooltipProvider delayDuration={120}>
              <div className="relative inline-flex items-center rounded-md border border-border/70 bg-muted/40 p-1 shrink-0 ml-auto">
                <div
                  className={`absolute top-1 left-1 h-9 w-9 rounded-md bg-card shadow transition-transform duration-200 ease-out ${
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
                      className="size-9 rounded-md relative z-10"
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
                      className="size-9 rounded-md relative z-10"
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
        </div>
      </motion.div>
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
            ]}
            value={allEventsBucket}
            onValueChange={(value) =>
              setAllEventsBucket(value as "upcoming" | "past")
            }
          />
        </motion.div>
      ) : null}
      {readOnly ? (
        <motion.div
          className="w-full"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="rounded-md border border-dashed border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            You are viewing historical registrations for {season.label}. Records
            are read-only and cannot be modified.
          </div>
        </motion.div>
      ) : null}

      {viewMode === "month" ? (
        <motion.div
          key={`month-view-${season.id}`}
          className="w-full"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* MONTHLY STACK — "Calendar Rack": month buckets with collapsible grids */}
          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {sections.map((section) => (
              <motion.div
                key={section.key}
                className="w-full"
                variants={fadeInUp}
              >
                <div className="space-y-3 border-b border-border pb-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="heading-3 text-foreground">
                      {section.label}
                    </div>
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
                        className="grid grid-cols-1 gap-4 pb-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
                            <div
                              className={`h-full w-full ${readOnly ? "pointer-events-none opacity-75" : ""}`}
                            >
                              <EventRegisteredCard {...row} />
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <div className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
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
                key={`all-events-${allEventsBucket}`}
                className="grid grid-cols-1 gap-4 pb-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
                    <div
                      className={`h-full w-full ${readOnly ? "pointer-events-none opacity-75" : ""}`}
                    >
                      <EventRegisteredCard {...row} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
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
    let statusLabel: "PAID" | "UNPAID" | "OVERDUE" = "UNPAID";
    if (isPaid) statusLabel = "PAID";
    else if (paymentDeadline && paymentDeadline < now) statusLabel = "OVERDUE";
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
      organizer: event?.organizer ?? reg.organizer,
      statusLabel,
      actionHref: `/clubs/registrations/${reg.id}`,
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
