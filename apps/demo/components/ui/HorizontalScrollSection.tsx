"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Button } from "@workspace/ui/shadcn/button";
import { Badge } from "@workspace/ui/shadcn/badge";
import { cn } from "@workspace/ui/lib/utils";

export type HorizontalScrollSectionProps = {
  /** Section title */
  title: string;
  /** Optional link for the title (shows arrow) */
  titleHref?: string;
  /** Card elements to display in the scroll container */
  children: React.ReactNode;
  /** Optional className for the section wrapper */
  className?: string;
  /** Show featured badge next to title */
  featured?: boolean;
};

export function HorizontalScrollSection({
  title,
  titleHref,
  children,
  className,
  featured = false,
}: HorizontalScrollSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollPosition = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [checkScrollPosition]);

  const scroll = useCallback((direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    // Scroll by approximately one viewport width minus some overlap
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      {/* Header row */}
      <div className="flex items-center gap-3">
        {titleHref ? (
          <Link
            href={titleHref}
            className="group inline-flex items-center gap-2 hover:underline"
          >
            <h2 className="heading-3">{title}</h2>
            <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <h2 className="heading-3">{title}</h2>
        )}
        {featured && (
          <Badge variant="default" className="rounded-full text-xs">
            Featured
          </Badge>
        )}
      </div>

      {/* Scroll container with side arrows */}
      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 size-10 rounded-md bg-background border border-border hidden sm:flex"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="size-5" />
          </Button>
        )}

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {children}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 size-10 rounded-md bg-background border border-border hidden sm:flex"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="size-5" />
          </Button>
        )}
      </div>
    </section>
  );
}

export type HorizontalScrollCardProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Wrapper for cards inside HorizontalScrollSection.
 * Provides consistent sizing and snap alignment.
 */
export function HorizontalScrollCard({
  children,
  className,
}: HorizontalScrollCardProps) {
  return (
    <div
      className={cn(
        // Fixed width responsive sizing
        "w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px]",
        // Prevent shrinking and enable snap
        "flex-shrink-0 snap-start",
        className,
      )}
    >
      {children}
    </div>
  );
}
