"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react";
import { Button } from "@workspace/ui/shadcn/button";

export type RegistrationChange = {
  id: string;
  type: "added" | "removed" | "modified";
  description: string;
};

type RegistrationChangeHistoryBarProps = {
  changes: RegistrationChange[];
  onDiscard: () => void;
};

const COLLAPSED_LIMIT = 3;

export function RegistrationChangeHistoryBar({
  changes,
  onDiscard,
}: RegistrationChangeHistoryBarProps) {
  const [expanded, setExpanded] = useState(false);

  if (changes.length === 0) return null;

  const visibleChanges = expanded ? changes : changes.slice(0, COLLAPSED_LIMIT);
  const hiddenCount = changes.length - COLLAPSED_LIMIT;
  const showExpand = changes.length > COLLAPSED_LIMIT;

  // Group changes by type for summary
  const addedCount = changes.filter((c) => c.type === "added").length;
  const removedCount = changes.filter((c) => c.type === "removed").length;
  const modifiedCount = changes.filter((c) => c.type === "modified").length;

  return (
    <div className="relative mb-6 rounded-md border border-primary/30 bg-primary/5 p-4 transition-all overflow-hidden">
      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="size-2 shrink-0 rounded-full bg-primary" />
            <p className="body-text font-semibold text-foreground">
              {changes.length} Unsaved{" "}
              {changes.length === 1 ? "Change" : "Changes"}
            </p>
            <span className="body-small text-muted-foreground">
              {[
                addedCount > 0 && `${addedCount} added`,
                removedCount > 0 && `${removedCount} removed`,
                modifiedCount > 0 && `${modifiedCount} modified`,
              ]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDiscard}
            className="h-7 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <XIcon className="size-3.5 mr-1" />
            Discard All
          </Button>
        </div>

        {/* Changes list */}
        <ul className="space-y-1.5 pl-4">
          {visibleChanges.map((change) => (
            <li
              key={change.id}
              className="body-small text-muted-foreground flex items-baseline gap-1.5"
            >
              <span
                className={
                  change.type === "added"
                    ? "text-green-600 dark:text-green-400"
                    : change.type === "removed"
                      ? "text-red-600 dark:text-red-400"
                      : "text-amber-600 dark:text-amber-400"
                }
              >
                {change.type === "added"
                  ? "+"
                  : change.type === "removed"
                    ? "−"
                    : "~"}
              </span>
              <span className="text-foreground">{change.description}</span>
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
