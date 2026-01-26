"use client";

import { useMemo } from "react";
import { ClockIcon, PlusIcon } from "lucide-react";
import { Label } from "@workspace/ui/shadcn/label";
import { Input } from "@workspace/ui/shadcn/input";
import { Button } from "@workspace/ui/shadcn/button";
import { DatePicker } from "@workspace/ui/shadcn/date-picker";
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
    fullDate: date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    }),
  };
}

/**
 * Convert various date formats to ISO YYYY-MM-DD format
 * Handles: "Mar 28, 2026", "March 28, 2026", "2026-03-28", etc.
 */
function toISODate(dateString?: string): string {
  if (!dateString) return "";
  // Already in ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse ISO date string to Date object (local timezone)
 */
function parseISODate(dateString?: string): Date | undefined {
  if (!dateString) return undefined;
  // Parse YYYY-MM-DD as local date to avoid timezone shifts
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const parts = dateString.split("-").map(Number);
    const year = parts[0] ?? 0;
    const month = parts[1] ?? 1;
    const day = parts[2] ?? 1;
    const parsed = new Date(year, month - 1, day);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }
  // Handle other formats
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

/**
 * Format Date to ISO string for storage
 */
function formatDateToISO(date: Date | undefined): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * DateTimeSection displays the event date and time.
 * Supports both view and edit modes, including multi-day schedules.
 */
export function DateTimeSection({
  mode,
  eventData,
  onUpdate,
  organizerGradient: _organizerGradient = "primary",
  eventDateParts: propDateParts,
  scheduleDays: propScheduleDays,
}: DateTimeSectionProps) {
  // Unused but kept for API compatibility
  void _organizerGradient;

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
        month: date
          .toLocaleDateString("en-US", { month: "short" })
          .toUpperCase(),
        day: date.getDate().toString(),
        weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
        fullDate: date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
        }),
      };
    });
  }, [propScheduleDays, eventData.schedule]);

  // Initialize schedule data for edit mode (must be before any early returns)
  const scheduleData = useMemo(() => {
    if (eventData.schedule && eventData.schedule.length > 0) {
      return eventData.schedule;
    }

    // Convert single-day event to schedule format
    if (eventData.date) {
      // Parse time strings like "8:00 AM" to 24h format "08:00"
      const parseTimeTo24h = (timeStr?: string): string => {
        if (!timeStr) return "08:00";
        const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (!match) return "08:00";
        let hours = parseInt(match[1] || "8", 10);
        const minutes = match[2] || "00";
        const period = match[3]?.toUpperCase();
        if (period === "PM" && hours < 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        return `${hours.toString().padStart(2, "0")}:${minutes}`;
      };

      return [
        {
          date: toISODate(eventData.date), // Convert "Mar 28, 2026" to "2026-03-28"
          label: "",
          startTime: parseTimeTo24h(eventData.startTime),
          endTime: parseTimeTo24h(eventData.endTime),
        },
      ];
    }

    // Fallback to empty day
    return [{ date: "", label: "", startTime: "08:00", endTime: "18:00" }];
  }, [
    eventData.schedule,
    eventData.date,
    eventData.startTime,
    eventData.endTime,
  ]);

  // VIEW MODE
  if (mode === "view") {
    // Multi-day schedule view
    if (scheduleDays.length > 1) {
      return (
        <div className="flex flex-col gap-4">
          {scheduleDays.map((scheduleDay, index) => (
            <div key={index} className="flex items-center gap-4">
              {/* Calendar badge */}
              <div className="flex min-w-[72px] flex-col items-center overflow-hidden rounded-lg border bg-muted/30">
                <div className="w-full bg-muted px-4 py-1 text-center">
                  <span className="label text-muted-foreground">
                    {scheduleDay.month}
                  </span>
                </div>
                <div className="px-4 py-2">
                  <span className="heading-2 font-bold text-foreground">
                    {scheduleDay.day}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="heading-4 text-foreground">
                  {scheduleDay.weekday}, {scheduleDay.fullDate}
                </span>
                {scheduleDay.original.label && (
                  <span className="body-small text-muted-foreground">
                    {scheduleDay.original.label}
                  </span>
                )}
                <span className="body-small text-muted-foreground flex items-center gap-1.5">
                  <ClockIcon className="size-4" />
                  {scheduleDay.original.startTime} -{" "}
                  {scheduleDay.original.endTime}
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
        {/* Calendar badge */}
        <div className="flex min-w-[72px] flex-col items-center overflow-hidden rounded-lg border bg-muted/30">
          <div className="w-full bg-muted px-4 py-1 text-center">
            <span className="label text-muted-foreground">
              {eventDateParts.month}
            </span>
          </div>
          <div className="px-4 py-2">
            <span className="heading-2 font-bold text-foreground">
              {eventDateParts.day}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="heading-4 text-foreground">
            {eventDateParts.weekday}, {eventDateParts.fullDate}
          </span>
          <span className="body-small text-muted-foreground flex items-center gap-1.5">
            <ClockIcon className="size-4" />
            {eventData.startTime || "8:00 AM"} -{" "}
            {eventData.endTime || "6:00 PM"} {eventData.timezone || "EST"}
          </span>
        </div>
      </div>
    );
  }

  // EDIT MODE - Multi-day schedule
  const handleAddDay = () => {
    const newDay: EventScheduleDay = {
      date: "",
      label: "",
      startTime: "08:00",
      endTime: "18:00",
    };
    onUpdate?.({ schedule: [...scheduleData, newDay] });
  };

  const handleRemoveDay = (index: number) => {
    const updated = scheduleData.filter((_, i) => i !== index);
    onUpdate?.({ schedule: updated });
  };

  const handleUpdateDay = (
    index: number,
    updates: Partial<EventScheduleDay>,
  ) => {
    const updated = scheduleData.map((day, i) =>
      i === index ? { ...day, ...updates } : day,
    );
    onUpdate?.({ schedule: updated });
  };

  return (
    <div className="flex flex-col gap-6 pt-2">
      {scheduleData.map((day, index) => (
        <div key={index} className="rounded-lg border border-border/60 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="body-text text-muted-foreground">
              Day {index + 1}
            </span>
            {scheduleData.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveDay(index)}
                className="text-muted-foreground hover:text-foreground h-auto p-0"
              >
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker
                date={parseISODate(day.date)}
                onDateChange={(date) =>
                  handleUpdateDay(index, { date: formatDateToISO(date) })
                }
                placeholder="Select date"
              />
            </div>
            <div className="space-y-2">
              <Label>Label (optional)</Label>
              <Input
                value={day.label}
                onChange={(e) =>
                  handleUpdateDay(index, { label: e.target.value })
                }
                placeholder="e.g., Preliminary Rounds"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <div className="relative">
                <Input
                  type="time"
                  value={day.startTime}
                  onChange={(e) =>
                    handleUpdateDay(index, { startTime: e.target.value })
                  }
                  className="w-full pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  style={{ colorScheme: "light" }}
                />
                <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <div className="relative">
                <Input
                  type="time"
                  value={day.endTime}
                  onChange={(e) =>
                    handleUpdateDay(index, { endTime: e.target.value })
                  }
                  className="w-full pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  style={{ colorScheme: "light" }}
                />
                <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="ghost"
        onClick={handleAddDay}
        className="self-start text-primary hover:text-primary/80"
      >
        <PlusIcon className="size-4" />
        Add Day
      </Button>
    </div>
  );
}

/** Check if section has data to display */
DateTimeSection.hasData = (eventData: Partial<Event>): boolean => {
  return (
    !!eventData.date ||
    (eventData.schedule && eventData.schedule.length > 0) ||
    false
  );
};

/** Empty state configuration */
DateTimeSection.emptyTitle = "Add event date and time";
DateTimeSection.emptyDescription = "Set when your event will take place";
