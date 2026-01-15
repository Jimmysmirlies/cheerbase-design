"use client";

import { useMemo } from "react";
import { ClockIcon, PlusIcon } from "lucide-react";
import { Label } from "@workspace/ui/shadcn/label";
import { Input } from "@workspace/ui/shadcn/input";
import { Button } from "@workspace/ui/shadcn/button";
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

  const gradient = brandGradients[organizerGradient];
  const gradientCss = gradient.css;
  const firstGradientColor =
    gradientCss.match(/#[0-9A-Fa-f]{6}/)?.[0] ?? "#0D9488";

  // VIEW MODE
  if (mode === "view") {
    // Multi-day schedule view
    if (scheduleDays.length > 1) {
      return (
        <div className="flex flex-col gap-4">
          {scheduleDays.map((scheduleDay, index) => (
            <div key={index} className="flex items-center gap-4">
              <div
                className="relative flex size-16 flex-col items-center justify-center rounded-lg overflow-hidden border"
                style={{ borderColor: `${firstGradientColor}50` }}
              >
                {/* Gradient background overlay */}
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage: gradientCss,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <span className="relative z-10 text-[11px] font-medium uppercase tracking-wide leading-none pt-1 text-foreground">
                  {scheduleDay.month}
                </span>
                <span className="relative z-10 text-2xl font-semibold leading-none pb-0.5 text-foreground">
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
        <div
          className="relative flex size-16 flex-col items-center justify-center rounded-lg overflow-hidden border"
          style={{ borderColor: `${firstGradientColor}50` }}
        >
          {/* Gradient background overlay */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: gradientCss,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <span className="relative z-10 text-[11px] font-medium uppercase tracking-wide leading-none pt-1 text-foreground">
            {eventDateParts.month}
          </span>
          <span className="relative z-10 text-2xl font-semibold leading-none pb-0.5 text-foreground">
            {eventDateParts.day}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            {eventDateParts.weekday}, {eventDateParts.fullDate}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <ClockIcon className="size-4" />
            {eventData.startTime || "8:00 AM"} -{" "}
            {eventData.endTime || "6:00 PM"} {eventData.timezone || "EST"}
          </span>
        </div>
      </div>
    );
  }

  // EDIT MODE - Multi-day schedule
  // Initialize with one empty day if no schedule exists
  const scheduleData =
    eventData.schedule && eventData.schedule.length > 0
      ? eventData.schedule
      : [{ date: "", label: "", startTime: "08:00", endTime: "18:00" }];

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
              <Input
                type="date"
                value={day.date}
                onChange={(e) =>
                  handleUpdateDay(index, { date: e.target.value })
                }
                className="w-full"
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
        className="w-fit text-primary hover:text-primary/80 p-0 h-auto"
      >
        <PlusIcon className="size-4 mr-1" />
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
