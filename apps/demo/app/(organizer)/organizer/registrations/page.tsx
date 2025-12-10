"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/shadcn/card";

export default function OrganizerRegistrationsPage() {
  return (
    <section className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 lg:px-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Registrations</h1>
          <p className="text-sm text-muted-foreground">Review club submissions and confirm payments.</p>
        </div>

        <Card className="border-dashed border-border/70">
          <CardHeader>
            <CardTitle className="text-base">No registrations yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            When clubs register for your events, they will appear here for review.
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
