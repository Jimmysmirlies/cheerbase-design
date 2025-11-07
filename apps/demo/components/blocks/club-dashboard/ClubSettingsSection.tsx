"use client";
/**
 * ClubSettingsSection
 *
 * Purpose
 * - Surface club-level configuration (name, branding, contacts, policies).
 * - Houses links to sensitive operations like data import/export.
 *
 * Initial Implementation (Demo)
 * - Placeholder form fields; will wire up real data and validation later.
 */
import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";

export default function ClubSettingsSection() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Club Settings</h2>
        <p className="text-sm text-muted-foreground">Update club name and communication preferences.</p>
      </header>

      <form className="grid max-w-xl gap-4">
        <div className="grid gap-1">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Club Name</Label>
          <Input placeholder="e.g., Ralli All Stars" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Contact Email</Label>
          <Input placeholder="club@example.com" type="email" />
        </div>
        <div className="flex gap-2">
          <Button type="button">Save Changes</Button>
          <Button type="button" variant="outline">Cancel</Button>
        </div>
      </form>
    </section>
  );
}

