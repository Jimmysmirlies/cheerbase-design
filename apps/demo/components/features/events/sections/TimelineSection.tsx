"use client";

import { useCallback, useMemo } from "react";
import { DatePicker } from "@workspace/ui/shadcn/date-picker";
import { Label } from "@workspace/ui/shadcn/label";
import { Switch } from "@workspace/ui/shadcn/switch";
import { cn } from "@workspace/ui/lib/utils";
import type { Event } from "@/types/events";
import type { BaseSectionProps } from "./types";

export type TimelinePhase = {
  id: string;
  title: string;
  subtitle: string | null;
  border: string;
  background: string;
  dot: string;
  usesGradient: boolean;
  gradientBg?: string;
  borderColor?: string;
  dotColor?: string;
  isCurrent: boolean;
};

export type TimelineSectionProps = BaseSectionProps & {
  /** Pre-computed timeline phases for display */
  timelinePhases?: TimelinePhase[];
};

function parseDate(dateString: string | undefined): Date | undefined {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

// Timeline Preview component (inline for edit mode)
function TimelinePreview({
  registrationStartDate,
  registrationDeadline,
  earlyBirdDeadline,
  eventDate,
  earlyBirdEnabled,
}: {
  registrationStartDate?: Date;
  registrationDeadline?: Date;
  earlyBirdDeadline?: Date;
  eventDate?: Date;
  earlyBirdEnabled?: boolean;
}) {
  const today = useMemo(() => new Date(), []);

  const { markers, segments, hasValidData } = useMemo(() => {
    if (!registrationStartDate || !registrationDeadline) {
      return { markers: [], segments: [], hasValidData: false };
    }

    const allDates: { date: Date; id: string; label: string }[] = [
      { date: today, id: "today", label: "Today" },
      { date: registrationStartDate, id: "regStart", label: "Opens" },
      { date: registrationDeadline, id: "regEnd", label: "Closes" },
    ];

    if (earlyBirdEnabled && earlyBirdDeadline) {
      allDates.push({
        date: earlyBirdDeadline,
        id: "earlyBirdEnd",
        label: "Early Bird Ends",
      });
    }

    if (eventDate) {
      allDates.push({ date: eventDate, id: "event", label: "Event" });
    }

    allDates.sort((a, b) => a.date.getTime() - b.date.getTime());

    if (allDates.length < 2) {
      return { markers: [], segments: [], hasValidData: false };
    }

    const firstDate = allDates[0];
    const lastDate = allDates[allDates.length - 1];
    if (!firstDate || !lastDate) {
      return { markers: [], segments: [], hasValidData: false };
    }

    const minDate = firstDate.date.getTime();
    const maxDate = lastDate.date.getTime();
    const range = maxDate - minDate;

    if (range === 0) {
      return { markers: [], segments: [], hasValidData: false };
    }

    const markers = allDates.map(({ date, id, label }) => {
      const position = ((date.getTime() - minDate) / range) * 100;
      return { id, label, date, position, isToday: id === "today" };
    });

    const segments: {
      id: string;
      label: string;
      startPosition: number;
      endPosition: number;
      color: string;
    }[] = [];
    const regStartPos =
      ((registrationStartDate.getTime() - minDate) / range) * 100;
    const regEndPos =
      ((registrationDeadline.getTime() - minDate) / range) * 100;

    if (earlyBirdEnabled && earlyBirdDeadline) {
      const earlyBirdEndPos =
        ((earlyBirdDeadline.getTime() - minDate) / range) * 100;
      segments.push({
        id: "earlyBird",
        label: "Early Bird",
        startPosition: regStartPos,
        endPosition: earlyBirdEndPos,
        color: "earlyBird",
      });
      segments.push({
        id: "regular",
        label: "Regular",
        startPosition: earlyBirdEndPos,
        endPosition: regEndPos,
        color: "regular",
      });
    } else {
      segments.push({
        id: "registration",
        label: "Registration",
        startPosition: regStartPos,
        endPosition: regEndPos,
        color: "regular",
      });
    }

    return { markers, segments, hasValidData: true };
  }, [
    today,
    registrationStartDate,
    registrationDeadline,
    earlyBirdDeadline,
    eventDate,
    earlyBirdEnabled,
  ]);

  if (!hasValidData) return null;

  const formatShortDate = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Timeline Preview
      </p>
      <div className="relative">
        <div className="h-1 bg-border rounded-full" />
        {segments.map((segment) => (
          <div
            key={segment.id}
            className={cn(
              "absolute top-0 h-1 rounded-full",
              segment.color === "earlyBird" && "bg-amber-500",
              segment.color === "regular" && "bg-primary",
            )}
            style={{
              left: `${segment.startPosition}%`,
              width: `${segment.endPosition - segment.startPosition}%`,
            }}
          />
        ))}
        {markers.map((marker) => (
          <div
            key={marker.id}
            className="absolute -top-1"
            style={{
              left: `${marker.position}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div
              className={cn(
                "size-3 rounded-full border-2 border-background",
                marker.isToday && "bg-foreground ring-2 ring-foreground/20",
                marker.id === "regStart" && "bg-primary",
                marker.id === "earlyBirdEnd" && "bg-amber-500",
                marker.id === "regEnd" && "bg-primary",
                marker.id === "event" && "bg-muted-foreground",
              )}
            />
          </div>
        ))}
      </div>
      <div className="relative mt-3 h-10">
        {markers.map((marker) => (
          <div
            key={marker.id}
            className="absolute flex flex-col items-center"
            style={{
              left: `${marker.position}%`,
              transform: "translateX(-50%)",
            }}
          >
            <span
              className={cn(
                "label whitespace-nowrap",
                marker.isToday ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {marker.label}
            </span>
            <span className="label text-muted-foreground whitespace-nowrap">
              {formatShortDate(marker.date)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * TimelineSection displays the registration timeline with phases.
 * Supports both view and edit modes.
 */
export function TimelineSection({
  mode,
  eventData,
  onUpdate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  organizerGradient: _ = "primary",
  timelinePhases: propTimelinePhases,
}: TimelineSectionProps) {
  const registrationEnabled = eventData.registrationEnabled ?? false;
  const earlyBirdEnabled = eventData.earlyBirdEnabled ?? false;

  // Parse dates for edit mode
  const registrationStartDate = parseDate(eventData.registrationStartDate);
  const registrationDeadline = parseDate(eventData.registrationDeadline);
  const earlyBirdStartDate = parseDate(eventData.earlyBirdStartDate);
  const earlyBirdDeadline = parseDate(eventData.earlyBirdDeadline);
  const eventDate = eventData.date ? parseDate(eventData.date) : undefined;

  // Toggle registration enabled
  const handleToggleRegistration = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        onUpdate?.({ registrationEnabled: true });
      } else {
        onUpdate?.({
          registrationEnabled: false,
          registrationStartDate: undefined,
          registrationDeadline: undefined,
          earlyBirdEnabled: false,
          earlyBirdStartDate: undefined,
          earlyBirdDeadline: undefined,
        });
      }
    },
    [onUpdate],
  );

  // Handle registration start date change
  const handleRegistrationStartChange = useCallback(
    (date: Date | undefined) => {
      const updates: Partial<Event> = {};

      if (date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        updates.registrationStartDate = startDate.toISOString();

        if (
          earlyBirdEnabled &&
          earlyBirdStartDate &&
          earlyBirdStartDate < startDate
        ) {
          updates.earlyBirdStartDate = startDate.toISOString();
        }
      } else {
        updates.registrationStartDate = undefined;
      }

      onUpdate?.(updates);
    },
    [onUpdate, earlyBirdEnabled, earlyBirdStartDate],
  );

  // Handle registration end date change
  const handleRegistrationEndChange = useCallback(
    (date: Date | undefined) => {
      const updates: Partial<Event> = {};

      if (date) {
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        updates.registrationDeadline = endDate.toISOString();

        if (
          earlyBirdEnabled &&
          earlyBirdDeadline &&
          earlyBirdDeadline > endDate
        ) {
          updates.earlyBirdDeadline = endDate.toISOString();
        }
      } else {
        updates.registrationDeadline = undefined;
      }

      onUpdate?.(updates);
    },
    [onUpdate, earlyBirdEnabled, earlyBirdDeadline],
  );

  // VIEW MODE
  if (mode === "view") {
    const phases = propTimelinePhases || [];

    return (
      <div className="flex flex-col gap-3">
        {phases.map((phase) => (
          <div
            key={phase.id}
            className={`relative rounded-md border p-4 transition-all overflow-hidden ${phase.border} ${phase.background}`}
            style={
              phase.usesGradient && phase.borderColor
                ? { borderColor: `${phase.borderColor}50` }
                : undefined
            }
          >
            {phase.isCurrent && phase.gradientBg && (
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: phase.gradientBg,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            <div className="relative z-10 flex items-center gap-3">
              <div
                className={`size-2.5 shrink-0 rounded-full ${phase.dot}`}
                style={
                  phase.usesGradient && phase.dotColor
                    ? { backgroundColor: phase.dotColor }
                    : undefined
                }
              />
              <div className="flex items-center gap-2 flex-1">
                <p
                  className={`body-text font-semibold ${
                    phase.isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {phase.title}
                </p>
                {phase.subtitle && (
                  <>
                    <span className="body-text text-muted-foreground">•</span>
                    <p className="body-text text-muted-foreground">
                      {phase.subtitle}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // EDIT MODE
  return (
    <div className="flex flex-col gap-6 pt-2">
      {/* Registration Toggle */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="registration-toggle" className="text-sm font-medium">
            Enable Registration
          </Label>
          <p className="text-sm text-muted-foreground">
            Allow teams to register for this event
          </p>
        </div>
        <Switch
          id="registration-toggle"
          checked={registrationEnabled}
          onCheckedChange={handleToggleRegistration}
        />
      </div>

      {/* Registration Settings - only shown when enabled */}
      {registrationEnabled && (
        <>
          {/* Registration Period */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Registration Period
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm">Start Date</Label>
                <DatePicker
                  date={registrationStartDate}
                  onDateChange={handleRegistrationStartChange}
                  placeholder="Select start date"
                  toDate={registrationDeadline}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm">End Date</Label>
                <DatePicker
                  date={registrationDeadline}
                  onDateChange={handleRegistrationEndChange}
                  placeholder="Select end date"
                  fromDate={registrationStartDate}
                />
              </div>
            </div>
          </div>

          {/* Timeline Preview */}
          {registrationStartDate && registrationDeadline && (
            <TimelinePreview
              registrationStartDate={registrationStartDate}
              registrationDeadline={registrationDeadline}
              earlyBirdDeadline={earlyBirdDeadline}
              eventDate={eventDate}
              earlyBirdEnabled={earlyBirdEnabled}
            />
          )}
        </>
      )}
    </div>
  );
}

/** Check if section has data to display */
TimelineSection.hasData = (eventData: Partial<Event>): boolean => {
  return !!(eventData.registrationEnabled || eventData.registrationDeadline);
};

/** Empty state configuration */
TimelineSection.emptyTitle = "Set registration timeline";
TimelineSection.emptyDescription =
  "Configure when teams can register for your event";
