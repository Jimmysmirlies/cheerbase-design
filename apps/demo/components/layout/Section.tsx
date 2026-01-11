"use client";

import type { ReactNode } from "react";
import { cn } from "@workspace/ui/lib/utils";

type SectionProps = {
  /** Section title */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Section content */
  children: ReactNode;
  /** Optional ID for anchor linking */
  id?: string;
  /** Whether to show the top border divider (default: true) */
  showDivider?: boolean;
  /** Optional right-aligned content next to the title */
  titleRight?: ReactNode;
  /** Optional icon before the title */
  titleIcon?: ReactNode;
  /** Additional class names for the container */
  className?: string;
};

/**
 * Section component for consistent page sections with optional divider, title, and description.
 *
 * Pattern inspired by Airbnb's listing pages:
 * - Border at top
 * - 48px (py-12) vertical padding above and below content
 * - 24px (gap-6) between title and content
 *
 * Used across organizer pages (settings, invoices) and event detail pages.
 */
export function Section({
  title,
  description,
  children,
  id,
  showDivider = true,
  titleRight,
  titleIcon,
  className,
}: SectionProps) {
  return (
    <div id={id} className={className}>
      {showDivider && <div className="h-px w-full bg-border" />}

      <div className="flex flex-col gap-6 py-12">
        {titleRight ? (
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p
                className={cn(
                  "heading-4",
                  titleIcon && "flex items-center gap-2",
                )}
              >
                {titleIcon}
                {title}
              </p>
              {description && (
                <p className="body-text text-muted-foreground">{description}</p>
              )}
            </div>
            {titleRight}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <p
              className={cn(
                "heading-4",
                titleIcon && "flex items-center gap-2",
              )}
            >
              {titleIcon}
              {title}
            </p>
            {description && (
              <p className="body-text text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
