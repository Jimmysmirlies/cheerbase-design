"use client";

import type { ReactNode } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { PageTabs, type PageTab } from "@/components/ui/controls/PageTabs";

type ActionBarProps = {
  /** Tabs to display on the left side */
  tabs?: PageTab[];
  /** Currently active tab ID */
  activeTab?: string;
  /** Callback when tab changes */
  onTabChange?: (tab: string) => void;
  /** Tab visual style: 'underline' (default) or 'outline' (button style) */
  tabVariant?: "underline" | "outline";
  /** Accent color for the active tab underline (CSS color or gradient) */
  tabAccentColor?: string;
  /** Custom left content (filters, selects, etc.) - shown instead of tabs if no tabs provided */
  leftContent?: ReactNode;
  /** Action buttons or controls to display on the right side */
  actions?: ReactNode;
  /** Status badge or indicator to display */
  status?: ReactNode;
  /** Additional class names */
  className?: string;
  /** Max width variant */
  maxWidth?: "default" | "full";
  /**
   * Visual variant:
   * - 'full-width': Full-width bar with bottom border (Layout A style)
   * - 'contained': Contained bar with rounded border and muted background
   * - 'unstyled': Same positioning as contained but without border/background (Layout B style)
   */
  variant?: "full-width" | "contained" | "unstyled";
};

export function ActionBar({
  tabs,
  activeTab,
  onTabChange,
  tabVariant = "underline",
  tabAccentColor,
  leftContent,
  actions,
  status,
  className,
  maxWidth = "default",
  variant = "contained",
}: ActionBarProps) {
  const hasTabs = tabs && tabs.length > 0;
  const hasLeftContent = hasTabs || leftContent;
  const hasRightContent = actions || status;

  // Don't render if there's no content
  if (!hasLeftContent && !hasRightContent) {
    return null;
  }

  // Full-width variant (Layout A): spans full width with bottom border
  if (variant === "full-width") {
    return (
      <div
        className={cn(
          "w-full border-b border-border/60 bg-background",
          className,
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-full items-center justify-between gap-4 px-4 lg:px-8",
            maxWidth === "default" && "max-w-7xl",
          )}
        >
          {/* Left side: Tabs or custom content */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {hasTabs && onTabChange && activeTab ? (
              <PageTabs
                tabs={tabs}
                value={activeTab}
                onValueChange={onTabChange}
                variant={tabVariant}
                accentColor={tabAccentColor}
              />
            ) : (
              leftContent
            )}
          </div>

          {/* Right side: Status + Actions */}
          {hasRightContent && (
            <div className="flex shrink-0 items-center gap-3">
              {status}
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Unstyled variant (Layout B): Same positioning, no visual container
  if (variant === "unstyled") {
    return (
      <div
        className={cn(
          "mx-auto w-full px-4 lg:px-8",
          maxWidth === "default" && "max-w-7xl",
          className,
        )}
      >
        <div className="flex w-full items-center justify-between gap-4">
          {/* Left side: Tabs or custom content */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {hasTabs && onTabChange && activeTab ? (
              <PageTabs
                tabs={tabs}
                value={activeTab}
                onValueChange={onTabChange}
                variant={tabVariant}
                accentColor={tabAccentColor}
              />
            ) : (
              leftContent
            )}
          </div>

          {/* Right side: Status + Actions */}
          {hasRightContent && (
            <div className="flex shrink-0 items-center gap-3">
              {status}
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Contained variant: rounded border with muted background
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 lg:px-8",
        maxWidth === "default" && "max-w-7xl",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/40 px-4">
        {/* Left side: Tabs or custom content */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {hasTabs && onTabChange && activeTab ? (
            <PageTabs
              tabs={tabs}
              value={activeTab}
              onValueChange={onTabChange}
              variant={tabVariant}
              accentColor={tabAccentColor}
            />
          ) : (
            leftContent
          )}
        </div>

        {/* Right side: Status + Actions */}
        {hasRightContent && (
          <div className="flex shrink-0 items-center gap-3">
            {status}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export type { PageTab as ActionBarTab };
