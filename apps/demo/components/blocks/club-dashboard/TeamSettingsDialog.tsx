"use client";
/**
 * TeamSettingsDialog
 *
 * Purpose
 * - Edit team metadata: name, division, COED count.
 * - Demo-only: updates are local to this dialog's state.
 */
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@workspace/ui/shadcn/dialog";
import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@workspace/ui/shadcn/select";

import { allDivisions, divisionCategories } from "@/data/divisions";

type Props = {
  initialName: string;
  initialDivision: string;
  initialCoed: number;
  triggerLabel?: string;
  triggerVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "ghost-success" | "ghost-destructive" | "link";
};

export default function TeamSettingsDialog({ initialName, initialDivision, initialCoed, triggerLabel = "Team Settings", triggerVariant = "outline" }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const options = useMemo(() => allDivisions, []);
  const initialValue = options.includes(initialDivision) ? initialDivision : "";
  const [division, setDivision] = useState(initialValue);
  const [coed, setCoed] = useState(initialCoed);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle>Edit team settings</DialogTitle>
          <DialogDescription>Rename team, change division, and update COED count.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4">
          <div className="grid gap-1">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Team Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Division</Label>
            <Select value={division} onValueChange={setDivision}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue placeholder={initialDivision && !initialValue ? initialDivision : "Select a division"} />
              </SelectTrigger>
              <SelectContent className="max-h-72 w-[320px]">
                {initialDivision && !initialValue ? (
                  <SelectGroup>
                    <SelectLabel>Current</SelectLabel>
                    <SelectItem value={initialDivision}>{initialDivision}</SelectItem>
                  </SelectGroup>
                ) : null}
                {divisionCategories.map((category) => (
                  <SelectGroup key={category.id}>
                    <SelectLabel>{category.label}</SelectLabel>
                    {category.divisions.map((item) => {
                      const value = `${category.label} - ${item}`;
                      return (
                        <SelectItem key={value} value={value}>
                          {item}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">COED Count</Label>
            <Input type="number" value={coed} onChange={(e) => setCoed(Number(e.target.value))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button" onClick={() => setOpen(false)}>Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
