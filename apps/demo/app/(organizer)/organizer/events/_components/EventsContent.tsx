"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";

import { Button } from "@workspace/ui/shadcn/button";
import { Alert, AlertDescription } from "@workspace/ui/shadcn/alert";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  AlertCircleIcon,
} from "lucide-react";
import { motion } from "framer-motion";

import { parseEventDate, isEventInSeason } from "@/data/events/selectors";
import {
  EventCardV2,
  getRegistrationStatus,
} from "@/components/ui/cards/EventCardV2";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { EmptyState } from "@/components/ui/EmptyState";
import type { EventsContentProps, EventRow } from "./types";
import { buildMonthSections, buildMonthSectionsFromRows } from "./utils";

const gridClasses =
  "grid grid-cols-2 justify-items-start gap-x-4 gap-y-8 pb-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

export function EventsContent({
  events,
  season,
  selectedSeasonId,
  isAllSeasons,
  plan,
  atLimit,
  viewMode,
  allEventsBucket,
  collapsed,
  setCollapsed,
}: EventsContentProps) {
  // Transform events into card rows with parsed dates
  const rows = useMemo(() => {
    return events.map((event): EventRow => {
      const eventDate = parseEventDate(event.date);
      const statusLabel =
        event.status === "draft"
          ? ("DRAFT" as const)
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
  const filteredRows = useMemo(() => {
    if (isAllSeasons || !season) {
      return rows;
    }
    return rows.filter(
      (row) =>
        row.status === "draft" ||
        isEventInSeason(row.eventDate, season.start, season.end),
    );
  }, [rows, season, isAllSeasons]);

  // Build month sections for month view
  const sections = useMemo(() => {
    if (isAllSeasons || !season) {
      return buildMonthSectionsFromRows(filteredRows);
    }
    return buildMonthSections(filteredRows, season);
  }, [filteredRows, season, isAllSeasons]);

  // Split into upcoming/past/drafts for all view
  const bucketedRows = useMemo(() => {
    const now = new Date();
    const upcoming: EventRow[] = [];
    const past: EventRow[] = [];
    const drafts: EventRow[] = [];

    filteredRows.forEach((row) => {
      if (row.status === "draft") {
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

  const listRows = useMemo(() => {
    if (allEventsBucket === "past") return bucketedRows.past;
    if (allEventsBucket === "drafts") return bucketedRows.drafts;
    return bucketedRows.upcoming;
  }, [allEventsBucket, bucketedRows]);

  // Initialize collapse state for month sections
  useEffect(() => {
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
                        className={gridClasses}
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
                            <EventCardV2 {...row} />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <EmptyState>No events this month.</EmptyState>
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
                className={gridClasses}
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
                    <EventCardV2 {...row} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState>
                {allEventsBucket === "past"
                  ? "No past events in this season."
                  : allEventsBucket === "drafts"
                    ? "No draft events. Click 'New Event' to start creating one."
                    : "No upcoming events in this season."}
              </EmptyState>
            )}
          </div>
        </motion.div>
      )}
    </section>
  );
}
