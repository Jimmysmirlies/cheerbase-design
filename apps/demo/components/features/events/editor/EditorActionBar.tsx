"use client";

import Link from "next/link";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import { Button } from "@workspace/ui/shadcn/button";
import { Badge } from "@workspace/ui/shadcn/badge";
import { cn } from "@workspace/ui/lib/utils";

type EditorActionBarProps = {
  /** Event ID for the back button link */
  eventId?: string;
  /** Whether the event is a draft (not yet published) */
  isDraft: boolean;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Whether publishing is in progress */
  isPublishing: boolean;
  /** Callback when publish button is clicked */
  onPublish: () => void;
  /** Optional callback to discard changes (only shown when dirty) */
  onDiscard?: () => void;
};

export function EditorActionBar({
  eventId,
  isDraft,
  isDirty,
  isPublishing,
  onPublish,
  onDiscard,
}: EditorActionBarProps) {
  // Back link: go to event view if we have an ID, otherwise events list
  const backHref = eventId
    ? `/organizer/events/${encodeURIComponent(eventId)}`
    : "/organizer/events";

  return (
    <div className="w-full border-b border-border/60 bg-background">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        {/* Left side: Back button */}
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={backHref}>
            <ArrowLeftIcon className="mr-2 size-4" />
            Back to Event
          </Link>
        </Button>

        {/* Right side: Status badge + Actions */}
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <Badge
            variant="outline"
            className={cn(
              "font-medium",
              isDraft
                ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
            )}
          >
            {isDraft ? "Draft" : "Published"}
          </Badge>

          {/* Unsaved changes indicator */}
          {isDirty && (
            <span className="text-sm text-muted-foreground">Unsaved changes</span>
          )}

          {/* Discard button (only when dirty and handler provided) */}
          {isDirty && onDiscard && (
            <Button variant="ghost" size="sm" onClick={onDiscard}>
              Discard
            </Button>
          )}

          {/* Publish/Update button */}
          <Button
            size="sm"
            onClick={onPublish}
            disabled={isPublishing}
          >
            {isPublishing && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            {isDraft ? "Publish Event" : "Update Event"}
          </Button>
        </div>
      </div>
    </div>
  );
}
