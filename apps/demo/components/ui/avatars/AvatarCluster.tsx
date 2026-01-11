"use client";

import type { CSSProperties } from "react";

import { cn } from "@workspace/ui/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/shadcn/tooltip";

export type AvatarClusterItem = {
  label: string;
  role?: string;
  title?: string;
};

export type AvatarClusterProps = {
  items: AvatarClusterItem[];
  fallbackLabel?: string;
  maxVisible?: number;
  remainingCount?: number;
  getRolePalette?: (
    role?: string,
  ) => { background: string; foreground: string } | undefined;
  className?: string;
};

export function AvatarCluster({
  items,
  fallbackLabel = "?",
  maxVisible = 5,
  remainingCount,
  getRolePalette,
  className,
}: AvatarClusterProps) {
  const visibleItems = items.slice(0, maxVisible);
  const extraCount =
    typeof remainingCount === "number"
      ? Math.max(remainingCount, 0)
      : Math.max(items.length - visibleItems.length, 0);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="flex -space-x-1">
        {visibleItems.length ? (
          visibleItems.map((item, index) => {
            const palette = getRolePalette?.(item.role);

            return (
              <TooltipProvider key={`${item.label}-${index}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="inline-flex size-9 items-center justify-center rounded-full border border-background text-xs font-semibold uppercase shadow-sm ring-1 ring-background"
                      style={
                        {
                          backgroundColor:
                            palette?.background ?? "var(--background)",
                          color: palette?.foreground ?? "var(--foreground)",
                          zIndex: visibleItems.length - index,
                        } satisfies CSSProperties
                      }
                    >
                      {item.label}
                    </span>
                  </TooltipTrigger>
                  {item.title ? (
                    <TooltipContent side="top">
                      <span className="text-sm font-medium">{item.title}</span>
                    </TooltipContent>
                  ) : null}
                </Tooltip>
              </TooltipProvider>
            );
          })
        ) : (
          <span className="inline-flex size-9 items-center justify-center rounded-full border border-background bg-muted text-xs font-semibold uppercase text-muted-foreground shadow-sm ring-1 ring-background">
            {fallbackLabel}
          </span>
        )}
      </div>
      {extraCount > 0 ? (
        <span className="text-primary body-small font-semibold">
          +{extraCount}
        </span>
      ) : null}
    </div>
  );
}
