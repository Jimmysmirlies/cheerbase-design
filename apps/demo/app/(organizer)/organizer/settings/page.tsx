"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/shadcn/card";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import { Button } from "@workspace/ui/shadcn/button";

export default function OrganizerSettingsPage() {
  return (
    <section className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 lg:px-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Organization details and payout preferences.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization name</Label>
                <Input id="org-name" placeholder="Summit Events Co." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support email</Label>
                <Input id="support-email" type="email" placeholder="support@example.com" />
              </div>
            </div>
            <Button size="sm" className="rounded-full">
              Save changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
