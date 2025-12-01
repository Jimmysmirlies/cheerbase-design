"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/shadcn/card";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import { Textarea } from "@workspace/ui/shadcn/textarea";
import { Button } from "@workspace/ui/shadcn/button";

export default function ContactPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
        <div>
          <p className="text-primary text-sm font-semibold">Contact Us</p>
          <h1 className="heading-2">We’d love to hear from you</h1>
          <p className="text-muted-foreground text-sm">Send a note and our team will respond within one business day.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Send a message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="How can we help?" rows={4} />
            </div>
            <Button className="rounded-full">Submit</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
