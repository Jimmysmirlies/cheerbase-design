"use client";

import Link from "next/link";
import { ArrowLeftIcon, Settings2Icon } from "lucide-react";
import { Button } from "@workspace/ui/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/shadcn/tooltip";
import { brandGradients } from "@/lib/gradients";
import { useOrganizer } from "@/hooks/useOrganizer";

type FocusModeHeaderProps = {
  backHref?: string;
  /** Callback for back button click - if provided, intercepts navigation */
  onBack?: () => void;
  onOpenMobileSettings?: () => void;
  /** Title displayed after the divider (default: "Event Editor") */
  title?: string;
};

export function FocusModeHeader({
  backHref,
  onBack,
  onOpenMobileSettings,
  title = "Event Editor",
}: FocusModeHeaderProps) {
  const { organizer } = useOrganizer();
  const gradientCss = organizer?.gradient
    ? brandGradients[organizer.gradient]?.css
    : brandGradients.teal.css;

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
          ) : backHref ? (
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 h-10 w-10"
              asChild
            >
              <Link href={backHref}>
                <ArrowLeftIcon className="size-4" />
              </Link>
            </Button>
          ) : (
            <div className="w-10 lg:hidden" />
          )}
        </div>

        {/* Centered logo with divider and title */}
        <div className="flex items-center gap-4">
          <Link href="/organizer/events" className="flex items-center">
            <div
              className="h-10 w-[123px]"
              style={{
                backgroundImage: gradientCss,
                WebkitMaskImage: "url(/logo/cheerbase-logo.svg)",
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskImage: "url(/logo/cheerbase-logo.svg)",
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
              }}
              aria-label="cheerbase"
            />
          </Link>
          <div className="h-6 w-px bg-border" />
          <span className="heading-4">{title}</span>
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
