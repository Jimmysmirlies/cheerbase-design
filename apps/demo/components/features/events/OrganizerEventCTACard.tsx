"use client";

import { useMemo, useState, useEffect } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Card, CardContent } from "@workspace/ui/shadcn/card";
import { Button } from "@workspace/ui/shadcn/button";

// Countdown helpers
const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;

type CountdownDisplay =
  | {
      state: "future";
      segments: { days: number; hours: number; minutes: number };
    }
  | { state: "past" };

function getCountdown(targetDate?: string | Date): CountdownDisplay | null {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return { state: "past" };

  const days = Math.floor(diffMs / DAY_IN_MS);
  const remainingAfterDays = diffMs % DAY_IN_MS;
  const hours = Math.floor(remainingAfterDays / HOUR_IN_MS);
  const remainingAfterHours = remainingAfterDays % HOUR_IN_MS;
  const minutes = Math.floor(remainingAfterHours / MINUTE_IN_MS);

  return { state: "future", segments: { days, hours, minutes } };
}

type OrganizerEventCTACardProps = {
  /** Event date - kept for future use */
  eventDate: string;
  /** Event start time - kept for future use */
  eventStartTime?: string;
  registrationDeadline: string;
  onEdit: () => void;
  className?: string;
};

export function OrganizerEventCTACard({
  eventDate,
  eventStartTime: _eventStartTime,
  registrationDeadline,
  onEdit,
  className,
}: OrganizerEventCTACardProps) {
  // Countdown state (client-only to avoid hydration mismatch)
  const [countdownDisplay, setCountdownDisplay] =
    useState<CountdownDisplay | null>(null);

  useEffect(() => {
    if (!eventDate) return;

    setCountdownDisplay(getCountdown(eventDate));
    // Update every minute since we don't show seconds
    const interval = window.setInterval(() => {
      setCountdownDisplay(getCountdown(eventDate));
    }, 60000);

    return () => window.clearInterval(interval);
  }, [eventDate]);

  // Unused but kept for potential future use
  void _eventStartTime;

  const formattedDeadline = useMemo(() => {
    const deadlineDate = new Date(registrationDeadline);
    if (Number.isNaN(deadlineDate.getTime())) return "TBA";
    return deadlineDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [registrationDeadline]);

  const countdownSegments =
    countdownDisplay?.state === "future"
      ? [
          { label: "Days", value: countdownDisplay.segments.days },
          { label: "Hrs", value: countdownDisplay.segments.hours },
          { label: "Mins", value: countdownDisplay.segments.minutes },
        ]
      : null;

  return (
    <Card className={cn(className)}>
      <CardContent className="space-y-4 px-6 py-0">
        {/* Countdown display */}
        {countdownDisplay && (
          <div className="flex flex-col items-center gap-2">
            <span className="label text-muted-foreground">Event Starts In</span>
            {countdownDisplay.state === "past" ? (
              <div className="heading-4 text-foreground">Event Has Passed</div>
            ) : countdownSegments ? (
              <div className="grid grid-cols-3 gap-4">
                {countdownSegments.map((segment) => (
                  <div
                    key={segment.label}
                    className="flex flex-col items-center"
                  >
                    <span className="heading-2 tabular-nums font-bold text-foreground">
                      {String(segment.value).padStart(2, "0")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {segment.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Edit Event button */}
        <Button className="w-full" onClick={onEdit}>
          Edit Event
        </Button>

        {/* Registration deadline */}
        <p className="text-center text-sm text-muted-foreground">
          Registration closes on{" "}
          <span className="font-semibold text-foreground">
            {formattedDeadline}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
