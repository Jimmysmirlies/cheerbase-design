"use client";

import Link from "next/link";
import { Settings2Icon } from "lucide-react";
import { Button } from "@workspace/ui/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/shadcn/tooltip";
import { brandGradients } from "@/lib/gradients";
import { useOrganizer } from "@/hooks/useOrganizer";

type FocusModeHeaderProps = {
  onOpenMobileSettings?: () => void;
};

export function FocusModeHeader({ onOpenMobileSettings }: FocusModeHeaderProps) {
  const { organizer } = useOrganizer();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-sidebar-border bg-sidebar/80 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] w-full items-center justify-center px-6">
        {/* Spacer for centering on mobile */}
        <div className="absolute left-6 w-10 lg:hidden" />

        {/* Centered logo with divider and title */}
        <div className="flex items-center gap-4">
          <Link href="/organizer/events" className="flex items-center">
            <span
              className="heading-3 bg-clip-text text-transparent"
              style={{
                backgroundImage: organizer?.gradient
                  ? brandGradients[organizer.gradient]?.css
                  : brandGradients.teal.css,
              }}
            >
              cheerbase
            </span>
          </Link>
          <div className="h-6 w-px bg-border" />
          <span className="heading-4">Event Editor</span>
        </div>

        {/* Mobile settings button - only visible below lg */}
        {onOpenMobileSettings && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 h-10 w-10 lg:hidden"
                onClick={onOpenMobileSettings}
              >
                <Settings2Icon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Settings</TooltipContent>
          </Tooltip>
        )}
      </div>
    </header>
  );
}
