"use client";

import { PlusIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode, CSSProperties } from "react";

type EmptyStateButtonProps = {
  /** Primary text displayed in the button */
  title: string;
  /** Secondary descriptive text */
  description?: string;
  /** Click handler - if not provided, renders as static (non-interactive) */
  onClick?: () => void;
  /** Custom icon to display (defaults to PlusIcon) */
  icon?: ReactNode;
  /** Additional className for the outer container */
  className?: string;
  /** Disabled state (only applies when onClick is provided) */
  disabled?: boolean;
};

// Spaced dashed border styles using strokeDasharray
const spacedDashStyle: CSSProperties = {
  strokeDasharray: "6 6",
};

/**
 * A dashed-border element used to indicate empty states.
 * When onClick is provided, renders as an interactive button with hover states.
 * When onClick is not provided, renders as a static display element.
 * Common use cases: adding items to lists, creating new entries, uploading files.
 */
export function EmptyStateButton({
  title,
  description,
  onClick,
  icon,
  className,
  disabled = false,
}: EmptyStateButtonProps) {
  const isInteractive = !!onClick;

  const content = (
    <>
      {/* SVG border with spaced dashes */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <rect
          x="0.5"
          y="0.5"
          width="calc(100% - 1px)"
          height="calc(100% - 1px)"
          rx="5.5"
          ry="5.5"
          fill="none"
          className={cn(
            "stroke-border transition-colors",
            isInteractive && !disabled && "group-hover:stroke-primary/50",
          )}
          strokeWidth="1"
          style={spacedDashStyle}
        />
      </svg>
      <div className="relative flex items-center gap-3">
        <div
          className={cn(
            "size-8 shrink-0 rounded-full flex items-center justify-center relative",
          )}
        >
          {/* SVG circular border with spaced dashes */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            <circle
              cx="50%"
              cy="50%"
              r="15"
              fill="none"
              className={cn(
                "stroke-border transition-colors",
                isInteractive && !disabled && "group-hover:stroke-primary/50",
              )}
              strokeWidth="1"
              style={spacedDashStyle}
            />
          </svg>
          {icon || (
            <PlusIcon
              className={cn(
                "size-4 text-muted-foreground",
                isInteractive && !disabled && "group-hover:text-primary",
              )}
            />
          )}
        </div>
        <div className="flex flex-col">
          <p
            className={cn(
              "body-text font-semibold text-muted-foreground",
              isInteractive && !disabled && "group-hover:text-foreground",
            )}
          >
            {title}
          </p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </>
  );

  // Render as static div when no onClick handler
  if (!isInteractive) {
    return (
      <div
        className={cn(
          "relative rounded-md p-8 text-left w-full",
          className,
        )}
      >
        {content}
      </div>
    );
  }

  // Render as interactive button when onClick is provided
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative rounded-md p-8 transition-all text-left w-full group",
        !disabled && "hover:bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {content}
    </button>
  );
}
