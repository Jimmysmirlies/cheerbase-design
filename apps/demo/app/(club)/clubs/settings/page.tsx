"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { CheckIcon, SquareArrowOutUpRightIcon } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { Section } from "@/components/layout/Section";
import { fadeInUp, staggerSections } from "@/lib/animations";
import {
  brandGradients,
  getGradientOptions,
  type BrandGradient,
} from "@/lib/gradients";

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
  const [editForm, setEditForm] = useState<ClubSettings>({
    name: "",
    email: "",
    region: "",
    gradient: "teal",
  });
  const [saving, setSaving] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  const handleEditChange =
    (field: keyof ClubSettings) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEditForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleGradientChange = (value: string) => {
    const newGradient = value as BrandGradient;
    setForm((prev) => ({ ...prev, gradient: newGradient }));

    if (user) {
      const updatedSettings = { ...form, gradient: newGradient };
      saveSettings(user.id, updatedSettings);
      window.dispatchEvent(
        new CustomEvent("club-settings-changed", {
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
    if (!user) return;
    setSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedSettings = { ...editForm, gradient: form.gradient };
    setForm(updatedSettings);
    saveSettings(user.id, updatedSettings);

    window.dispatchEvent(
      new CustomEvent("club-settings-changed", {
        detail: { gradient: updatedSettings.gradient },
      }),
    );

    setSaving(false);
    setEditDialogOpen(false);
    toast.success("Settings saved successfully", {
      description: "Your club profile has been updated.",
    });
  };

  const gradient = brandGradients[form.gradient] || brandGradients.teal;

  if (status === "loading") {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <div className="h-10 w-32 animate-pulse rounded bg-muted" />
        <div className="flex flex-col gap-8 pt-8">
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      </section>
    );
  }

  if (!user || user.role !== "club_owner") return null;

  const gradientOptions = getGradientOptions();

  return (
    <section className="mx-auto w-full max-w-6xl">
      <h1
        className="heading-2 bg-clip-text text-transparent"
        style={{ backgroundImage: gradient.css }}
      >
        Settings
      </h1>

      <motion.div
        className="pt-8"
        variants={staggerSections}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp}>
          <Section
            title="Club Profile"
            description="Your club's public profile information."
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
                <p className="body-small text-muted-foreground">Club Name</p>
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
              <div className="rounded-lg bg-muted/50 px-4 py-3 sm:col-span-2">
                <p className="body-small text-muted-foreground">
                  Contact Email
                </p>
                <p className="body-text font-semibold truncate">
                  {form.email || "Not set"}
                </p>
              </div>
            </div>
          </Section>

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Club Profile</DialogTitle>
                <DialogDescription>
                  Update your club&apos;s public profile information.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-club-name">Club Name</Label>
                  <Input
                    id="edit-club-name"
                    value={editForm.name}
                    onChange={handleEditChange("name")}
                    placeholder="Ralli All Stars"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-region">Region</Label>
                  <Input
                    id="edit-region"
                    value={editForm.region}
                    onChange={handleEditChange("region")}
                    placeholder="California"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contact-email">Contact Email</Label>
                  <Input
                    id="edit-contact-email"
                    type="email"
                    value={editForm.email}
                    onChange={handleEditChange("email")}
                    placeholder="club@example.com"
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
      </motion.div>
    </section>
  );
}
