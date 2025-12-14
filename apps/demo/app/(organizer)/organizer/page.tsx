"use client";

import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/shadcn/card";
import { Badge } from "@workspace/ui/shadcn/badge";
import { CalendarDaysIcon, UsersIcon, DollarSignIcon, UserCheckIcon } from "lucide-react";

import { useOrganizer } from "@/hooks/useOrganizer";
import { getOrganizerStats, getEventsByOrganizerId } from "@/data/events/selectors";
import { GradientAvatar } from "@/components/ui/avatars/GradientAvatar";

export default function OrganizerHomePage() {
  const { organizer, organizerId, isLoading } = useOrganizer();

  if (isLoading) {
    return (
      <section className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 lg:px-8">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="h-4 w-96 animate-pulse rounded bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const stats = organizerId ? getOrganizerStats(organizerId) : null;
  const events = organizerId ? getEventsByOrganizerId(organizerId) : [];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <section className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 lg:px-8">
        {/* Header with organizer identity */}
        <div className="flex flex-wrap items-center gap-4">
          {organizer && (
            <GradientAvatar name={organizer.name} gradient={organizer.gradient} size="lg" />
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {organizer?.name ?? "Organizer"} Dashboard
              </h1>
              <Badge variant="outline" className="border-primary/40 text-primary">
                Beta
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {organizer?.region && `${organizer.region} · `}
              {organizer?.hostingYears ? `Hosting for ${organizer.hostingYears} years` : ""}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          View a snapshot of active events, pending registrations, and revenue overview.
        </p>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Events"
            value={String(stats?.activeEvents ?? 0)}
            icon={<CalendarDaysIcon className="size-4 text-primary" />}
          />
          <StatCard
            title="Pending Registrations"
            value={String(stats?.pendingRegistrations ?? 0)}
            icon={<UsersIcon className="size-4 text-amber-500" />}
          />
          <StatCard
            title="Total Athletes"
            value={String(stats?.totalAthletes ?? 0)}
            icon={<UserCheckIcon className="size-4 text-emerald-500" />}
          />
          <StatCard
            title="Revenue (Paid)"
            value={formatCurrency(stats?.totalRevenue ?? 0)}
            icon={<DollarSignIcon className="size-4 text-green-500" />}
          />
        </div>

        {/* Upcoming Events Preview */}
        {events.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                  >
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.date} · {event.location}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {event.slots.filled}/{event.slots.capacity} teams
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/70 border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Set up your first event to invite clubs and start receiving registrations.
            </CardContent>
          </Card>
        )}
      </div>
    </section>
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
