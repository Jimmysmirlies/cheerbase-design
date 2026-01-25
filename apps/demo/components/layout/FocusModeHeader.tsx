"use client";

import { ArrowLeftIcon, Settings2Icon } from "lucide-react";
import { Button } from "@workspace/ui/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/shadcn/tooltip";

type FocusModeHeaderProps = {
  /** Callback for back button click */
  onBack?: () => void;
  onOpenMobileSettings?: () => void;
  /** Title displayed in the center (default: "Event Editor") */
  title?: string;
};

export function FocusModeHeader({
  onBack,
  onOpenMobileSettings,
  title = "Event Editor",
}: FocusModeHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-sidebar-border bg-sidebar/80 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] w-full items-center justify-center px-6">
        {/* Back button - left aligned */}
        <div className="absolute left-6">
          {onBack ? (
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 h-10 w-10"
              onClick={onBack}
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
          ) : (
            <div className="w-10 lg:hidden" />
          )}
        </div>

        {/* Centered title */}
        <span className="heading-4">{title}</span>

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
