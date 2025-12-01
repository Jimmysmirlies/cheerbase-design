"use client";

import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/shadcn/card";
import { Badge } from "@workspace/ui/shadcn/badge";
import { CalendarDaysIcon, UsersIcon } from "lucide-react";

export default function OrganizerHomePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Organizer Dashboard</h1>
        <Badge variant="outline" className="border-primary/40 text-primary">Beta</Badge>
      </div>
      <p className="text-muted-foreground text-sm">
        View a snapshot of active events, pending registrations, and upcoming payout checkpoints.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Active events" value="3" icon={<CalendarDaysIcon className="size-4 text-primary" />} />
        <StatCard title="Pending registrations" value="12" icon={<UsersIcon className="size-4 text-primary" />} />
        <StatCard title="Payouts this week" value="$4,800" icon={<Badge className="rounded-full bg-primary/10 text-primary">ACH</Badge>} />
      </div>

      <Card className="border-dashed border-border/70">
        <CardHeader>
          <CardTitle className="text-base">Next steps</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Set up your first event to invite clubs and start receiving registrations.
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
