"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@workspace/ui/shadcn/card";
import { Badge } from "@workspace/ui/shadcn/badge";
import { Button } from "@workspace/ui/shadcn/button";
import {
  CalendarDaysIcon,
  UsersIcon,
  DollarSignIcon,
  UserCheckIcon,
  PlusIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { useOrganizer } from "@/hooks/useOrganizer";
import { getOrganizerStats } from "@/data/events/selectors";
import {
  getPaymentHealth,
  getEventPerformance,
  getRegistrationTableData,
  getRegistrationTrend,
  formatCurrency,
  type RegistrationStatus,
} from "@/data/events/analytics";
import { brandGradients, type BrandGradient } from "@/lib/gradients";
import { Section } from "@/components/layout/Section";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableHead,
  DataTableCell,
} from "@/components/ui/tables";

function getStatusBadgeVariant(status: RegistrationStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
    case "unpaid":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
  }
}

function getFillRateColor(fillRate: number) {
  if (fillRate >= 75) return "bg-emerald-500";
  if (fillRate >= 50) return "bg-amber-500";
  return "bg-red-500";
}

export default function OrganizerHomePage() {
  const { organizer, organizerId, isLoading } = useOrganizer();
  const [organizerGradient, setOrganizerGradient] = useState<BrandGradient | undefined>(undefined);

  // Load organizer gradient from settings or default
  useEffect(() => {
    const loadGradient = () => {
      if (organizerId) {
        try {
          const stored = localStorage.getItem(`cheerbase-organizer-settings-${organizerId}`)
          if (stored) {
            const settings = JSON.parse(stored)
            if (settings.gradient) {
              setOrganizerGradient(settings.gradient)
              return
            }
          }
        } catch {
          // Ignore storage errors
        }
      }
      // Fall back to organizer's default gradient
      setOrganizerGradient(organizer?.gradient as BrandGradient | undefined)
    }

    loadGradient()

    // Listen for settings changes
    const handleSettingsChange = (event: CustomEvent<{ gradient: string }>) => {
      if (event.detail?.gradient) {
        setOrganizerGradient(event.detail.gradient as BrandGradient)
      }
    }

    window.addEventListener('organizer-settings-changed', handleSettingsChange as EventListener)
    return () => {
      window.removeEventListener('organizer-settings-changed', handleSettingsChange as EventListener)
    }
  }, [organizerId, organizer?.gradient])

  const gradientKey = organizerGradient || organizer?.gradient || 'primary';
  const gradient = brandGradients[gradientKey as BrandGradient] || brandGradients.primary;

  // Get all analytics data
  const stats = useMemo(() =>
    organizerId ? getOrganizerStats(organizerId) : null,
    [organizerId]
  );

  const paymentHealth = useMemo(() =>
    organizerId ? getPaymentHealth(organizerId) : null,
    [organizerId]
  );

  const eventPerformance = useMemo(() =>
    organizerId ? getEventPerformance(organizerId) : [],
    [organizerId]
  );

  const recentRegistrations = useMemo(() =>
    organizerId ? getRegistrationTableData(organizerId).slice(0, 5) : [],
    [organizerId]
  );

  const revenueTrend = useMemo(() =>
    organizerId ? getRegistrationTrend(organizerId).slice(-6) : [],
    [organizerId]
  );

  // Check if there are attention items
  const hasAttentionItems = paymentHealth && paymentHealth.overdueCount > 0;
  const lowFillEvents = eventPerformance.filter(e => e.fillRate < 25);

  if (isLoading) {
    return (
      <section className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 lg:px-8">
          <div className="h-10 w-64 animate-pulse rounded bg-muted" />
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

  return (
    <section className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl space-y-4 px-4 pt-8 lg:px-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1
              className="heading-2 bg-clip-text text-transparent"
              style={{ backgroundImage: gradient.css }}
            >
              {organizer?.name ?? "Organizer"} Dashboard
            </h1>
            <Badge variant="secondary">Beta</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            View a snapshot of active events, pending registrations, and revenue overview.
          </p>
        </div>

        {/* Attention Required (below header, above stats) */}
        {(hasAttentionItems || lowFillEvents.length > 0) && (
          <div className="space-y-3">
            {paymentHealth && paymentHealth.overdueCount > 0 && (
              <Link href="/organizer/invoices" className="block">
                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                  <div className="flex items-center gap-3">
                    <AlertTriangleIcon className="size-5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        {paymentHealth.overdueCount} payment{paymentHealth.overdueCount !== 1 ? 's' : ''} overdue
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {formatCurrency(paymentHealth.overdueAmount)} total outstanding
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="size-5 text-amber-600 dark:text-amber-400" />
                </div>
              </Link>
            )}
            {lowFillEvents.map((event) => (
              <Link key={event.eventId} href={`/organizer/events/${event.eventId}`} className="block">
                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                  <div className="flex items-center gap-3">
                    <AlertTriangleIcon className="size-5 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-200">
                        {event.eventName} has low registration
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Only {event.fillRate.toFixed(0)}% filled ({event.filledSlots}/{event.totalSlots} teams)
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="size-5 text-red-600 dark:text-red-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 lg:px-8">

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

        {/* Active Events Section */}
        {eventPerformance.length > 0 && (
          <Section title="Active Events">
            <div className="space-y-4">
              {eventPerformance.map((event) => (
                <Link
                  key={event.eventId}
                  href={`/organizer/events/${event.eventId}`}
                  className="block"
                >
                  <div className="flex items-center gap-4 rounded-lg border border-border/60 p-4 transition-colors hover:bg-muted/50">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{event.eventName}</p>
                      <p className="text-sm text-muted-foreground">{event.eventDate}</p>
                    </div>
                    <div className="flex w-48 items-center gap-3">
                      <div className="flex-1">
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full transition-all ${getFillRateColor(event.fillRate)}`}
                            style={{ width: `${Math.min(event.fillRate, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        {event.filledSlots}/{event.totalSlots}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* Recent Registrations Section */}
        {recentRegistrations.length > 0 && (
          <Section
            title="Recent Registrations"
            titleRight={
              <Link
                href="/organizer/invoices"
                className="text-sm font-medium text-primary hover:underline"
              >
                View All
              </Link>
            }
          >
            <DataTable>
              <DataTableHeader>
                <tr>
                  <DataTableHead>Team</DataTableHead>
                  <DataTableHead>Event</DataTableHead>
                  <DataTableHead>Submitted</DataTableHead>
                  <DataTableHead className="text-right">Status</DataTableHead>
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {recentRegistrations.map((reg, index) => (
                  <DataTableRow key={reg.id} animationDelay={index * 40}>
                    <DataTableCell className="font-medium text-foreground">
                      {reg.teamName}
                    </DataTableCell>
                    <DataTableCell className="text-muted-foreground">
                      {reg.eventName}
                    </DataTableCell>
                    <DataTableCell className="text-muted-foreground">
                      {reg.submittedAtFormatted}
                    </DataTableCell>
                    <DataTableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={getStatusBadgeVariant(reg.status)}
                      >
                        {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                      </Badge>
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          </Section>
        )}

        {/* Revenue Trend Section */}
        {revenueTrend.length > 0 && (
          <Section title="Revenue Trend">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {revenueTrend.map((_, index) => (
                      <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        )}

        {/* Empty State */}
        {!stats?.activeEvents && (
          <Section title="Get Started" showDivider={eventPerformance.length === 0}>
            <Card className="border-border/70 border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Set up your first event to invite clubs and start receiving registrations.
                </p>
                <Button asChild>
                  <Link href="/organizer/events/new">
                    <PlusIcon className="mr-2 size-4" />
                    Create Your First Event
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </Section>
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
