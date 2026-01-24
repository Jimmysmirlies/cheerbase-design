"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react";
import { Button } from "@workspace/ui/shadcn/button";
import { brandGradients, type BrandGradient } from "@/lib/gradients";

type FieldChange = {
  field: string;
  displayName: string;
  oldValue: string;
  newValue: string;
};

type ChangeHistoryBarProps = {
  changes: FieldChange[];
  onDiscard: () => void;
  gradient?: BrandGradient;
};

const COLLAPSED_LIMIT = 3;

export function ChangeHistoryBar({
  changes,
  onDiscard,
  gradient,
}: ChangeHistoryBarProps) {
  const [expanded, setExpanded] = useState(false);

  if (changes.length === 0) return null;

  const gradientConfig = gradient ? brandGradients[gradient] : undefined;
  const gradientCss = gradientConfig?.css;
  const firstColor = gradientCss?.match(/#[0-9A-Fa-f]{6}/)?.[0];
  const hasGradient = !!gradientCss && !!firstColor;

  const visibleChanges = expanded ? changes : changes.slice(0, COLLAPSED_LIMIT);
  const hiddenCount = changes.length - COLLAPSED_LIMIT;
  const showExpand = changes.length > COLLAPSED_LIMIT;

  return (
    <div
      className="relative mb-6 rounded-md border p-4 transition-all overflow-hidden"
      style={
        hasGradient && firstColor
          ? { borderColor: `${firstColor}50` }
          : undefined
      }
    >
      {/* Gradient background overlay */}
      {hasGradient && gradientCss && (
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: gradientCss,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <div
              className="size-2 shrink-0 rounded-full"
              style={
                hasGradient && firstColor
                  ? { backgroundColor: firstColor }
                  : { backgroundColor: "currentColor" }
              }
            />
            <p className="body-text font-semibold text-foreground">
              {changes.length} Unpublished{" "}
              {changes.length === 1 ? "Change" : "Changes"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDiscard}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-3.5 mr-1" />
            Discard All
          </Button>
        </div>

        {/* Changes list */}
        <ul className="space-y-1.5 pl-4">
          {visibleChanges.map((change) => (
            <li
              key={change.field}
              className="body-small text-muted-foreground flex items-baseline gap-1.5"
            >
              <span className="text-muted-foreground/60">•</span>
              <span>
                <span className="font-medium text-foreground">
                  {change.displayName}
                </span>
                :{" "}
                <span className="text-muted-foreground/80">
                  {change.oldValue}
                </span>
                <span className="mx-1.5 text-muted-foreground/50">→</span>
                <span className="text-foreground">{change.newValue}</span>
              </span>
            </li>
          ))}
        </ul>

        {/* Expand/collapse toggle */}
        {showExpand && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 ml-4 flex items-center gap-1 body-small text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUpIcon className="size-3.5" />
                Show less
              </>
            ) : (
              <>
                <ChevronDownIcon className="size-3.5" />
                Show {hiddenCount} more{" "}
                {hiddenCount === 1 ? "change" : "changes"}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
