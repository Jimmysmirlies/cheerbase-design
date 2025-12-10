"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/shadcn/card";
import { Button } from "@workspace/ui/shadcn/button";
import { PlusIcon } from "lucide-react";

export default function OrganizerEventsPage() {
  return (
    <section className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
            <p className="text-sm text-muted-foreground">Manage upcoming competitions and their settings.</p>
          </div>
          <Button size="sm" className="inline-flex items-center gap-2">
            <PlusIcon className="size-4" />
            New event
          </Button>
        </div>

        <Card className="border-dashed border-border/70">
          <CardHeader>
            <CardTitle className="text-base">No events yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Create your first event to invite clubs and accept registrations.
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
