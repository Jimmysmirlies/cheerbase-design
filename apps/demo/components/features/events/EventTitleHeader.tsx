"use client";

import type { ReactNode } from "react";
import { brandGradients, type BrandGradient } from "@/lib/gradients";

type EventTitleHeaderProps = {
  /** Event name displayed as the title */
  name: string;
  /** Event date (ISO string or Date) */
  date?: string | Date;
  /** Event location */
  location?: string;
  /** Gradient for the title text */
  gradient: BrandGradient;
  /** Optional badge next to title (e.g., "Published", "Draft") */
  badge?: ReactNode;
  /** Action buttons on right side (e.g., "Update Event") */
  actions?: ReactNode;
};

/**
 * Event title header with gradient text and date/location subtitle.
 * Used in the event editor to display the event name above content sections.
 */
export function EventTitleHeader({
  name,
  date,
  location,
  gradient,
  badge,
  actions,
}: EventTitleHeaderProps) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const subtitle = [formattedDate, location].filter(Boolean).join(" · ");

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1
            className="heading-2 bg-clip-text text-transparent"
            style={{
              backgroundImage: brandGradients[gradient].css,
            }}
          >
            {name}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="body-small text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
