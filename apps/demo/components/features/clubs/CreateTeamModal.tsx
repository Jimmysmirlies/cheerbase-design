"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckIcon } from "lucide-react";
import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import { GlassSelect } from "@workspace/ui/components/glass-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/shadcn/dialog";
import { cn } from "@workspace/ui/lib/utils";
import { divisionCatalog } from "@/data/divisions";
import { brandGradients, type BrandGradient } from "@/lib/gradients";

export type CreateTeamData = {
  id: string;
  name: string;
  division: string;
  gradient?: BrandGradient;
};

type CreateTeamModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (team: CreateTeamData) => void;
};

const gradientOptions = Object.entries(brandGradients).map(([key, value]) => ({
  key: key as BrandGradient,
  ...value,
}));

export function CreateTeamModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState("");
  const [category, setCategory] = useState("");
  const [tier, setTier] = useState("");
  const [level, setLevel] = useState("");
  const [selectedGradient, setSelectedGradient] =
    useState<BrandGradient>("primary");

  useEffect(() => {
    if (open) {
      setTeamName("");
      setCategory(divisionCatalog[0]?.name ?? "");
      setTier("");
      setLevel("");
      setSelectedGradient("primary");
    }
  }, [open]);

  const selectedCategory = useMemo(
    () => divisionCatalog.find((cat) => cat.name === category),
    [category],
  );

  const selectedTier = useMemo(
    () => selectedCategory?.tiers.find((t) => t.name === tier),
    [selectedCategory, tier],
  );

  useEffect(() => {
    if (category && selectedCategory) {
      setTier(selectedCategory.tiers[0]?.name ?? "");
    }
  }, [category, selectedCategory]);

  useEffect(() => {
    if (tier && selectedTier) {
      setLevel(selectedTier.levels[0] ?? "");
    }
  }, [tier, selectedTier]);

  const division = useMemo(() => {
    if (!category || !tier || !level) return "";
    return `${category} - ${tier} - ${level}`;
  }, [category, tier, level]);

  const canSubmit = Boolean(teamName.trim() && category && tier && level);

  const handleSubmit = () => {
    if (!canSubmit) return;

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `team-${Date.now()}`;

    onSubmit({
      id,
      name: teamName.trim(),
      division,
      gradient: selectedGradient,
    });

    onOpenChange(false);
  };

  // Prepare options for GlassSelect
  const categoryOptions = divisionCatalog.map((cat) => ({
    value: cat.name,
    label: cat.name,
  }));

  const tierOptions =
    selectedCategory?.tiers.map((t) => ({
      value: t.name,
      label: t.name,
    })) ?? [];

  const levelOptions =
    selectedTier?.levels.map((lvl) => ({
      value: lvl,
      label: lvl,
    })) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-xl border-border/40 p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="heading-3">Create Team</DialogTitle>
          <DialogDescription className="body-small text-muted-foreground/80">
            Add a new team to your club. You&apos;ll be able to add members
            after creation.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              placeholder="e.g., U16 Thunder"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>

          {/* Gradient Color Picker */}
          <div className="space-y-2">
            <Label>Team Color</Label>
            <div className="flex gap-3 overflow-x-auto p-1 -m-1">
              {gradientOptions.map(({ key, name, tailwind }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedGradient(key)}
                  className={cn(
                    "relative flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br transition-all",
                    tailwind,
                    selectedGradient === key
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      : "hover:scale-105",
                  )}
                  title={name}
                  aria-label={`Select ${name} color`}
                  aria-pressed={selectedGradient === key}
                >
                  {selectedGradient === key && (
                    <CheckIcon className="size-5 text-white drop-shadow-sm" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <GlassSelect
              value={category}
              onValueChange={setCategory}
              options={categoryOptions}
              triggerClassName="w-full min-w-0"
            />
          </div>

          {selectedCategory && selectedTier && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier</Label>
                <GlassSelect
                  value={tier}
                  onValueChange={setTier}
                  options={tierOptions}
                  triggerClassName="w-full min-w-0"
                />
              </div>

              <div className="space-y-2">
                <Label>Level</Label>
                <GlassSelect
                  value={level}
                  onValueChange={setLevel}
                  options={levelOptions}
                  triggerClassName="w-full min-w-0"
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Create Team
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
