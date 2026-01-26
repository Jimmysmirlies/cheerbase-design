"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@workspace/ui/shadcn/button";

type RegistrationFocusHeaderProps = {
  /** Centered title displayed in the header */
  title: string;
  /** URL for back navigation */
  backHref: string;
  /** Optional custom back handler (overrides backHref navigation) */
  onBack?: () => void;
};

/**
 * A clean, minimal header for focused registration flows.
 * Provides a distraction-free experience similar to Airbnb checkout.
 *
 * Features:
 * - Back button (left) for navigation
 * - Centered title
 * - Sticky with backdrop blur
 * - 68px height (consistent with FocusModeHeader)
 */
export function RegistrationFocusHeader({
  title,
  backHref,
  onBack,
}: RegistrationFocusHeaderProps) {
  const BackButton = onBack ? (
    <Button
      variant="ghost"
      size="icon"
      className="-ml-2 h-10 w-10"
      onClick={onBack}
    >
      <ArrowLeftIcon className="size-4" />
    </Button>
  ) : (
    <Button variant="ghost" size="icon" className="-ml-2 h-10 w-10" asChild>
      <Link href={backHref}>
        <ArrowLeftIcon className="size-4" />
      </Link>
    </Button>
  );

  return (
    <header className="sticky top-0 z-30 w-full border-b border-sidebar-border bg-sidebar/80 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] w-full items-center justify-center px-6">
        {/* Back button - left aligned */}
        <div className="absolute left-6">{BackButton}</div>

        {/* Centered title */}
        <span className="heading-3">{title}</span>
      </div>
    </header>
  );
}
