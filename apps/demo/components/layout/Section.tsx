"use client";

import type { ReactNode } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { useEventSection } from "@/components/features/events/EventSectionContext";
import { getGradientStartColor } from "@/lib/gradients";

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
 * - 32px (py-8) vertical padding above and below content
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
  const { activeSection, gradient } = useEventSection();
  const isActive = id ? activeSection === id : false;
  const dotColor = getGradientStartColor(gradient);

  const TitleContent = (
    <>
      {titleIcon}
      {title}
    </>
  );

  // Active dot indicator - shown to the right of the title with pulse animation
  const ActiveDot = isActive ? (
    <span
      className="ml-3 size-2 shrink-0 animate-pulse rounded-full"
      style={{ backgroundColor: dotColor }}
    />
  ) : null;

  return (
    <div id={id} className={className}>
      {showDivider && <div className="h-px w-full bg-border" />}

      <div className="flex flex-col gap-6 py-8">
        {titleRight ? (
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p
                className={cn(
                  "heading-4 flex items-center",
                  titleIcon && "gap-2",
                )}
              >
                {TitleContent}
                {ActiveDot}
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
                "heading-4 flex items-center",
                titleIcon && "gap-2",
              )}
            >
              {TitleContent}
              {ActiveDot}
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
