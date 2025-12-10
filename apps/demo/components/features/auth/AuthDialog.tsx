"use client";
/**
 * AuthDialog
 *
 * Purpose
 * - Accessible, shadcn-based authentication dialog for logging in.
 * - Provides a quick way to demo roles via one-click buttons.
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

  const closeDialog = () => {
    onOpenChange(false);
    // Reset form state when closing
    setEmail("");
    setPassword("");
    setErrors({});
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
      <DialogContent className="rounded-3xl p-8">
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

          <form className="grid gap-4" onSubmit={handleLogin}>
            <div className="grid gap-1 text-left">
              <Label className={`text-xs uppercase tracking-wide ${errors.email ? "text-destructive" : "text-muted-foreground"}`}>
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
              <Label className={`text-xs uppercase tracking-wide ${errors.password ? "text-destructive" : "text-muted-foreground"}`}>
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
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password}</p>
              ) : (
                <Button variant="link" className="px-0 text-xs justify-start" type="button">
                  Forgot password?
                </Button>
              )}
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            No account yet?{" "}
            <button className="font-semibold text-primary underline-offset-4 hover:underline" onClick={handleJoinClick} type="button">
              Join Cheerbase
            </button>
          </p>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            Or continue with
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-2">
            <GoogleSignInButton />
            <Button variant="outline" className="w-full justify-center" type="button" onClick={() => onDemoLogin("club_owner")}>
              Log In as Club Owner
            </Button>
            <Button variant="outline" className="w-full justify-center" type="button" onClick={() => onDemoLogin("organizer")}>
              Log In as Event Organizer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
