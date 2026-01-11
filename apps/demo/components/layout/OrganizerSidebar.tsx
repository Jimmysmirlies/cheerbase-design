"use client";

/**
 * OrganizerSidebar
 *
 * Encapsulates the organizer left rail (collapsible with tooltips).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@workspace/ui/shadcn/button";
import { Separator } from "@workspace/ui/shadcn/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/shadcn/tooltip";
import {
  BarChart3Icon,
  ClipboardListIcon,
  HomeIcon,
  LayoutGridIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const navItems = [
  {
    href: "/organizer",
    label: "Dashboard",
    icon: <HomeIcon className="size-4" />,
  },
  {
    href: "/organizer/events",
    label: "Events",
    icon: <LayoutGridIcon className="size-4" />,
  },
  {
    href: "/organizer/registrations",
    label: "Registrations",
    icon: <ClipboardListIcon className="size-4" />,
  },
  {
    href: "/organizer/invoices",
    label: "Invoices",
    icon: <BarChart3Icon className="size-4" />,
  },
  {
    href: "/organizer/settings",
    label: "Settings",
    icon: <SettingsIcon className="size-4" />,
  },
];

export function OrganizerSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const router = useRouter();

  // Collapse automatically on smaller screens (<1024px), expand on larger.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1024px)");
    const applyState = (matches: boolean) => setCollapsed(!matches);
    applyState(media.matches);
    const listener = (event: MediaQueryListEvent) => applyState(event.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return (
    <TooltipProvider delayDuration={120}>
      <aside
        className={`sticky top-4 flex h-[calc(100vh-5rem)] flex-col border-r border-border transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-64"
        }`}
      >
        <nav className="flex flex-col gap-1 px-2 py-4 text-sm font-medium">
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground ${
                    collapsed ? "justify-center" : ""
                  }`}
                >
                  {item.icon}
                  {!collapsed && (
                    <span className="transition-opacity duration-200">
                      {item.label}
                    </span>
                  )}
                </Link>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>
        <Separator />
        <div
          className={`space-y-2 px-4 py-3 text-xs text-muted-foreground transition-opacity duration-300 ${
            collapsed ? "opacity-0" : "opacity-100"
          }`}
        >
          <p className="font-semibold text-foreground">Support</p>
          <p>
            Need help? Reach out to your CSM or email support@cheerbase.test
          </p>
        </div>
        <div className="px-3 pb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start gap-2 ${collapsed ? "justify-center" : ""}`}
                onClick={() => {
                  signOut();
                  router.push("/");
                }}
              >
                <LogOutIcon className="size-4" />
                {!collapsed && "Sign out"}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Sign out</TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
