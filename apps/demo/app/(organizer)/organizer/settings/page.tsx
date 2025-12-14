"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/shadcn/card";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import { Button } from "@workspace/ui/shadcn/button";
import { toast } from "@workspace/ui/shadcn/sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/shadcn/select";
import { Badge } from "@workspace/ui/shadcn/badge";
import { CheckIcon, CreditCardIcon, SparklesIcon } from "lucide-react";

import { useOrganizer } from "@/hooks/useOrganizer";
import { useOrganizerSubscription } from "@/hooks/useOrganizerSubscription";
import { getActiveEventCount } from "@/data/events/selectors";
import { formatPlanPrice } from "@/lib/platform-pricing";
import { brandGradients, getGradientOptions, type BrandGradient } from "@/lib/gradients";
import { GradientAvatar } from "@/components/ui/avatars/GradientAvatar";

type OrganizerSettings = {
  name: string;
  email: string;
  supportEmail: string;
  region: string;
  gradient: BrandGradient;
};

const SETTINGS_STORAGE_KEY = "cheerbase-organizer-settings";

function loadSavedSettings(organizerId: string): Partial<OrganizerSettings> | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(`${SETTINGS_STORAGE_KEY}-${organizerId}`);
    if (stored) {
      return JSON.parse(stored) as Partial<OrganizerSettings>;
    }
  } catch {
    // Ignore
  }
  return null;
}

function saveSettings(organizerId: string, settings: OrganizerSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${SETTINGS_STORAGE_KEY}-${organizerId}`, JSON.stringify(settings));
}

export default function OrganizerSettingsPage() {
  const { organizer, organizerId, isLoading } = useOrganizer();
  const { plan, isLoading: subscriptionLoading } = useOrganizerSubscription();
  const activeEventCount = organizerId ? getActiveEventCount(organizerId) : 0;
  
  const [form, setForm] = useState<OrganizerSettings>({
    name: "",
    email: "",
    supportEmail: "",
    region: "",
    gradient: "primary",
  });
  const [saving, setSaving] = useState(false);

  // Initialize form with organizer data or saved settings
  useEffect(() => {
    if (!organizerId || !organizer) return;

    // Check for saved settings first
    const saved = loadSavedSettings(organizerId);
    if (saved) {
      setForm({
        name: saved.name ?? organizer.name,
        email: saved.email ?? organizer.email ?? "",
        supportEmail: saved.supportEmail ?? organizer.supportEmail ?? "",
        region: saved.region ?? organizer.region,
        gradient: saved.gradient ?? organizer.gradient,
      });
    } else {
      setForm({
        name: organizer.name,
        email: organizer.email ?? "",
        supportEmail: organizer.supportEmail ?? "",
        region: organizer.region,
        gradient: organizer.gradient,
      });
    }
  }, [organizer, organizerId]);

  const handleChange = (field: keyof OrganizerSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleGradientChange = (value: string) => {
    setForm((prev) => ({ ...prev, gradient: value as BrandGradient }));
  };

  const handleSave = async () => {
    if (!organizerId) return;
    setSaving(true);

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    saveSettings(organizerId, form);
    setSaving(false);
    toast.success("Settings saved successfully", {
      description: "Your organization profile has been updated.",
    });
  };

  if (isLoading || subscriptionLoading) {
    return (
      <section className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 lg:px-8">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      </section>
    );
  }

  const gradientOptions = getGradientOptions();

  return (
    <section className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 lg:px-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Organization details and preferences.
          </p>
        </div>

        {/* Organization Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization Profile</CardTitle>
            <CardDescription>
              Update your organization&apos;s public profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preview */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border/60">
              <GradientAvatar name={form.name || "Organization"} gradient={form.gradient} size="lg" />
              <div>
                <p className="font-semibold">{form.name || "Organization Name"}</p>
                <p className="text-sm text-muted-foreground">{form.region || "Region"}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="Sapphire Productions"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={form.region}
                  onChange={handleChange("region")}
                  placeholder="Quebec"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="contact@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={form.supportEmail}
                  onChange={handleChange("supportEmail")}
                  placeholder="support@example.com"
                />
              </div>
            </div>

            {/* Brand Gradient */}
            <div className="space-y-2">
              <Label htmlFor="gradient">Brand Gradient</Label>
              <Select value={form.gradient} onValueChange={handleGradientChange}>
                <SelectTrigger id="gradient" className="w-full sm:w-64">
                  <SelectValue placeholder="Select a gradient" />
                </SelectTrigger>
                <SelectContent>
                  {gradientOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="size-4 rounded-full"
                          style={{ background: brandGradients[option.value].css }}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This gradient is used for your avatar and brand accents.
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-border/60">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <CheckIcon className="size-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
            <CardDescription>
              How clubs and participants can reach you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Primary Contact</span>
                <span className="font-medium">{form.email || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Support</span>
                <span className="font-medium">{form.supportEmail || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Region</span>
                <span className="font-medium">{form.region || "Not set"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing & Subscription Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCardIcon className="size-4" />
                  Billing & Subscription
                </CardTitle>
                <CardDescription>
                  Manage your subscription plan and billing details.
                </CardDescription>
              </div>
              <Badge variant={plan.id === 'pro' ? 'default' : 'secondary'}>
                {plan.id === 'pro' && <SparklesIcon className="mr-1 size-3" />}
                {plan.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Current Plan</span>
                <span className="font-medium">{plan.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">{formatPlanPrice(plan)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Active Events</span>
                <span className="font-medium">
                  {activeEventCount} / {plan.activeEventLimit}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Platform Fee</span>
                <span className="font-medium">3% per registration</span>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-border/60 mt-4">
              <Button asChild variant="outline" className="gap-2">
                <Link href="/organizer/settings/subscription">
                  <CreditCardIcon className="size-4" />
                  Manage Subscription
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
