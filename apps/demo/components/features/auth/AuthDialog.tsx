"use client";
/**
 * AuthDialog
 *
 * Purpose
 * - Accessible, shadcn-based authentication dialog for logging in.
 * - Provides a quick way to demo roles via Google sign-in flow.
 * - "Join Cheerbase" opens the Get Started modal (AuthSignUp).
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/shadcn/dialog";
import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import { Label } from "@workspace/ui/shadcn/label";
import { toast } from "@workspace/ui/shadcn/sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";
import { ShieldCheckIcon, UsersIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@workspace/ui/shadcn/card";

export type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDemoLogin: (role: "club_owner" | "organizer") => void;
  onJoinClick?: () => void;
};

export function AuthDialog({ open, onOpenChange, onDemoLogin, onJoinClick }: AuthDialogProps) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const closeDialog = () => {
    onOpenChange(false);
    // Reset form state when closing
    setEmail("");
    setPassword("");
    setErrors({});
    setShowRoleSelection(false);
  };

  const clearErrors = () => setErrors({});

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    // Validate fields
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await signIn({ email, password });
      
      if (result.success) {
        toast.success("Welcome back!");
        closeDialog();
        // Redirect to clubs page after successful login
        setTimeout(() => {
          router.push("/clubs");
        }, 300);
      } else {
        // Show inline error based on the error type
        if (result.error?.toLowerCase().includes("email") || result.error?.toLowerCase().includes("account")) {
          setErrors({ email: result.error });
        } else if (result.error?.toLowerCase().includes("password")) {
          setErrors({ password: result.error });
        } else {
          setErrors({ password: result.error || "Login failed" });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClick = () => {
    closeDialog();
    onJoinClick?.();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : closeDialog())}>
      <DialogContent className="rounded-md p-8">
        <div className="space-y-8">
          <DialogHeader className="space-y-3 text-center">
            <span
              className="mx-auto heading-2 bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(160deg, #0D9488 0%, #0891B2 50.22%, #06B6D4 100%)",
              }}
            >
              cheerbase
            </span>
            <DialogTitle className="heading-2 text-center">Welcome back 👋</DialogTitle>
          </DialogHeader>

          <form className="grid gap-6" onSubmit={handleLogin}>
            {/* Section 1: Input fields */}
            <div className="grid gap-4">
              <div className="grid gap-1 text-left">
                <Label className={`${errors.email ? "text-destructive" : "text-muted-foreground"}`}>
                  Email Address
                </Label>
                <Input 
                  placeholder="you@example.com" 
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>
              <div className="grid gap-1 text-left">
                <Label className={`${errors.password ? "text-destructive" : "text-muted-foreground"}`}>
                  Password
                </Label>
                <Input 
                  placeholder="Enter your password" 
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                  className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Section 2: Log in button */}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>

            {/* Section 3: Links */}
            <div className="flex flex-col items-center gap-4">
              <Button variant="link" className="justify-center" type="button">
                Forgot password?
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                No account yet?{" "}
                <button className="font-semibold text-primary underline-offset-4 hover:underline" onClick={handleJoinClick} type="button">
                  Join Cheerbase
                </button>
              </p>
            </div>
          </form>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            Or continue with
            <span className="h-px flex-1 bg-border" />
          </div>

          <GoogleSignInButton onClick={() => setShowRoleSelection(true)} />
        </div>
      </DialogContent>

      {/* Role Selection Modal */}
      <Dialog open={showRoleSelection} onOpenChange={setShowRoleSelection}>
        <DialogContent className="!max-w-[800px] p-8 sm:p-8">
          <DialogHeader className="text-left">
            <DialogTitle>Choose your account</DialogTitle>
            <DialogDescription>
              Select which account type you want to sign in as.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setShowRoleSelection(false);
                onDemoLogin("club_owner");
              }}
              className="group block h-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card className="h-full border-border/60 transition duration-200 ease-out hover:-translate-y-[2px] hover:shadow-lg hover:border-primary/40 cursor-pointer">
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UsersIcon className="text-primary size-5" />
                    Club Owner
                  </CardTitle>
                  <CardDescription>Manage teams, rosters, and register for competitions.</CardDescription>
                </CardHeader>
              </Card>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRoleSelection(false);
                onDemoLogin("organizer");
              }}
              className="group block h-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card className="h-full border-border/60 transition duration-200 ease-out hover:-translate-y-[2px] hover:shadow-lg hover:border-primary/40 cursor-pointer">
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheckIcon className="text-primary size-5" />
                    Organizer
                  </CardTitle>
                  <CardDescription>Manage events, registrations, and payouts from a dedicated portal.</CardDescription>
                </CardHeader>
              </Card>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
