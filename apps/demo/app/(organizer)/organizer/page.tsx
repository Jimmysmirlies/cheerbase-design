"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

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
  CalendarPlusIcon,
  ListIcon,
  ReceiptIcon,
} from "lucide-react";

import { useOrganizer } from "@/hooks/useOrganizer";
import { getOrganizerStats } from "@/data/events/selectors";
import {
  getPaymentHealth,
  getEventPerformance,
  getRegistrationTableData,
  formatCurrency,
} from "@/data/events/analytics";
import { brandGradients, type BrandGradient } from "@/lib/gradients";
import { Section } from "@/components/layout/Section";
import { fadeInUp, staggerSections } from "@/lib/animations";
import { QuickActionCard } from "@/components/ui/QuickActionCard";
import { GradientAvatar } from "@/components/ui/GradientAvatar";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function OrganizerHomePage() {
  const { organizer, organizerId, isLoading } = useOrganizer();
  const [organizerGradient, setOrganizerGradient] = useState<
    BrandGradient | undefined
  >(undefined);

  useEffect(() => {
    const loadGradient = () => {
      if (organizerId) {
        try {
          const stored = localStorage.getItem(
            `cheerbase-organizer-settings-${organizerId}`,
          );
          if (stored) {
            const settings = JSON.parse(stored);
            if (settings.gradient) {
              setOrganizerGradient(settings.gradient);
              return;
            }
          }
        } catch {
          // Ignore storage errors
        }
      }
      setOrganizerGradient(organizer?.gradient as BrandGradient | undefined);
    };

    loadGradient();

    const handleSettingsChange = (event: CustomEvent<{ gradient: string }>) => {
      if (event.detail?.gradient) {
        setOrganizerGradient(event.detail.gradient as BrandGradient);
      }
    };

    window.addEventListener(
      "organizer-settings-changed",
      handleSettingsChange as EventListener,
    );
    return () => {
      window.removeEventListener(
        "organizer-settings-changed",
        handleSettingsChange as EventListener,
      );
    };
  }, [organizerId, organizer?.gradient]);

  const gradientKey = organizerGradient || organizer?.gradient || "primary";
  const gradient =
    brandGradients[gradientKey as BrandGradient] || brandGradients.primary;

  const stats = useMemo(
    () => (organizerId ? getOrganizerStats(organizerId) : null),
    [organizerId],
  );

  const paymentHealth = useMemo(
    () => (organizerId ? getPaymentHealth(organizerId) : null),
    [organizerId],
  );

  const eventPerformance = useMemo(
    () => (organizerId ? getEventPerformance(organizerId) : []),
    [organizerId],
  );

  const recentRegistrations = useMemo(
    () =>
      organizerId ? getRegistrationTableData(organizerId).slice(0, 5) : [],
    [organizerId],
  );

  const hasAttentionItems = paymentHealth && paymentHealth.overdueCount > 0;
  const lowFillEvents = eventPerformance.filter((e) => e.fillRate < 25);

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded bg-muted mt-2" />
        <div className="grid gap-4 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
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
          View a snapshot of active events, pending registrations, and revenue
          overview.
        </p>
      </div>

      {(hasAttentionItems || lowFillEvents.length > 0) && (
        <div className="space-y-3 pt-6">
          {paymentHealth && paymentHealth.overdueCount > 0 && (
            <Link href="/organizer/invoices" className="block">
              <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                <div className="flex items-center gap-3">
                  <AlertTriangleIcon className="size-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      {paymentHealth.overdueCount} payment
                      {paymentHealth.overdueCount !== 1 ? "s" : ""} overdue
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {formatCurrency(paymentHealth.overdueAmount)} total
                      outstanding
                    </p>
                  </div>
                </div>
                <ArrowRightIcon className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
            </Link>
          )}
          {lowFillEvents.map((event) => (
            <Link
              key={event.eventId}
              href={`/organizer/events/${event.eventId}`}
              className="block"
            >
              <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                <div className="flex items-center gap-3">
                  <AlertTriangleIcon className="size-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">
                      {event.eventName} has low registration
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Only {event.fillRate.toFixed(0)}% filled (
                      {event.filledSlots}/{event.totalSlots} teams)
                    </p>
                  </div>
                </div>
                <ArrowRightIcon className="size-5 text-red-600 dark:text-red-400" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <motion.div
        className="flex flex-col gap-8 pt-8"
        variants={staggerSections}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={fadeInUp}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
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
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Section title="Quick Actions">
            <div className="grid gap-3 xl:grid-cols-3">
              <QuickActionCard
                href="/organizer/events/new"
                icon={<CalendarPlusIcon className="size-5" />}
                title="Create Event"
                description="Set up a new competition or showcase event"
                gradient={gradientKey as BrandGradient}
              />
              <QuickActionCard
                href="/organizer/events"
                icon={<ListIcon className="size-5" />}
                title="View Events"
                description="Manage your upcoming and past events"
                gradient={gradientKey as BrandGradient}
              />
              <QuickActionCard
                href="/organizer/invoices"
                icon={<ReceiptIcon className="size-5" />}
                title="Manage Invoices"
                description="Review payments and outstanding balances"
                gradient={gradientKey as BrandGradient}
              />
            </div>
          </Section>
        </motion.div>

        {recentRegistrations.length > 0 && (
          <motion.div variants={fadeInUp}>
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
              <div className="space-y-2">
                {recentRegistrations.map((reg, index) => (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.2 }}
                  >
                    <Link href={reg.invoiceHref} className="block">
                      <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3 sm:p-4 transition-all hover:bg-muted/30 hover:-translate-y-0.5">
                        <GradientAvatar name={reg.teamName} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="body-text truncate">
                            <span className="font-semibold text-foreground">
                              {reg.teamName}
                            </span>
                            <span className="text-muted-foreground">
                              {" "}
                              · {reg.clubName}
                            </span>
                          </p>
                          <p className="body-small text-muted-foreground truncate">
                            {reg.eventName} · {reg.division}
                          </p>
                        </div>
                        <span className="body-small text-muted-foreground shrink-0 whitespace-nowrap">
                          {formatRelativeTime(reg.submittedAt)}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </Section>
          </motion.div>
        )}

        {!stats?.activeEvents && (
          <motion.div variants={fadeInUp}>
            <Section
              title="Get Started"
              showDivider={eventPerformance.length === 0}
            >
              <Card className="border-border/70 border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Set up your first event to invite clubs and start receiving
                    registrations.
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
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: ReactNode;
}) {
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
