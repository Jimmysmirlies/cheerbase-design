"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/shadcn/card";

export default function OrganizerAnalyticsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">High-level metrics for registrations and payouts.</p>
      </div>
      <Card className="border-dashed border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          We’ll add dashboards for pipeline, conversion, and payment timelines.
        </CardContent>
      </Card>
    </div>
  );
}
