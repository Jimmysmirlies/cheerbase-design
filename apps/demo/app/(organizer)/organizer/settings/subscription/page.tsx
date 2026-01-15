"use client";

import { useRouter } from "next/navigation";
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/shadcn/card";
import { Card } from "@workspace/ui/shadcn/card";
import { Button } from "@workspace/ui/shadcn/button";
import { toast } from "@workspace/ui/shadcn/sonner";
import { CheckIcon, SparklesIcon, InfoIcon } from "lucide-react";

import { useOrganizer } from "@/hooks/useOrganizer";
import { useOrganizerSubscription } from "@/hooks/useOrganizerSubscription";
import { getActiveEventCount } from "@/data/events/selectors";
import {
  SUBSCRIPTION_PLANS,
  formatPlanPrice,
  PLATFORM_TAKE_RATE,
  type SubscriptionPlanId,
} from "@/lib/platform-pricing";
import { FocusModeHeader } from "@/components/layout/FocusModeHeader";
import { brandGradients } from "@/lib/gradients";
import { useOrganizerGradient } from "@/hooks/useGradientSettings";

export default function SubscriptionPage() {
  const router = useRouter();
  const { organizerId, isLoading: organizerLoading } = useOrganizer();
  const { gradient: organizerGradient } = useOrganizerGradient(
    organizerId ?? undefined,
  );

  // Get gradient styling for active card
  const gradientConfig = brandGradients[organizerGradient || "teal"];
  const gradientCss = gradientConfig.css;
  const firstGradientColor =
    gradientCss.match(/#[0-9A-Fa-f]{6}/)?.[0] ?? "#0D9488";
  const {
    plan: currentPlan,
    subscription,
    upgradeToPro,
    downgradeToFree,
    isLoading: subscriptionLoading,
  } = useOrganizerSubscription();

  const activeEventCount = organizerId ? getActiveEventCount(organizerId) : 0;
  const isLoading = organizerLoading || subscriptionLoading;

  const handleBack = () => {
    router.push("/organizer/settings");
  };

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

  const plans = Object.values(SUBSCRIPTION_PLANS);

  if (isLoading) {
    return (
      <>
        <FocusModeHeader title="Subscription" onBack={handleBack} />
        <div className="h-[calc(100vh-68px)] overflow-y-auto scrollbar-hide">
          <main className="p-8">
            <section className="mx-auto w-full max-w-4xl space-y-8">
              <div className="h-8 w-48 animate-pulse rounded bg-muted" />
              <div className="grid gap-6 md:grid-cols-2">
                <div className="h-80 animate-pulse rounded-lg bg-muted" />
                <div className="h-80 animate-pulse rounded-lg bg-muted" />
              </div>
            </section>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <FocusModeHeader title="Subscription" onBack={handleBack} />
      <div className="h-[calc(100vh-68px)] overflow-y-auto scrollbar-hide">
        <main className="p-8">
          <section className="mx-auto w-full max-w-4xl space-y-8">
            {/* Page heading */}
            <h1
              className="heading-2 bg-clip-text text-transparent"
              style={{ backgroundImage: gradientCss }}
            >
              Choose a Plan That&apos;s Right for You
            </h1>

            {/* Current usage */}
            <div
              className="relative rounded-lg border p-4 overflow-hidden"
              style={{ borderColor: `${firstGradientColor}50` }}
            >
              {/* Gradient background overlay */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: gradientCss,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: firstGradientColor }}
                  />
                  <div>
                    <p className="font-medium">Current Usage</p>
                    <p className="text-sm text-muted-foreground">
                      {activeEventCount} of {currentPlan.activeEventLimit}{" "}
                      active events
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white"
                  style={{ backgroundImage: gradientCss }}
                >
                  {currentPlan.id === "pro" && (
                    <SparklesIcon className="size-3" />
                  )}
                  {currentPlan.name} Plan
                </div>
              </div>
            </div>

            {/* Plan cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {plans.map((plan) => {
                const isCurrentPlan = plan.id === currentPlan.id;
                const isPro = plan.id === "pro";

                return (
                  <div key={plan.id} className="relative">
                    {/* Active plan label - positioned above the card */}
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2">
                        <div
                          className="rounded-full px-4 py-1 text-xs font-medium text-white shadow-md"
                          style={{ backgroundImage: gradientCss }}
                        >
                          Active Plan
                        </div>
                      </div>
                    )}
                    <div
                      className="relative flex h-full flex-col overflow-hidden rounded-xl border bg-card"
                      style={
                        isCurrentPlan
                          ? {
                              borderColor: `${firstGradientColor}50`,
                              boxShadow: `0 8px 20px -6px ${firstGradientColor}25`,
                            }
                          : undefined
                      }
                    >
                      {/* Gradient background overlay for active plan */}
                      {isCurrentPlan && (
                        <div
                          className="absolute inset-0 rounded-xl opacity-[0.03]"
                          style={{
                            backgroundImage: gradientCss,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                      )}
                      {isPro && !isCurrentPlan && (
                        <div className="absolute right-0 top-0">
                          <div
                            className="px-3 py-1 text-xs font-medium text-white rounded-bl-lg"
                            style={{ backgroundImage: gradientCss }}
                          >
                            Recommended
                          </div>
                        </div>
                      )}
                      <CardHeader className="relative z-10 p-6 pb-0">
                        <div className="flex items-center gap-2">
                          {isPro && (
                            <SparklesIcon
                              className="size-5"
                              style={{ color: firstGradientColor }}
                            />
                          )}
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                        </div>
                        <CardDescription>
                          <span className="text-3xl font-bold text-foreground">
                            {formatPlanPrice(plan)}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10 flex flex-1 flex-col space-y-6 p-6">
                        {/* Features */}
                        <ul className="space-y-3">
                          {plan.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm"
                            >
                              <CheckIcon
                                className="mt-0.5 size-4 shrink-0"
                                style={{ color: firstGradientColor }}
                              />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Spacer to push button to bottom */}
                        <div className="flex-1" />

                        {/* Action button */}
                        {isCurrentPlan ? (
                          <Button
                            className="w-full gap-2"
                            variant="outline"
                            disabled
                            style={{
                              borderColor: `${firstGradientColor}50`,
                              color: firstGradientColor,
                            }}
                          >
                            <CheckIcon className="size-4" />
                            Current Plan
                          </Button>
                        ) : isPro ? (
                          <Button
                            className="w-full gap-2 text-white"
                            style={{ backgroundImage: gradientCss }}
                            onClick={() => handlePlanChange(plan.id)}
                          >
                            <SparklesIcon className="size-4" />
                            Upgrade to Pro
                          </Button>
                        ) : (
                          <Button
                            className="w-full gap-2"
                            variant="secondary"
                            onClick={() => handlePlanChange(plan.id)}
                          >
                            Downgrade to Free
                          </Button>
                        )}
                      </CardContent>
                    </div>
                  </div>
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
                      accepting registrations. Draft events and past events
                      don&apos;t count toward your limit.
                    </p>
                    <p>
                      <strong className="text-foreground">Platform fee:</strong>{" "}
                      All plans include a {Math.round(PLATFORM_TAKE_RATE * 100)}
                      % platform fee on each registration, which is deducted
                      from your revenue (clubs don&apos;t see this fee).
                    </p>
                    {subscription.renewsAt && (
                      <p>
                        <strong className="text-foreground">
                          Renewal date:
                        </strong>{" "}
                        {new Date(subscription.renewsAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </>
  );
}
