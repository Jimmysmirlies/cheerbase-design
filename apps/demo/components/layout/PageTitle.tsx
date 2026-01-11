"use client";

import type { ReactNode } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { brandGradients, type BrandGradient } from "@/lib/gradients";

type PageTitleProps = {
  /** The title text */
  title: string;
  /** Gradient variant for the text */
  gradient?: BrandGradient;
  /** Optional badge next to title (e.g., "Beta") */
  badge?: ReactNode;
  /** Optional subtitle/description below title */
  subtitle?: string;
  /** Additional className for the container */
  className?: string;
  /** @deprecated Use dateLabel instead. Uppercase label above title */
  topLabel?: string;
  /** Date displayed below title */
  dateLabel?: string;
  /** Location displayed below title (after date) */
  locationLabel?: string;
  /** Action buttons on right side (e.g., "New Event", "Edit Event") */
  actions?: ReactNode;
  /** Layout toggle component (event detail only) */
  layoutToggle?: ReactNode;
};

export function PageTitle({
  title,
  gradient = "primary",
  badge,
  subtitle,
  className,
  topLabel,
  dateLabel,
  locationLabel,
  actions,
  layoutToggle,
}: PageTitleProps) {
  const gradientConfig = brandGradients[gradient] ?? brandGradients.primary;

  // Build meta line items (date and location below title)
  const metaLineItems: string[] = [];
  if (dateLabel) {
    metaLineItems.push(dateLabel);
  }
  if (locationLabel) {
    metaLineItems.push(locationLabel);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Legacy topLabel support - deprecated */}
      {topLabel && !dateLabel && (
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {topLabel}
        </p>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1
              className="heading-2 bg-clip-text text-transparent"
              style={{ backgroundImage: gradientConfig.css }}
            >
              {title}
            </h1>
            {badge}
          </div>
          {metaLineItems.length > 0 && (
            <p className="body-small text-muted-foreground">
              {metaLineItems.join("  ·  ")}
            </p>
          )}
        </div>

        {(actions || layoutToggle) && (
          <div className="flex items-center gap-3">
            {actions}
            {layoutToggle}
          </div>
        )}
      </div>

      {subtitle && <p className="body-small text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
