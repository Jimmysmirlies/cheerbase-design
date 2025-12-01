"use client";

import { useState } from "react";

import { Button } from "@workspace/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/shadcn/card";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import { toast } from "@workspace/ui/shadcn/sonner";
import { ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/AuthProvider";

export default function OrganizerSignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", orgName: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.orgName.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await signUp({
        name: form.name,
        email: form.email,
        role: "organizer",
        orgName: form.orgName,
      });
      toast.success("Welcome! Organizer portal is ready.");
      router.push("/organizer");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-6 py-12">
        <div className="flex items-center gap-3">
          <ShieldCheckIcon className="text-primary size-6" />
          <div>
            <p className="text-sm font-semibold text-primary">Event Organizer</p>
            <h1 className="heading-2">Create your account</h1>
          </div>
        </div>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Organizer sign up</CardTitle>
            <CardDescription>Set up your organizer profile to manage events and registrations.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" value={form.name} onChange={handleChange("name")} placeholder="Jordan Director" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={handleChange("email")} placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization</Label>
                <Input id="orgName" value={form.orgName} onChange={handleChange("orgName")} placeholder="Summit Events Co." required />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating account..." : "Continue to organizer portal"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="ml-2 text-primary font-semibold hover:underline" href="/">
              Log in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
