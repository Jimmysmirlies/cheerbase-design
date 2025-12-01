"use client";

import { useState } from "react";

import { Button } from "@workspace/ui/shadcn/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@workspace/ui/shadcn/card";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import { toast } from "@workspace/ui/shadcn/sonner";
import { UsersIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/AuthProvider";

export default function ClubSignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", clubName: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.clubName.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await signUp({
        name: form.name,
        email: form.email,
        role: "club_owner",
        clubName: form.clubName,
      });
      toast.success("Welcome! Your club profile is created.");
      router.push("/clubs");
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
          <UsersIcon className="text-primary size-6" />
          <div>
            <p className="text-sm font-semibold text-primary">Club Owner</p>
            <h1 className="heading-2">Create your account</h1>
          </div>
        </div>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle>Club owner sign up</CardTitle>
            <CardDescription>Set up your profile and start managing teams and registrations.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" value={form.name} onChange={handleChange("name")} placeholder="Alex Coach" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={handleChange("email")} placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clubName">Club name</Label>
                <Input id="clubName" value={form.clubName} onChange={handleChange("clubName")} placeholder="Sapphire Cheer" required />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating account..." : "Continue to club workspace"}
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
