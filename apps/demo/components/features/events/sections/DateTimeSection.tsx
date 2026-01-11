"use client";

import { useMemo } from "react";
import { ClockIcon } from "lucide-react";
import { Label } from "@workspace/ui/shadcn/label";
import { Input } from "@workspace/ui/shadcn/input";
import {
  DateRangePicker,
  type DateRange,
} from "@workspace/ui/shadcn/date-range-picker";
import { brandGradients } from "@/lib/gradients";
import type { Event, EventScheduleDay } from "@/types/events";
import type { BaseSectionProps } from "./types";

export type ScheduleDayParts = {
  /** Original schedule day data */
  original: EventScheduleDay;
  /** Uppercase short month (e.g., "JAN") */
  month: string;
  /** Day number (e.g., "17") */
  day: string;
  /** Full weekday name (e.g., "Saturday") */
  weekday: string;
  /** Month name + day (e.g., "January 17") */
  fullDate: string;
};

export type DateTimeSectionProps = BaseSectionProps & {
  /** Pre-computed date parts for display */
  eventDateParts?: {
    month: string;
    day: string;
    weekday: string;
    fullDate: string;
  };
  /** Pre-computed schedule days for multi-day events */
  scheduleDays?: ScheduleDayParts[];
};

function parseDate(dateString?: string): Date | undefined {
  if (!dateString) return undefined;
  const parsed = new Date(dateString);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function formatDateForStorage(date: Date | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function computeDateParts(dateString?: string) {
  if (!dateString) {
    return { month: "", day: "", weekday: "", fullDate: "" };
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return { month: "", day: "", weekday: "", fullDate: "" };
  }
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: date.getDate().toString(),
    weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
    fullDate: date.toLocaleDateString("en-US", { day: "numeric", month: "long" }),
  };
}

/**
 * DateTimeSection displays the event date and time.
 * Supports both view and edit modes, including multi-day schedules.
 */
export function DateTimeSection({
  mode,
  eventData,
  onUpdate,
  organizerGradient = "primary",
  eventDateParts: propDateParts,
  scheduleDays: propScheduleDays,
}: DateTimeSectionProps) {
  // Compute date parts if not provided
  const eventDateParts = propDateParts || computeDateParts(eventData.date);

  // Compute schedule days if not provided
  const scheduleDays = useMemo(() => {
    if (propScheduleDays) return propScheduleDays;
    if (!eventData.schedule || eventData.schedule.length === 0) return [];

    return eventData.schedule.map((scheduleDay) => {
      // Parse YYYY-MM-DD as local date to avoid timezone shifts
      const parts = scheduleDay.date.split("-").map(Number);
      const year = parts[0] ?? 2026;
      const month = parts[1] ?? 1;
      const day = parts[2] ?? 1;
      const date = new Date(year, month - 1, day);

      return {
        original: scheduleDay,
        month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        day: date.getDate().toString(),
        weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
        fullDate: date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
        }),
      };
    });
  }, [propScheduleDays, eventData.schedule]);

  // Parse date range for edit mode
  const dateRange = useMemo<DateRange | undefined>(() => {
    const from = parseDate(eventData.date);
    const to = parseDate(eventData.endDate);
    if (!from) return undefined;
    return { from, to };
  }, [eventData.date, eventData.endDate]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onUpdate?.({
      date: formatDateForStorage(range?.from),
      endDate: range?.to ? formatDateForStorage(range.to) : undefined,
    });
  };

  const gradient = brandGradients[organizerGradient];

  // VIEW MODE
  if (mode === "view") {
    // Multi-day schedule view
    if (scheduleDays.length > 1) {
      return (
        <div className="flex flex-col gap-4">
          {scheduleDays.map((scheduleDay, index) => (
            <div key={index} className="flex items-center gap-4">
              <div
                className="flex size-16 flex-col items-center justify-center rounded-xl text-white overflow-hidden"
                style={{ backgroundImage: gradient?.css }}
              >
                <span className="label leading-none pt-1">{scheduleDay.month}</span>
                <span className="heading-3 leading-none pb-0.5">
                  {scheduleDay.day}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="body-text font-semibold text-foreground">
                  {scheduleDay.weekday}, {scheduleDay.fullDate}
                </span>
                <span className="body-small text-muted-foreground">
                  {scheduleDay.original.label}
                </span>
                <span className="body-small text-muted-foreground flex items-center gap-1.5">
                  <ClockIcon className="size-4" />
                  {scheduleDay.original.startTime} - {scheduleDay.original.endTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Single day view - only render if we have valid date parts
    if (!eventDateParts.month || !eventDateParts.day) {
      return (
        <p className="body-text text-muted-foreground">
          No date set for this event.
        </p>
      );
    }

    return (
      <div className="flex items-center gap-4">
        <div className="flex size-16 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground overflow-hidden">
          <span className="text-[11px] font-medium uppercase tracking-wide leading-none pt-1">
            {eventDateParts.month}
          </span>
          <span className="text-2xl font-semibold leading-none pb-0.5">
            {eventDateParts.day}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            {eventDateParts.weekday}, {eventDateParts.fullDate}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <ClockIcon className="size-4" />
            {eventData.startTime || "8:00 AM"} - {eventData.endTime || "6:00 PM"}{" "}
            {eventData.timezone || "EST"}
          </span>
        </div>
      </div>
    );
  }

  // EDIT MODE
  return (
    <div className="flex flex-col gap-4 pt-2">
      {/* Event Date Range */}
      <div className="space-y-2">
        <Label>Event Date *</Label>
        <DateRangePicker
          date={dateRange}
          onDateChange={handleDateRangeChange}
          placeholder="Select event date(s)"
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Select a single day or a date range for multi-day events
        </p>
      </div>

      {/* Start Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-time">Start Time</Label>
          <Input
            id="start-time"
            type="time"
            value={eventData.startTime || ""}
            onChange={(e) => onUpdate?.({ startTime: e.target.value })}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-time">End Time</Label>
          <Input
            id="end-time"
            type="time"
            value={eventData.endTime || ""}
            onChange={(e) => onUpdate?.({ endTime: e.target.value })}
            className="w-full"
          />
        </div>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Input
          id="timezone"
          value={eventData.timezone || "EST"}
          onChange={(e) => onUpdate?.({ timezone: e.target.value })}
          placeholder="e.g., EST, PST, UTC"
          className="w-full"
        />
      </div>
    </div>
  );
}

/** Check if section has data to display */
DateTimeSection.hasData = (eventData: Partial<Event>): boolean => {
  return !!eventData.date;
};

/** Empty state configuration */
DateTimeSection.emptyTitle = "Add event date and time";
DateTimeSection.emptyDescription = "Set when your event will take place";
