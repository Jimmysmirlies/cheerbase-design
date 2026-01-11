"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/shadcn/dialog";
import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/shadcn/card";
import { toast } from "@workspace/ui/shadcn/sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { EyeIcon, EyeOffIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/shadcn/form";
import { passwordFieldsSchema } from "@/utils/passwordSchema";

type AuthSignUpRenderProps = {
  openStart: (step?: "choose" | "club" | "organizer") => void;
};

type AuthSignUpProps = {
  children: (controls: AuthSignUpRenderProps) => React.ReactNode;
};

export function AuthSignUp({ children }: AuthSignUpProps) {
  const router = useRouter();
  const { signUp } = useAuth();

  const [startOpen, setStartOpen] = useState(false);
  const [startStep, setStartStep] = useState<"choose" | "club" | "organizer">(
    "choose",
  );
  const [orgForm, setOrgForm] = useState({
    contactName: "",
    email: "",
    companyName: "",
    website: "",
    notes: "",
  });
  const [signupSubmitting, setSignupSubmitting] = useState(false);
  const [orgSubmitting, setOrgSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const clubFormSchema = useMemo(
    () =>
      z
        .object({
          firstName: z.string().min(1, "First name is required"),
          lastName: z.string().min(1, "Last name is required"),
          email: z.string().email("Enter a valid email"),
          clubName: z.string().min(1, "Club name is required"),
        })
        .merge(passwordFieldsSchema)
        .superRefine((values, ctx) => {
          if (values.password !== values.confirmPassword) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["confirmPassword"],
              message: "Passwords do not match",
            });
          }
        }),
    [],
  );

  const clubFormMethods = useForm<z.infer<typeof clubFormSchema>>({
    resolver: zodResolver(clubFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      clubName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleClubSignup = async (values: z.infer<typeof clubFormSchema>) => {
    setSignupSubmitting(true);
    try {
      // Simulate account creation delay for realistic feel
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const fullName = `${values.firstName} ${values.lastName}`.trim();

      await signUp({
        name: fullName,
        email: values.email,
        password: values.password,
        role: "club_owner",
        clubName: values.clubName,
      });

      // Store club name for the new account
      if (typeof window !== "undefined") {
        localStorage.setItem("cheerbase-club-name", values.clubName);
      }

      toast.success(
        `Welcome, ${values.firstName}! Your account has been created.`,
      );
      setStartOpen(false);
      setStartStep("choose");
      clubFormMethods.reset();

      // Brief delay before redirect so user sees the success message
      setTimeout(() => {
        router.push("/clubs");
      }, 500);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to sign up. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSignupSubmitting(false);
    }
  };

  const handleOrganizerSignup = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (
      !orgForm.contactName.trim() ||
      !orgForm.email.trim() ||
      !orgForm.companyName.trim()
    ) {
      toast.error("Please fill in required fields.");
      return;
    }
    setOrgSubmitting(true);
    try {
      await fetch("/api/organizer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: orgForm.companyName,
          contactName: orgForm.contactName,
          email: orgForm.email,
          website: orgForm.website,
          notes: orgForm.notes,
        }),
      });
      toast.success(
        "Application submitted. We will verify your organization shortly.",
      );
      setStartOpen(false);
      setStartStep("choose");
    } catch (error) {
      console.error(error);
      toast.error("Unable to submit application. Please try again.");
    } finally {
      setOrgSubmitting(false);
    }
  };

  return (
    <>
      {children({
        openStart: (step = "choose") => {
          setStartStep(step);
          setStartOpen(true);
        },
      })}

      {/* Get Started modal (choose path + inline signup) */}
      <Dialog
        open={startOpen}
        onOpenChange={(open) => {
          setStartOpen(open);
          if (!open) setStartStep("choose");
        }}
      >
        <DialogContent className="!max-w-[800px] p-8 sm:p-8">
          {startStep === "choose" ? (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>Step 1 of 2 · Choose your path</DialogTitle>
                <DialogDescription>
                  Select your role to get started.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setStartStep("club")}
                  className="group block h-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Card className="h-full border-border/60 transition duration-200 ease-out hover:-translate-y-[2px] hover:shadow-lg hover:border-primary/40 cursor-pointer">
                    <CardHeader className="space-y-1">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <UsersIcon className="text-primary size-5" />
                        Club Owner
                      </CardTitle>
                      <CardDescription>
                        Create teams, manage rosters, and register for
                        competitions.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </button>
                <button
                  type="button"
                  onClick={() => setStartStep("organizer")}
                  className="group block h-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Card className="h-full border-border/60 transition duration-200 ease-out hover:-translate-y-[2px] hover:shadow-lg hover:border-primary/40 cursor-pointer">
                    <CardHeader className="space-y-1">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <ShieldCheckIcon className="text-primary size-5" />
                        Organizer
                      </CardTitle>
                      <CardDescription>
                        Manage events, registrations, and payouts from a
                        dedicated portal.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </button>
              </div>
            </>
          ) : startStep === "club" ? (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>Step 2 of 2 · Club organizer setup</DialogTitle>
                <DialogDescription>
                  Set up your profile and start managing teams and registrations
                  under your clubOwnerId.
                </DialogDescription>
              </DialogHeader>
              <Form {...clubFormMethods}>
                <form
                  className="space-y-4"
                  onSubmit={clubFormMethods.handleSubmit(handleClubSignup)}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={clubFormMethods.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="Alex"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={clubFormMethods.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="Coach"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={clubFormMethods.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            type="email"
                            placeholder="you@example.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={clubFormMethods.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <EyeOffIcon className="size-4" />
                              ) : (
                                <EyeIcon className="size-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <p className="text-muted-foreground text-xs">
                          At least 8 characters, with upper, lower, number, and
                          special (!@#$%^&*).
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={clubFormMethods.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Re-enter password"
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              tabIndex={-1}
                            >
                              {showConfirmPassword ? (
                                <EyeOffIcon className="size-4" />
                              ) : (
                                <EyeIcon className="size-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={clubFormMethods.control}
                    name="clubName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Club name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Sapphire Cheer"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStartStep("choose")}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        signupSubmitting || !clubFormMethods.formState.isValid
                      }
                    >
                      {signupSubmitting
                        ? "Creating account..."
                        : "Create Account"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </>
          ) : (
            <>
              <DialogHeader className="text-left">
                <DialogTitle>Step 2 of 2 · Organizer application</DialogTitle>
                <DialogDescription>
                  Event organizers require manual verification. Share your
                  details and we’ll review and set up your organizer
                  environment.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleOrganizerSignup}>
                <div className="space-y-2">
                  <Label htmlFor="org-name">Contact name</Label>
                  <Input
                    id="org-name"
                    value={orgForm.contactName}
                    onChange={(event) =>
                      setOrgForm((prev) => ({
                        ...prev,
                        contactName: event.target.value,
                      }))
                    }
                    placeholder="Jordan Director"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-email">Email</Label>
                  <Input
                    id="org-email"
                    type="email"
                    value={orgForm.email}
                    onChange={(event) =>
                      setOrgForm((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-orgname">Organization</Label>
                  <Input
                    id="org-orgname"
                    value={orgForm.companyName}
                    onChange={(event) =>
                      setOrgForm((prev) => ({
                        ...prev,
                        companyName: event.target.value,
                      }))
                    }
                    placeholder="Summit Events Co."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-website">Website</Label>
                  <Input
                    id="org-website"
                    value={orgForm.website}
                    onChange={(event) =>
                      setOrgForm((prev) => ({
                        ...prev,
                        website: event.target.value,
                      }))
                    }
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-notes">Notes</Label>
                  <Input
                    id="org-notes"
                    value={orgForm.notes}
                    onChange={(event) =>
                      setOrgForm((prev) => ({
                        ...prev,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Events you run, expected dates, locations..."
                  />
                </div>
                <DialogFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStartStep("choose")}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={orgSubmitting}>
                    {orgSubmitting ? "Submitting..." : "Submit application"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
