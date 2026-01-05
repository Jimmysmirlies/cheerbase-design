"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/shadcn/card";
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
import { CheckIcon } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  brandGradients,
  getGradientOptions,
  type BrandGradient,
} from "@/lib/gradients";
import { GradientAvatar } from "@/components/ui/avatars/GradientAvatar";

type ClubSettings = {
  name: string;
  email: string;
  region: string;
  gradient: BrandGradient;
};

const SETTINGS_STORAGE_KEY = "cheerbase-club-settings";

function loadSavedSettings(userId: string): Partial<ClubSettings> | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(`${SETTINGS_STORAGE_KEY}-${userId}`);
    if (stored) {
      return JSON.parse(stored) as Partial<ClubSettings>;
    }
  } catch {
    // Ignore
  }
  return null;
}

function saveSettings(userId: string, settings: ClubSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    `${SETTINGS_STORAGE_KEY}-${userId}`,
    JSON.stringify(settings),
  );
}

export default function ClubSettingsPage() {
  const { user, status } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<ClubSettings>({
    name: "",
    email: "",
    region: "",
    gradient: "teal",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (user.role !== "club_owner") {
      router.replace(user.role === "organizer" ? "/organizer" : "/");
    }
  }, [user, status, router]);

  // Initialize form with user data or saved settings
  useEffect(() => {
    if (!user) return;

    const saved = loadSavedSettings(user.id);
    if (saved) {
      setForm({
        name: saved.name ?? user.name ?? "",
        email: saved.email ?? user.email ?? "",
        region: saved.region ?? "",
        gradient: saved.gradient ?? "teal",
      });
    } else {
      setForm({
        name: user.name ?? "",
        email: user.email ?? "",
        region: "",
        gradient: "teal",
      });
    }
  }, [user]);

  const handleChange =
    (field: keyof ClubSettings) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleGradientChange = (value: string) => {
    setForm((prev) => ({ ...prev, gradient: value as BrandGradient }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    saveSettings(user.id, form);

    // Dispatch custom event to notify other components of settings change
    window.dispatchEvent(
      new CustomEvent("club-settings-changed", {
        detail: { gradient: form.gradient },
      }),
    );

    setSaving(false);
    toast.success("Settings saved successfully", {
      description: "Your club profile has been updated.",
    });
  };

  if (status === "loading") {
    return (
      <section className="flex flex-1 flex-col">
        <PageHeader
          title="Club Settings"
          gradient={form.gradient}
          breadcrumbs={[
            { label: "Clubs", href: "/clubs" },
            { label: "Settings", href: "/clubs/settings" },
          ]}
        />
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 lg:px-8">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      </section>
    );
  }

  if (!user || user.role !== "club_owner") return null;

  const gradientOptions = getGradientOptions();

  return (
    <section className="flex flex-1 flex-col">
      <PageHeader
        title="Club Settings"
        gradient={form.gradient}
        breadcrumbs={[
          { label: "Clubs", href: "/clubs" },
          { label: "Settings", href: "/clubs/settings" },
        ]}
      />

      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 lg:px-8">
        {/* Club Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Club Profile</CardTitle>
            <CardDescription>
              Update your club&apos;s public profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preview */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border/60">
              <GradientAvatar
                name={form.name || "Club"}
                gradient={form.gradient}
                size="lg"
              />
              <div>
                <p className="font-semibold">{form.name || "Club Name"}</p>
                <p className="text-sm text-muted-foreground">
                  {form.region || "Region"}
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="club-name">Club Name</Label>
                <Input
                  id="club-name"
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="e.g., Ralli All Stars"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={form.region}
                  onChange={handleChange("region")}
                  placeholder="e.g., California"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="club@example.com"
                />
              </div>
            </div>

            {/* Brand Gradient */}
            <div className="space-y-2">
              <Label htmlFor="gradient">Brand Gradient</Label>
              <Select
                value={form.gradient}
                onValueChange={handleGradientChange}
              >
                <SelectTrigger id="gradient" className="w-full sm:w-64">
                  <SelectValue placeholder="Select a gradient" />
                </SelectTrigger>
                <SelectContent>
                  {gradientOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="size-4 rounded-full"
                          style={{
                            background: brandGradients[option.value].css,
                          }}
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
              How event organizers and members can reach you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Club Name</span>
                <span className="font-medium">{form.name || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Contact Email</span>
                <span className="font-medium">{form.email || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Region</span>
                <span className="font-medium">{form.region || "Not set"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
