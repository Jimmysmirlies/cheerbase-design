"use client";
/**
 * AuthDialog
 *
 * Purpose
 * - Accessible, shadcn-based authentication dialog for log in and sign up flows.
 * - Provides a quick way to demo roles via one-click buttons.
 *
 * Structure
 * - Controlled Dialog wrapper (open, onOpenChange from parent)
 * - Internal step state:
 *   - EntryStep: email/password login + Google + demo role buttons
 *   - SignupCredentialsStep: account creation fields
 *   - SignupRoleStep: choose role
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/shadcn/dialog";
import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";

type ModalStep = "entry" | "signupCredentials" | "signupRole";

export type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDemoLogin: (role: "club_owner" | "organizer") => void;
};

export function AuthDialog({ open, onOpenChange, onDemoLogin }: AuthDialogProps) {
  const [step, setStep] = useState<ModalStep>("entry");

  const goTo = (next: ModalStep) => setStep(next);

  const closeAndReset = () => {
    onOpenChange(false);
    setStep("entry");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : closeAndReset())}>
      <DialogContent className="rounded-3xl p-8">
        {step === "entry" ? <EntryStep onJoin={() => goTo("signupCredentials")} onDemoLogin={onDemoLogin} /> : null}
        {step === "signupCredentials" ? (
          <SignupCredentialsStep onBack={() => goTo("entry")} onContinue={() => goTo("signupRole")} />
        ) : null}
        {step === "signupRole" ? <SignupRoleStep onBack={() => goTo("signupCredentials")} onFinish={closeAndReset} /> : null}
      </DialogContent>
    </Dialog>
  );
}

// — Steps —

type EntryStepProps = {
  onJoin: () => void;
  onDemoLogin: (role: "club_owner" | "organizer") => void;
};

function EntryStep({ onJoin, onDemoLogin }: EntryStepProps) {
  return (
    <div className="space-y-8">
      <DialogHeader className="space-y-3 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          R
        </span>
        <div className="space-y-1">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-center">Log in to your account</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-center">
            Enter your details to access your club, teams, and registrations.
          </DialogDescription>
        </div>
      </DialogHeader>

      <form className="grid gap-4">
        <div className="grid gap-1 text-left">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Email Address</Label>
          <Input placeholder="you@example.com" type="email" />
        </div>
        <div className="grid gap-1 text-left">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Password</Label>
          <Input placeholder="Enter your password" type="password" />
          <Button variant="link" className="px-0 text-xs" type="button">
            Forgot password?
          </Button>
        </div>
        <Button type="button">Log in</Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        No account yet?{" "}
        <button className="font-semibold text-primary underline-offset-4 hover:underline" onClick={onJoin} type="button">
          Join Ralli
        </button>
      </p>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        Or continue with
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" className="w-full justify-center" type="button">
        <span role="img" aria-hidden>
          🔍
        </span>
        <span className="ml-2">Sign in with Google</span>
      </Button>

      {/* Demo shortcuts */}
      <div className="grid gap-2">
        <Button className="w-full justify-center" type="button" onClick={() => onDemoLogin("club_owner")}>
          Log In as Club Owner
        </Button>
        <Button variant="secondary" className="w-full justify-center" type="button" onClick={() => onDemoLogin("organizer")}>
          Log In as Event Organizer
        </Button>
      </div>
    </div>
  );
}

type SignupCredentialsStepProps = {
  onBack: () => void;
  onContinue: () => void;
};

function SignupCredentialsStep({ onBack, onContinue }: SignupCredentialsStepProps) {
  return (
    <div className="space-y-6">
      <DialogHeader className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 1 of 2</p>
        <DialogTitle className="text-2xl font-semibold tracking-tight">Create your account</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">Use your email or continue with Google from the previous step.</DialogDescription>
      </DialogHeader>
      <form className="grid gap-4">
        <div className="grid gap-1">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Email</Label>
          <Input placeholder="you@example.com" type="email" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Password</Label>
          <Input placeholder="Create a password" type="password" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">Confirm password</Label>
          <Input placeholder="Confirm password" type="password" />
        </div>
      </form>

      <ul className="grid gap-1 rounded-2xl border border-dashed border-border/60 bg-muted/50 p-4 text-xs text-muted-foreground">
        <li>• Minimum of 8 characters</li>
        <li>• At least 1 uppercase & 1 lowercase letter</li>
        <li>• Include 1 number and 1 special character</li>
      </ul>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={onBack} type="button">
          ← Back
        </Button>
        <Button onClick={onContinue} type="button">
          Continue
        </Button>
      </div>
    </div>
  );
}

type SignupRoleStepProps = {
  onBack: () => void;
  onFinish: () => void;
};

function SignupRoleStep({ onBack, onFinish }: SignupRoleStepProps) {
  return (
    <div className="space-y-6">
      <DialogHeader className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step 2 of 2</p>
        <DialogTitle className="text-2xl font-semibold tracking-tight">Choose your role</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">Roles unlock tailored dashboards and permissions inside Ralli.</DialogDescription>
      </DialogHeader>

      <div className="grid gap-2 text-sm">
        <RoleOption
          description="Manage club profile, teams, and event registrations."
          label="Club Owner"
          name="signup-role"
          value="club_owner"
        />
        <RoleOption
          description="Stay close to schedules, payments, and updates for your athlete."
          label="Parent"
          name="signup-role"
          value="parent"
        />
        <RoleOption
          description="Track your events, rosters, and performance highlights."
          label="Athlete"
          name="signup-role"
          value="athlete"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={onBack} type="button">
          ← Back
        </Button>
        <Button onClick={onFinish} type="button">
          Finish setup
        </Button>
      </div>

      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/40 p-4 text-xs text-muted-foreground">
        Club owners get instant access to the Club Portal to manage rosters, payments, and registrations. Other roles land on tailored
        dashboards with the right visibility.
      </div>
    </div>
  );
}

type RoleOptionProps = {
  label: string;
  description: string;
  value: string;
  name: string;
};

function RoleOption({ label, description, value, name }: RoleOptionProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition hover:border-primary">
      <input className="mt-1 h-4 w-4" name={name} type="radio" value={value} />
      <span>
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}

