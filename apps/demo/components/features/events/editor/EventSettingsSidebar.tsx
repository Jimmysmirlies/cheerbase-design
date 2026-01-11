"use client";

import { useCallback, useState } from "react";
import {
  XIcon,
  Settings2Icon,
  EyeOffIcon,
  XCircleIcon,
  Trash2Icon,
} from "lucide-react";
import { Label } from "@workspace/ui/shadcn/label";
import { Input } from "@workspace/ui/shadcn/input";
import { Separator } from "@workspace/ui/shadcn/separator";
import { DatePicker } from "@workspace/ui/shadcn/date-picker";
import { Button } from "@workspace/ui/shadcn/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/shadcn/alert-dialog";
import { cn } from "@workspace/ui/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/shadcn/tooltip";
import { useEventEditor } from "@/components/providers/EventEditorProvider";

type EventSettingsSidebarProps = {
  variant?: "desktop" | "mobile";
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

function parseDate(dateString?: string): Date | undefined {
  if (!dateString) return undefined;
  try {
    // Parse YYYY-MM-DD as local date (not UTC) to avoid timezone shifts
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const parts = dateString.split("-").map(Number);
      const year = parts[0] ?? 0;
      const month = parts[1] ?? 1;
      const day = parts[2] ?? 1;
      const parsed = new Date(year, month - 1, day);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    // Handle full ISO strings
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  } catch {
    return undefined;
  }
}

function formatDateToISO(date: Date | undefined): string | undefined {
  if (!date) return undefined;
  // Use local date components to avoid timezone shifts
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function EventSettingsSidebar({
  variant = "desktop",
  collapsed = false,
  onToggleCollapse,
}: EventSettingsSidebarProps) {
  const {
    eventData,
    updateEventData,
    isPublished,
    isCancelled,
    hasRegistrations,
    unpublishEvent,
    cancelEvent,
    deleteEvent,
    canUnpublish,
    canCancel,
    canDelete,
  } = useEventEditor();
  const isDesktop = variant === "desktop";

  // Dialog states
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleRegistrationStartChange = useCallback(
    (date: Date | undefined) => {
      updateEventData({ registrationStartDate: formatDateToISO(date) });
    },
    [updateEventData]
  );

  const handleRegistrationEndChange = useCallback(
    (date: Date | undefined) => {
      updateEventData({ registrationDeadline: formatDateToISO(date) });
    },
    [updateEventData]
  );

  const handleCapacityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const capacity = parseInt(e.target.value) || 0;
      updateEventData({
        slots: {
          filled: eventData.slots?.filled || 0,
          capacity,
        },
      });
    },
    [eventData.slots?.filled, updateEventData]
  );

  // Shared danger zone content
  const dangerZoneContent = (
    <div className="space-y-4">
      {/* Unpublish - only if published and no registrations */}
      {isPublished && !isCancelled && (
        <div className="space-y-2">
          <Button
            variant="soft-destructive"
            className="w-full justify-start"
            onClick={() => setShowUnpublishDialog(true)}
            disabled={!canUnpublish}
          >
            <EyeOffIcon className="mr-2 size-4" />
            Unpublish Event
          </Button>
          {!canUnpublish && hasRegistrations && (
            <p className="text-xs text-muted-foreground">
              Cannot unpublish events with registrations
            </p>
          )}
        </div>
      )}

      {/* Cancel Event - only if published */}
      {isPublished && !isCancelled && (
        <div className="space-y-2">
          <Button
            variant="soft-destructive"
            className="w-full justify-start"
            onClick={() => setShowCancelDialog(true)}
            disabled={!canCancel}
          >
            <XCircleIcon className="mr-2 size-4" />
            Cancel Event
          </Button>
          <p className="text-xs text-muted-foreground">
            {hasRegistrations
              ? "Attendees will be notified of cancellation"
              : "Mark event as cancelled"}
          </p>
        </div>
      )}

      {/* Delete - only for drafts or cancelled events without registrations */}
      <div className="space-y-2">
        <Button
          variant="soft-destructive"
          className="w-full justify-start"
          onClick={() => setShowDeleteDialog(true)}
          disabled={!canDelete}
        >
          <Trash2Icon className="mr-2 size-4" />
          Delete Event
        </Button>
        {!canDelete && (
          <p className="text-xs text-muted-foreground">
            {isPublished && !isCancelled
              ? "Cancel or unpublish before deleting"
              : hasRegistrations
                ? "Cannot delete events with registrations"
                : ""}
          </p>
        )}
      </div>
    </div>
  );

  // Shared dialogs
  const dialogs = (
    <>
      {/* Unpublish Confirmation Dialog */}
      <AlertDialog
        open={showUnpublishDialog}
        onOpenChange={setShowUnpublishDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your event from public view and return it to
              draft status. You can republish it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={unpublishEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Unpublish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Event Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Event?</AlertDialogTitle>
            <AlertDialogDescription>
              {hasRegistrations
                ? "This will mark your event as cancelled. All registered attendees will be notified and refunds may need to be processed."
                : "This will mark your event as cancelled. The event will remain visible with a cancelled status."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Event</AlertDialogCancel>
            <AlertDialogAction
              onClick={cancelEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The event and all associated data
              will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  // Desktop sidebar - animated collapse
  if (isDesktop) {
    return (
      <>
        <aside
          className={cn(
            "fixed right-0 top-[68px] z-20 flex h-[calc(100vh-68px)] flex-col border-l border-sidebar-border bg-sidebar transition-[width] duration-200 ease-linear",
            collapsed ? "w-14" : "w-80"
          )}
        >
          {/* Toggle button */}
          <div className="flex shrink-0 justify-end p-2 pt-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={onToggleCollapse}
                >
                  {collapsed ? (
                    <Settings2Icon className="size-4" />
                  ) : (
                    <XIcon className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {collapsed ? "Show settings" : "Hide settings"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Settings content - hidden when collapsed */}
          <div
            className={cn(
              "flex flex-1 flex-col space-y-6 overflow-y-auto p-6 pt-2 transition-opacity duration-200",
              collapsed ? "pointer-events-none opacity-0" : "opacity-100"
            )}
          >
            {/* Registration Section */}
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Registration
              </p>

              <div className="space-y-2">
                <Label className="text-sm">Opens</Label>
                <DatePicker
                  date={parseDate(eventData.registrationStartDate)}
                  onDateChange={handleRegistrationStartChange}
                  placeholder="Select date"
                  toDate={parseDate(eventData.registrationDeadline)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Closes</Label>
                <DatePicker
                  date={parseDate(eventData.registrationDeadline)}
                  onDateChange={handleRegistrationEndChange}
                  placeholder="Select date"
                  fromDate={parseDate(eventData.registrationStartDate)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Team Capacity</Label>
                <Input
                  type="number"
                  min={0}
                  value={eventData.slots?.capacity || ""}
                  onChange={handleCapacityChange}
                  placeholder="Unlimited"
                />
              </div>
            </div>

            {/* Spacer to push danger zone to bottom */}
            <div className="flex-1" />

            <Separator />

            {/* Danger Zone */}
            {dangerZoneContent}
          </div>
        </aside>
        {dialogs}
      </>
    );
  }

  // Mobile variant - no card wrapper
  return (
    <>
      <aside className="space-y-6 overflow-y-auto">
        {/* Registration Section */}
        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Registration
          </p>

          <div className="space-y-2">
            <Label className="text-sm">Opens</Label>
            <DatePicker
              date={parseDate(eventData.registrationStartDate)}
              onDateChange={handleRegistrationStartChange}
              placeholder="Select date"
              toDate={parseDate(eventData.registrationDeadline)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Closes</Label>
            <DatePicker
              date={parseDate(eventData.registrationDeadline)}
              onDateChange={handleRegistrationEndChange}
              placeholder="Select date"
              fromDate={parseDate(eventData.registrationStartDate)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Team Capacity</Label>
            <Input
              type="number"
              min={0}
              value={eventData.slots?.capacity || ""}
              onChange={handleCapacityChange}
              placeholder="Unlimited"
            />
          </div>
        </div>

        <Separator />

        {/* Danger Zone */}
        {dangerZoneContent}
      </aside>
      {dialogs}
    </>
  );
}
