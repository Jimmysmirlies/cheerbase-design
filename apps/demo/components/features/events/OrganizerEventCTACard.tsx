"use client";

import { useMemo } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Card, CardContent } from "@workspace/ui/shadcn/card";
import { Button } from "@workspace/ui/shadcn/button";

type OrganizerEventCTACardProps = {
  eventDate: string;
  eventStartTime?: string;
  registrationDeadline: string;
  onEdit: () => void;
  className?: string;
};

export function OrganizerEventCTACard({
  eventDate,
  eventStartTime,
  registrationDeadline,
  onEdit,
  className,
}: OrganizerEventCTACardProps) {
  // Parse date parts (same logic as RegistrationSummaryCard)
  const eventDateParts = useMemo(() => {
    const dateObj = new Date(eventDate);
    if (Number.isNaN(dateObj.getTime())) return null;
    return {
      month: dateObj
        .toLocaleDateString("en-US", { month: "short" })
        .toUpperCase(),
      day: dateObj.getDate().toString(),
      weekday: dateObj.toLocaleDateString("en-US", { weekday: "long" }),
      fullDate: dateObj.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
      }),
    };
  }, [eventDate]);

  const formattedDeadline = useMemo(() => {
    const deadlineDate = new Date(registrationDeadline);
    if (Number.isNaN(deadlineDate.getTime())) return "TBA";
    return deadlineDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [registrationDeadline]);

  return (
    <Card className={cn(className)}>
      <CardContent className="space-y-4 px-6 py-0">
        {/* Event date display */}
        {eventDateParts && (
          <div className="flex items-center gap-4">
            {/* Calendar badge (month/day) */}
            <div className="flex min-w-[56px] flex-col items-center overflow-hidden rounded-lg border bg-muted/30">
              <div className="w-full bg-muted px-3 py-0.5 text-center">
                <span className="label text-muted-foreground">
                  {eventDateParts.month}
                </span>
              </div>
              <div className="px-3 py-1">
                <span className="heading-3 text-foreground">
                  {eventDateParts.day}
                </span>
              </div>
            </div>
            {/* Date text */}
            <div className="flex flex-col">
              <span className="heading-4 text-foreground">
                {eventDateParts.weekday}, {eventDateParts.fullDate}
              </span>
              {eventStartTime && (
                <span className="text-sm text-muted-foreground">
                  {eventStartTime}
                </span>
              )}
            </div>
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
