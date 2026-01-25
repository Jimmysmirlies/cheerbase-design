"use client";

import { Loader2Icon } from "lucide-react";
import { Button } from "@workspace/ui/shadcn/button";
import { cn } from "@workspace/ui/lib/utils";

type EditorActionBarProps = {
  /** Whether the event is published */
  isPublished: boolean;
  /** Last saved/updated timestamp */
  lastSaved?: Date | string | null;
  /** Whether draft save is in progress */
  isSavingDraft: boolean;
  /** Whether publishing is in progress */
  isPublishing: boolean;
  /** Callback when save draft button is clicked */
  onSaveDraft: () => void;
  /** Callback when publish button is clicked */
  onPublish: () => void;
};

function formatTimestamp(date: Date | string | null | undefined): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(dateObj.getTime())) return "";

  return dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }) + " at " + dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase();
}

export function EditorActionBar({
  isPublished,
  lastSaved,
  isSavingDraft,
  isPublishing,
  onSaveDraft,
  onPublish,
}: EditorActionBarProps) {
  const timestamp = formatTimestamp(lastSaved);
  const statusLabel = isPublished ? "Published" : "Draft";

  return (
    <div className="flex w-full items-center justify-between gap-4 border-b border-border/60 pb-4">
      {/* Left side: Status with timestamp */}
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "body-small font-medium",
            isPublished ? "text-green-600" : "text-muted-foreground"
          )}
        >
          {statusLabel}
        </span>
        {timestamp && (
          <>
            <span className="text-muted-foreground">•</span>
            <span className="body-small text-muted-foreground">
              {timestamp}
            </span>
          </>
        )}
      </div>

      {/* Right side: Save Draft + Publish buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSavingDraft}
        >
          {isSavingDraft ? "Saving..." : "Save Draft"}
        </Button>
        <Button onClick={onPublish} disabled={isPublishing}>
          {isPublishing && (
            <Loader2Icon className="mr-2 size-4 animate-spin" />
          )}
          {isPublished ? "Update Event" : "Publish Event"}
        </Button>
      </div>
    </div>
  );
}
