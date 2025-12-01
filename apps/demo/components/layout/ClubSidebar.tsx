"use client";

import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/shadcn/tooltip";
import { ClipboardListIcon, Settings2Icon, UsersIcon } from "lucide-react";
import type React from "react";
import { useSidebar } from "@workspace/ui/shadcn/sidebar";

type ClubSidebarProps = {
  clubLabel: string;
  clubInitial: string;
  active: "teams" | "registrations" | "settings";
};

export function ClubSidebar({ active }: ClubSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <TooltipProvider delayDuration={120}>
      <div className="flex h-full flex-col bg-background">
        <div className="px-3 pb-3 pt-5">
          <nav className="body-text flex flex-col gap-1.5 font-medium">
            <SidebarButton
              label="Teams"
              active={active === "teams"}
              collapsed={collapsed}
              icon={UsersIcon}
              href="/clubs"
            />
            <SidebarButton
              label="Registrations"
              active={active === "registrations"}
              collapsed={collapsed}
              icon={ClipboardListIcon}
              href="/clubs/registrations"
            />
            <SidebarButton
              label="Club Settings"
              active={active === "settings"}
              collapsed={collapsed}
              icon={Settings2Icon}
              href="/clubs/settings"
            />
          </nav>
        </div>
      </div>
    </TooltipProvider>
  );
}

function SidebarButton({
  label,
  active,
  collapsed,
  icon: Icon,
  href,
}: {
  label: string;
  active: boolean;
  collapsed: boolean;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) {
  const content = (
    <div
      className={`relative flex w-full items-center gap-2 px-2 py-2 text-left transition border-b body-text ${
        collapsed ? "justify-center" : ""
      } ${
        active
          ? "border-primary text-primary"
          : "border-border text-foreground hover:text-primary"
      }`}
    >
      {collapsed && <Icon className="size-5" aria-hidden />}
      {!collapsed && <span className="flex-1 body-text">{label}</span>}
      {collapsed && <span className="sr-only">{label}</span>}
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href}>{content}</Link>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}
