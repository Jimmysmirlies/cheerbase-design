"use client";

import { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/shadcn/card";
import { Badge } from "@workspace/ui/shadcn/badge";
import { CalendarIcon, UsersIcon, DollarSignIcon, CheckCircleIcon, ClockIcon } from "lucide-react";

import { useOrganizer } from "@/hooks/useOrganizer";
import { getRegistrationsByOrganizerId, getRegistrationsByEventForOrganizer } from "@/data/events/selectors";
import type { Registration } from "@/types/club";
import { PageHeader } from "@/components/layout/PageHeader";
import { type BrandGradient } from "@/lib/gradients";

export default function OrganizerRegistrationsPage() {
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

  const registrations = useMemo(
    () => (organizerId ? getRegistrationsByOrganizerId(organizerId) : []),
    [organizerId]
  );

  const registrationsByEvent = useMemo(
    () => (organizerId ? getRegistrationsByEventForOrganizer(organizerId) : new Map<string, Registration[]>()),
    [organizerId]
  );

  // Calculate summary stats
  const stats = useMemo(() => {
    const pending = registrations.filter((r) => r.status === "pending").length;
    const paid = registrations.filter((r) => r.status === "paid").length;
    const totalAthletes = registrations.reduce((sum, r) => sum + r.athletes, 0);
    const totalRevenue = registrations
      .filter((r) => r.status === "paid")
      .reduce((sum, r) => sum + (parseFloat(r.invoiceTotal) || 0), 0);
    return { pending, paid, totalAthletes, totalRevenue };
  }, [registrations]);

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (isLoading) {
    return (
      <section className="flex flex-1 flex-col">
        <PageHeader
          title="Registrations"
          gradient={organizerGradient || organizer?.gradient}
        />
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 lg:px-8">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col">
      <PageHeader
        title="Registrations"
        gradient={organizerGradient || organizer?.gradient}
      />
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 lg:px-8">

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
              <UsersIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{registrations.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <ClockIcon className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-amber-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Paid</p>
              <CheckCircleIcon className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-emerald-600">{stats.paid}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <DollarSignIcon className="size-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Registrations grouped by event */}
        {registrations.length > 0 ? (
          <div className="space-y-6">
            {Array.from(registrationsByEvent.entries()).map(([eventId, eventRegs]) => (
              <EventRegistrationGroup
                key={eventId}
                eventName={eventRegs[0]?.eventName ?? eventId}
                eventDate={eventRegs[0]?.eventDate ?? ""}
                location={eventRegs[0]?.location ?? ""}
                registrations={eventRegs}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-border/70">
            <CardHeader>
              <CardTitle className="text-base">No Registrations Yet</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              When clubs register for your events, they will appear here for review.
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}

function EventRegistrationGroup({
  eventName,
  eventDate,
  location,
  registrations,
  formatCurrency,
}: {
  eventName: string;
  eventDate: string;
  location: string;
  registrations: Registration[];
  formatCurrency: (amount: number | string) => string;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{eventName}</CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <CalendarIcon className="size-3.5" />
              {eventDate}
              <span className="text-border">·</span>
              {location}
            </p>
          </div>
          <Badge variant="secondary">{registrations.length} teams</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/60">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{reg.division}</p>
                <p className="text-sm text-muted-foreground">
                  Team ID: {reg.teamId} · {reg.athletes} athletes
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(reg.invoiceTotal)}</p>
                  <p className="text-xs text-muted-foreground">
                    Due: {new Date(reg.paymentDeadline).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={reg.status === "paid" ? "default" : "secondary"}
                  className={
                    reg.status === "paid"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  }
                >
                  {reg.status === "paid" ? "Paid" : "Pending"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
