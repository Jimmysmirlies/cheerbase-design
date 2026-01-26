"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import { DatePicker } from "@workspace/ui/shadcn/date-picker";
import { GlassSelect } from "@workspace/ui/components/glass-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/shadcn/dialog";

import type { Event } from "@/types/events";
import { formatDateToISO } from "./utils";

type NewEventModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizerId: string | null;
  organizerName: string;
  saveDraft: (event: Event) => void;
};

export function NewEventModal({
  open,
  onOpenChange,
  organizerId,
  organizerName,
  saveDraft,
}: NewEventModalProps) {
  const router = useRouter();
  const [newEventName, setNewEventName] = useState("");
  const [newEventType, setNewEventType] = useState<
    "Championship" | "Friendly Competition"
  >("Championship");
  const [newEventCapacity, setNewEventCapacity] = useState<string>("");
  const [newEventRegOpens, setNewEventRegOpens] = useState<Date | undefined>(
    undefined,
  );

  const handleContinue = () => {
    if (!organizerId) return;

    const eventId = `event-${Date.now()}`;
    const capacity = newEventCapacity ? Number(newEventCapacity) : 0;

    const draftEvent: Event = {
      id: eventId,
      name: newEventName,
      type: newEventType,
      slots: { filled: 0, capacity },
      status: "draft",
      organizer: organizerName,
      date: "",
      location: "",
      description: "",
      image: "",
      teams: capacity > 0 ? `0 / ${capacity} teams` : "0 / 0 teams",
      updatedAt: new Date().toISOString(),
      registrationStartDate: formatDateToISO(newEventRegOpens),
    };
    saveDraft(draftEvent);

    router.push(`/organizer/events/${eventId}/edit`);
    onOpenChange(false);

    // Reset form
    setNewEventName("");
    setNewEventType("Championship");
    setNewEventCapacity("");
    setNewEventRegOpens(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border-border/40 p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="heading-3">Create New Event</DialogTitle>
          <DialogDescription className="body-small text-muted-foreground/80">
            Set up your event basics to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6 flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="new-event-name">Event Name *</Label>
            <Input
              id="new-event-name"
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              placeholder="e.g., National Cheerleading Championship"
            />
          </div>
          <div className="space-y-2">
            <GlassSelect
              label="Event Type"
              value={newEventType}
              onValueChange={(value) =>
                setNewEventType(
                  value as "Championship" | "Friendly Competition",
                )
              }
              options={[
                { value: "Championship", label: "Championship" },
                {
                  value: "Friendly Competition",
                  label: "Friendly Competition",
                },
              ]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-event-capacity">Team Capacity</Label>
            <Input
              id="new-event-capacity"
              type="number"
              min="0"
              value={newEventCapacity}
              onChange={(e) => setNewEventCapacity(e.target.value)}
              placeholder="Leave empty for unlimited"
            />
            <p className="body-small text-muted-foreground">
              Set a team slot limit to restrict the number of registrants.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Registration Opens</Label>
            <DatePicker
              date={newEventRegOpens}
              onDateChange={setNewEventRegOpens}
              placeholder="Select date"
            />
            <p className="body-small text-muted-foreground">
              When teams can start registering for this event.
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleContinue} disabled={!newEventName.trim()}>
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
