"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/shadcn/card";
import { Button } from "@workspace/ui/shadcn/button";
import { Badge } from "@workspace/ui/shadcn/badge";
import { toast } from "@workspace/ui/shadcn/sonner";
import {
  ArrowLeftIcon,
  CheckIcon,
  SparklesIcon,
  ZapIcon,
  InfoIcon,
} from "lucide-react";

import { useOrganizer } from "@/hooks/useOrganizer";
import { useOrganizerSubscription } from "@/hooks/useOrganizerSubscription";
import { getActiveEventCount } from "@/data/events/selectors";
import {
  SUBSCRIPTION_PLANS,
  formatPlanPrice,
  PLATFORM_TAKE_RATE,
  type SubscriptionPlanId,
} from "@/lib/platform-pricing";
import { PageHeader } from "@/components/layout/PageHeader";
import { type BrandGradient } from "@/lib/gradients";

export default function SubscriptionPage() {
  const { organizer, organizerId, isLoading: organizerLoading } = useOrganizer();
  const {
    plan: currentPlan,
    subscription,
    upgradeToPro,
    downgradeToFree,
    isLoading: subscriptionLoading,
  } = useOrganizerSubscription();
  const [organizerGradient, setOrganizerGradient] = useState<BrandGradient | undefined>(undefined);

  const activeEventCount = organizerId ? getActiveEventCount(organizerId) : 0;
  const isLoading = organizerLoading || subscriptionLoading;

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

  const handlePlanChange = (planId: SubscriptionPlanId) => {
    if (planId === currentPlan.id) return;

    if (planId === "pro") {
      upgradeToPro();
      toast.success("Upgraded to Organizer Pro!", {
        description: "You now have access to up to 10 active events.",
      });
    } else {
      // Check if downgrade is possible
      const freePlan = SUBSCRIPTION_PLANS.free;
      if (activeEventCount > freePlan.activeEventLimit) {
        toast.error("Cannot downgrade", {
          description: `You have ${activeEventCount} active events. Free plan allows only ${freePlan.activeEventLimit}. Please close some events first.`,
        });
        return;
      }
      downgradeToFree();
      toast.success("Downgraded to Free plan", {
        description: "Your plan has been updated.",
      });
    }
  };

  if (isLoading) {
    return (
      <section className="flex flex-1 flex-col">
        <PageHeader
          title="Manage Subscription"
          gradient={organizerGradient || organizer?.gradient}
        />
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 lg:px-8">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-80 animate-pulse rounded-lg bg-muted" />
            <div className="h-80 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </section>
    );
  }

  const plans = Object.values(SUBSCRIPTION_PLANS);

  return (
    <section className="flex flex-1 flex-col">
      <PageHeader
        title="Manage Subscription"
        gradient={organizerGradient || organizer?.gradient}
        topRightAction={
          <Link
            href="/organizer/settings"
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="size-4" />
            Back to Settings
          </Link>
        }
      />
      <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 lg:px-8">

        {/* Current usage */}
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <ZapIcon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Current Usage</p>
                  <p className="text-sm text-muted-foreground">
                    {activeEventCount} of {currentPlan.activeEventLimit} active
                    events
                  </p>
                </div>
              </div>
              <Badge
                variant={currentPlan.id === "pro" ? "default" : "secondary"}
              >
                {currentPlan.id === "pro" && (
                  <SparklesIcon className="mr-1 size-3" />
                )}
                {currentPlan.name} plan
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Plan cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan.id;
            const isPro = plan.id === "pro";

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all ${
                  isCurrentPlan
                    ? "ring-2 ring-primary"
                    : "hover:border-primary/50"
                } ${isPro ? "border-primary/30" : ""}`}
              >
                {isPro && (
                  <div className="absolute right-0 top-0">
                    <div className="bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Recommended
                    </div>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {isPro && <SparklesIcon className="size-5 text-primary" />}
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                  </div>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">
                      {formatPlanPrice(plan)}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action button */}
                  <Button
                    className="w-full gap-2"
                    variant={isCurrentPlan ? "outline" : isPro ? "default" : "secondary"}
                    disabled={isCurrentPlan}
                    onClick={() => handlePlanChange(plan.id)}
                  >
                    {isCurrentPlan ? (
                      <>
                        <CheckIcon className="size-4" />
                        Current Plan
                      </>
                    ) : isPro ? (
                      <>
                        <SparklesIcon className="size-4" />
                        Upgrade to Pro
                      </>
                    ) : (
                      "Downgrade to Free"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info section */}
        <Card className="border-dashed">
          <CardContent className="py-4">
            <div className="flex gap-3">
              <InfoIcon className="size-5 shrink-0 text-muted-foreground" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">
                    What counts as an &quot;active&quot; event?
                  </strong>{" "}
                  An event is active when it&apos;s published and currently
                  accepting registrations. Draft events and past events don&apos;t
                  count toward your limit.
                </p>
                <p>
                  <strong className="text-foreground">Platform fee:</strong> All
                  plans include a {Math.round(PLATFORM_TAKE_RATE * 100)}%
                  platform fee on each registration, which is deducted from your
                  revenue (clubs don&apos;t see this fee).
                </p>
                {subscription.renewsAt && (
                  <p>
                    <strong className="text-foreground">Renewal date:</strong>{" "}
                    {new Date(subscription.renewsAt).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

