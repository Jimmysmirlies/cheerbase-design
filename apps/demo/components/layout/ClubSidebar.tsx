"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { ClipboardListIcon, Settings2Icon, UsersIcon, UserIcon, InfoIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/shadcn/tooltip";

type ClubSidebarProps = {
  clubLabel: string;
  clubInitial?: string;
  ownerName?: string;
  active: "teams" | "registrations" | "settings";
};

export function ClubSidebar({ active, clubLabel, clubInitial, ownerName }: ClubSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const targetWidth = useMemo(() => (collapsed ? "w-[72px]" : "w-72"), [collapsed]);
  void clubLabel;
  void clubInitial;
  void ownerName;

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
        className={`sticky top-[64px] flex h-[calc(100vh-64px)] flex-col border-r border-border bg-background transition-all duration-200 ${targetWidth}`}
      >
        <nav className="flex flex-1 flex-col gap-1 p-6">
          <SidebarNavItem
            label="Teams"
            active={active === "teams"}
            collapsed={collapsed}
            icon={UsersIcon}
            href="/clubs"
          />
          <SidebarNavItem
            label="Athletes"
            active={false}
            collapsed={collapsed}
            icon={UserIcon}
            disabled
            badge="Coming soon"
          />
          <SidebarNavItem
            label="Registrations"
            active={active === "registrations"}
            collapsed={collapsed}
            icon={ClipboardListIcon}
            href="/clubs/registrations"
          />
          <SidebarNavItem
            label="Club Settings"
            active={active === "settings"}
            collapsed={collapsed}
            icon={Settings2Icon}
            href="/clubs/settings"
          />
        </nav>
        <div className="mt-auto border-t border-border px-4 py-4 text-muted-foreground">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center text-muted-foreground">
                  <InfoIcon className="size-5" aria-hidden />
                  <span className="sr-only">Club workspace notice</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[220px] body-text">
                Club Management is mid-refresh while we align styles. Some tweaks may temporarily nudge marketing layouts—thanks
                for your patience.
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="space-y-1">
              <p className="body-text font-semibold text-foreground">Club workspace update</p>
              <p className="body-text">
                We&apos;re refreshing this area to match our new styling. Expect occasional layout quirks that may also touch marketing
                pages while the work is in progress.
              </p>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

function SidebarNavItem({
  label,
  active,
  collapsed,
  icon: Icon,
  href,
  disabled = false,
  badge,
}: {
  label: string;
  active: boolean;
  collapsed: boolean;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  disabled?: boolean;
  badge?: string;
}) {
  const badgeContent = badge ? (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {badge}
    </span>
  ) : null;

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {href && !disabled ? (
            <Link
              href={href}
              className="flex h-10 w-full items-center justify-center rounded-none border-b border-border transition"
            >
              <Icon className="size-5" aria-hidden />
              <span className="sr-only">{label}</span>
            </Link>
          ) : (
            <div className="flex h-10 w-full items-center justify-center rounded-none border-b border-border text-muted-foreground">
              <Icon className="size-5" aria-hidden />
              <span className="sr-only">{label}</span>
            </div>
          )}
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="flex flex-col gap-1">
            <span>{label}</span>
            {badgeContent}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  const baseClasses = `flex h-10 w-full items-center justify-between rounded-none border-b transition ${
    disabled
      ? "cursor-not-allowed border-border text-muted-foreground"
      : active
        ? "border-primary text-primary"
        : "border-border text-foreground hover:text-primary"
  }`;

  const inner = (
    <div className={baseClasses}>
      <span className="body-text">{label}</span>
      {badgeContent}
    </div>
  );

  if (disabled || !href) {
    return inner;
  }

  return (
    <Link href={href} className={baseClasses}>
      <span className="body-text">{label}</span>
      {badgeContent}
    </Link>
  );
}
