"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import { Button } from "@workspace/ui/shadcn/button";
import { toast } from "@workspace/ui/shadcn/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/shadcn/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/shadcn/dialog";
import {
  CheckIcon,
  SparklesIcon,
  SquareArrowOutUpRightIcon,
} from "lucide-react";

import { useOrganizer } from "@/hooks/useOrganizer";
import { useOrganizerSubscription } from "@/hooks/useOrganizerSubscription";
import { getActiveEventCount } from "@/data/events/selectors";
import { formatPlanPrice } from "@/lib/platform-pricing";
import {
  brandGradients,
  getGradientOptions,
  type BrandGradient,
} from "@/lib/gradients";
import { Section } from "@/components/layout/Section";
import { fadeInUp, staggerSections } from "@/lib/animations";

type OrganizerSettings = {
  name: string;
  email: string;
  supportEmail: string;
  region: string;
  gradient: BrandGradient;
};

const SETTINGS_STORAGE_KEY = "cheerbase-organizer-settings";

function loadSavedSettings(
  organizerId: string,
): Partial<OrganizerSettings> | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(
      `${SETTINGS_STORAGE_KEY}-${organizerId}`,
    );
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
  localStorage.setItem(
    `${SETTINGS_STORAGE_KEY}-${organizerId}`,
    JSON.stringify(settings),
  );
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
  const [editForm, setEditForm] = useState<OrganizerSettings>({
    name: "",
    email: "",
    supportEmail: "",
    region: "",
    gradient: "primary",
  });
  const [saving, setSaving] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  const handleEditChange =
    (field: keyof OrganizerSettings) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEditForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleGradientChange = (value: string) => {
    const newGradient = value as BrandGradient;
    setForm((prev) => ({ ...prev, gradient: newGradient }));

    // Save immediately when gradient changes
    if (organizerId) {
      const updatedSettings = { ...form, gradient: newGradient };
      saveSettings(organizerId, updatedSettings);
      window.dispatchEvent(
        new CustomEvent("organizer-settings-changed", {
          detail: { gradient: newGradient },
        }),
      );
      toast.success("Brand gradient updated");
    }
  };

  const openEditDialog = () => {
    setEditForm({ ...form });
    setEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!organizerId) return;
    setSaving(true);

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedSettings = { ...editForm, gradient: form.gradient };
    setForm(updatedSettings);
    saveSettings(organizerId, updatedSettings);

    // Dispatch custom event to notify other components (e.g., NavBar) of settings change
    window.dispatchEvent(
      new CustomEvent("organizer-settings-changed", {
        detail: { gradient: updatedSettings.gradient },
      }),
    );

    setSaving(false);
    setEditDialogOpen(false);
    toast.success("Settings saved successfully", {
      description: "Your organization profile has been updated.",
    });
  };

  const gradient = brandGradients[form.gradient] || brandGradients.primary;

  if (isLoading || subscriptionLoading) {
    return (
      <section className="mx-auto w-full max-w-7xl">
        <div className="h-10 w-32 animate-pulse rounded bg-muted" />
        <div className="flex flex-col gap-8 pt-8">
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      </section>
    );
  }

  const gradientOptions = getGradientOptions();

  return (
    <section className="mx-auto w-full max-w-7xl">
      {/* Header */}
      <h1
        className="heading-2 bg-clip-text text-transparent"
        style={{ backgroundImage: gradient.css }}
      >
        Settings
      </h1>

      {/* Content Area */}
      <motion.div
        className="pt-8"
        variants={staggerSections}
        initial="hidden"
        animate="visible"
      >
        {/* Organization Profile Section */}
        <motion.div variants={fadeInUp}>
          <Section
            title="Organization Profile"
            description="Your organization's public profile information."
            titleRight={
              <button
                onClick={openEditDialog}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary underline hover:text-primary/80"
              >
                Edit Profile
                <SquareArrowOutUpRightIcon className="size-3.5" />
              </button>
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="body-small text-muted-foreground">Organization</p>
                <p className="body-text font-semibold">
                  {form.name || "Not set"}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="body-small text-muted-foreground">Region</p>
                <p className="body-text font-semibold">
                  {form.region || "Not set"}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="body-small text-muted-foreground">
                  Contact Email
                </p>
                <p className="body-text font-semibold truncate">
                  {form.email || "Not set"}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="body-small text-muted-foreground">
                  Support Email
                </p>
                <p className="body-text font-semibold truncate">
                  {form.supportEmail || "Not set"}
                </p>
              </div>
            </div>
          </Section>

          {/* Edit Profile Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Organization Profile</DialogTitle>
                <DialogDescription>
                  Update your organization&apos;s public profile information.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-org-name">Organization Name</Label>
                  <Input
                    id="edit-org-name"
                    value={editForm.name}
                    onChange={handleEditChange("name")}
                    placeholder="Sapphire Productions"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-region">Region</Label>
                  <Input
                    id="edit-region"
                    value={editForm.region}
                    onChange={handleEditChange("region")}
                    placeholder="Quebec"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contact-email">Contact Email</Label>
                  <Input
                    id="edit-contact-email"
                    type="email"
                    value={editForm.email}
                    onChange={handleEditChange("email")}
                    placeholder="contact@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-support-email">Support Email</Label>
                  <Input
                    id="edit-support-email"
                    type="email"
                    value={editForm.supportEmail}
                    onChange={handleEditChange("supportEmail")}
                    placeholder="support@example.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <CheckIcon className="size-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Brand Gradient Section */}
        <motion.div variants={fadeInUp}>
          <Section
            title="Brand Gradient"
            description="This gradient is used for your avatar and brand accents."
          >
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
          </Section>
        </motion.div>

        {/* Billing & Subscription Section */}
        <motion.div variants={fadeInUp}>
          <Section
            title="Billing & Subscription"
            description="Manage your subscription plan and billing details."
            titleRight={
              <Link
                href="/organizer/settings/subscription"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary underline hover:text-primary/80"
              >
                Manage Subscription
                <SquareArrowOutUpRightIcon className="size-3.5" />
              </Link>
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="body-small text-muted-foreground">Current Plan</p>
                <p className="body-text font-semibold inline-flex items-center gap-1">
                  {plan.id === "pro" && <SparklesIcon className="size-4" />}
                  {plan.name}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="body-small text-muted-foreground">Price</p>
                <p className="body-text font-semibold">
                  {formatPlanPrice(plan)}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="body-small text-muted-foreground">
                  Active Events
                </p>
                <p className="body-text font-semibold">
                  {activeEventCount} / {plan.activeEventLimit}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <p className="body-small text-muted-foreground">Platform Fee</p>
                <p className="body-text font-semibold">3% per registration</p>
              </div>
            </div>
          </Section>
        </motion.div>
      </motion.div>
    </section>
  );
}
