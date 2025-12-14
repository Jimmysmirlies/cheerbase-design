"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/shadcn/card";
import { Badge } from "@workspace/ui/shadcn/badge";
import { TrendingUpIcon, UsersIcon, DollarSignIcon, CalendarIcon, BarChart3Icon } from "lucide-react";

import { useOrganizer } from "@/hooks/useOrganizer";
import { getOrganizerAnalytics, formatCurrency, formatPercentage } from "@/data/events/analytics";

export default function OrganizerAnalyticsPage() {
  const { organizer, organizerId, isLoading } = useOrganizer();
  const analytics = organizerId ? getOrganizerAnalytics(organizerId) : null;

  if (isLoading) {
    return (
      <section className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 lg:px-8">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!analytics) {
    return (
      <section className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 lg:px-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
            <p className="text-sm text-muted-foreground">High-level metrics for registrations and payouts.</p>
          </div>
          <Card className="border-dashed border-border/70">
            <CardHeader>
              <CardTitle className="text-base">No Data Available</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Analytics will appear here once you have events and registrations.
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 lg:px-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            {organizer?.name
              ? `Performance metrics for ${organizer.name}.`
              : "High-level metrics for registrations and payouts."}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
              <CalendarIcon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{analytics.totals.totalRegistrations}</p>
              <p className="text-xs text-muted-foreground mt-1">Across all events</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
              <UsersIcon className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{analytics.totals.totalParticipants.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Athletes registered</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <DollarSignIcon className="size-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatCurrency(analytics.totals.totalRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">From registrations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Avg Fill Rate</p>
              <TrendingUpIcon className="size-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatPercentage(analytics.totals.averageFillRate)}</p>
              <p className="text-xs text-muted-foreground mt-1">Event capacity filled</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3Icon className="size-4" />
              Monthly Registration Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.monthlyData.map((month) => {
                const maxRegistrations = Math.max(...analytics.monthlyData.map((m) => m.registrations));
                const widthPercent = (month.registrations / maxRegistrations) * 100;
                return (
                  <div key={month.month} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-muted-foreground flex-shrink-0">{month.month}</div>
                    <div className="flex-1 h-8 bg-muted/50 rounded-md overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-md flex items-center justify-end px-2 transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      >
                        <span className="text-xs font-medium text-primary-foreground">
                          {month.registrations}
                        </span>
                      </div>
                    </div>
                    <div className="w-20 text-right text-sm font-medium flex-shrink-0">
                      {formatCurrency(month.revenue)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Event Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.eventPerformance.map((event) => (
                <div
                  key={event.eventId}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{event.eventName}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{event.registrations} registrations</span>
                      <span>{event.participants} participants</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(event.revenue)}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        event.fillRate >= 60
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : event.fillRate >= 40
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                      }
                    >
                      {formatPercentage(event.fillRate)} filled
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
