"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@workspace/ui/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/shadcn/dropdown-menu";
import { Switch } from "@workspace/ui/shadcn/switch";
import {
  SunIcon,
  MoonIcon,
  UsersIcon,
  ClipboardListIcon,
  LogOutIcon,
  LayoutDashboardIcon,
  CalendarIcon,
  MenuIcon,
  LogInIcon,
  MegaphoneIcon,
  RocketIcon,
} from "lucide-react";

import { AuthSignUp } from "@/components/features/auth/AuthSignUp";
import { AuthDialog } from "@/components/features/auth/AuthDialog";
import { useAuth } from "@/components/providers/AuthProvider";
import { GradientAvatar } from "@/components/ui/GradientAvatar";

type NavBarAuthMenuProps = {
  isDark: boolean;
  onToggleTheme: () => void;
  organizerGradient?: string;
  clubGradient?: string;
  organizerDefaultGradient?: string;
};

export function NavBarAuthMenu({
  isDark,
  onToggleTheme,
  organizerGradient,
  clubGradient,
  organizerDefaultGradient,
}: NavBarAuthMenuProps) {
  const router = useRouter();
  const { user, signOut, signInAsRole } = useAuth();
  const role = user?.role ?? null;
  const [loginOpen, setLoginOpen] = useState(false);

  const menuItems =
    role == null
      ? []
      : [
          ...(role === "club_owner"
            ? [
                {
                  label: "Teams",
                  icon: UsersIcon,
                  onClick: () => router.push("/clubs"),
                },
                {
                  label: "Registrations",
                  icon: ClipboardListIcon,
                  onClick: () => router.push("/clubs/registrations"),
                },
              ]
            : [
                {
                  label: "Organizer Home",
                  icon: LayoutDashboardIcon,
                  onClick: () => router.push("/organizer"),
                },
                {
                  label: "Events",
                  icon: CalendarIcon,
                  onClick: () => router.push("/organizer/events"),
                },
              ]),
          {
            label: "Sign out",
            icon: LogOutIcon,
            onClick: () => {
              signOut();
              router.push("/");
            },
          },
        ];

  return (
    <AuthSignUp>
      {({ openStart }) => (
        <>
          {role ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-0 hover:opacity-90"
                >
                  <GradientAvatar
                    name={
                      user?.name ||
                      (role === "club_owner" ? "Club Owner" : "Organizer")
                    }
                    size="sm"
                    gradient={
                      role === "club_owner"
                        ? clubGradient
                        : organizerGradient || organizerDefaultGradient
                    }
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[280px] md:min-w-64 border border-border/70 bg-card/90 shadow-xl backdrop-blur-md p-2 data-[state=open]:animate-in data-[state=open]:fade-in-0"
              >
                <DropdownMenuLabel className="px-3 py-2 space-y-1">
                  <span className="block label text-muted-foreground">
                    Signed in as
                  </span>
                  <span className="body-text font-semibold">
                    {user?.name ?? "User"}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2" />
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    {isDark ? (
                      <MoonIcon className="size-5" />
                    ) : (
                      <SunIcon className="size-5" />
                    )}
                    <span className="body-text md:body-small">Theme</span>
                  </div>
                  <Switch checked={isDark} onCheckedChange={onToggleTheme} />
                </div>
                <DropdownMenuSeparator className="my-2" />
                {menuItems.map((item, idx) => (
                  <DropdownMenuItem
                    key={item.label}
                    onClick={item.onClick}
                    className="dropdown-fade-in flex items-center gap-3 px-3 py-2.5 body-text md:body-small cursor-pointer"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    {item.icon && (
                      <item.icon className="size-5 md:size-4 text-muted-foreground" />
                    )}
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <MenuIcon className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[240px] md:min-w-56 border border-border/70 bg-card/90 backdrop-blur-md p-2 data-[state=open]:animate-in data-[state=open]:fade-in-0"
              >
                <DropdownMenuItem
                  onClick={() => setLoginOpen(true)}
                  className="dropdown-fade-in flex items-center gap-3 px-3 py-2.5 body-text md:body-small cursor-pointer"
                  style={{ animationDelay: "0ms" }}
                >
                  <LogInIcon className="size-5 md:size-4 text-muted-foreground" />
                  Log In
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem
                  onClick={() => openStart("organizer")}
                  className="dropdown-fade-in flex items-center gap-3 px-3 py-2.5 body-text md:body-small cursor-pointer"
                  style={{ animationDelay: "40ms" }}
                >
                  <MegaphoneIcon className="size-5 md:size-4 text-muted-foreground" />
                  Host Events
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openStart("choose")}
                  className="dropdown-fade-in flex items-center gap-3 px-3 py-2.5 body-text md:body-small cursor-pointer"
                  style={{ animationDelay: "80ms" }}
                >
                  <RocketIcon className="size-5 md:size-4 text-muted-foreground" />
                  Get Started
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <AuthDialog
            open={loginOpen}
            onOpenChange={setLoginOpen}
            onDemoLogin={(nextRole) => {
              if (nextRole === "organizer") {
                signInAsRole(
                  nextRole,
                  "Sapphire Productions",
                  "contact@sapphireproductions.ca",
                  {
                    demoId: "sapphire-productions",
                    isDemo: true,
                    organizerId: "sapphire-productions",
                  },
                );
                setLoginOpen(false);
                router.push("/organizer");
              } else {
                signInAsRole(
                  nextRole,
                  "Demo Club Owner",
                  "club_owner@demo.test",
                  {
                    demoId: "club-owner-1",
                    isDemo: true,
                  },
                );
                setLoginOpen(false);
                router.push("/clubs");
              }
            }}
            onJoinClick={() => openStart("choose")}
          />
        </>
      )}
    </AuthSignUp>
  );
}
