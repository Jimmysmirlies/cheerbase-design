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
import { Badge } from "@workspace/ui/shadcn/badge";
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
  CreditCardIcon,
  PencilIcon,
  SparklesIcon,
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
      <section className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pt-8 lg:px-8">
          <div className="h-10 w-32 animate-pulse rounded bg-muted" />
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      </section>
    );
  }

  const gradientOptions = getGradientOptions();

  return (
    <section className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 lg:px-8">
        <h1
          className="heading-2 bg-clip-text text-transparent"
          style={{ backgroundImage: gradient.css }}
        >
          Settings
        </h1>
      </div>
      <motion.div
        className="mx-auto w-full max-w-7xl space-y-8 px-4 pt-8 lg:px-8"
        variants={staggerSections}
        initial="hidden"
        animate="visible"
      >
        {/* Organization Profile Section */}
        <motion.div variants={fadeInUp}>
          <Section
            title="Organization Profile"
            description="Your organization's public profile information."
            showDivider={false}
            titleRight={
              <Button
                onClick={openEditDialog}
                variant="outline"
                className="gap-2"
              >
                <PencilIcon className="size-4" />
                Edit Profile
              </Button>
            }
          >
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Organization Name</span>
                <span className="font-medium">{form.name || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Region</span>
                <span className="font-medium">{form.region || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Contact Email</span>
                <span className="font-medium">{form.email || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Support Email</span>
                <span className="font-medium">
                  {form.supportEmail || "Not set"}
                </span>
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
              <Button asChild variant="outline" className="gap-2">
                <Link href="/organizer/settings/subscription">
                  <CreditCardIcon className="size-4" />
                  Manage Subscription
                </Link>
              </Button>
            }
          >
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Current Plan</span>
                <Badge variant={plan.id === "pro" ? "default" : "secondary"}>
                  {plan.id === "pro" && (
                    <SparklesIcon className="mr-1 size-3" />
                  )}
                  {plan.name}
                </Badge>
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
          </Section>
        </motion.div>
      </motion.div>
    </section>
  );
}
