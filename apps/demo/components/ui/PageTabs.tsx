"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export interface PageTab {
  id: string;
  label: string;
}

interface PageTabsProps {
  tabs: PageTab[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  /** Visual variant: 'underline' (default) or 'outline' (button style) */
  variant?: "underline" | "outline";
  /** Accent color for the active underline (CSS color value or gradient) */
  accentColor?: string;
}

export function PageTabs({
  tabs,
  value,
  onValueChange,
  className = "",
  variant = "underline",
  accentColor,
}: PageTabsProps) {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  const checkOverflow = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  // Update underline position when value changes
  useLayoutEffect(() => {
    const updateUnderline = () => {
      const container = scrollContainerRef.current;
      const activeTab = tabRefs.current.get(value);
      if (!container || !activeTab) return;

      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();

      setUnderlineStyle({
        left: tabRect.left - containerRect.left + container.scrollLeft,
        width: tabRect.width,
      });
    };

    updateUnderline();
    window.addEventListener("resize", updateUnderline);
    return () => window.removeEventListener("resize", updateUnderline);
  }, [value, tabs]);

  const scrollContainer = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 150;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const isOutline = variant === "outline";

  return (
    <div
      className={cn(
        "relative flex w-full min-w-0 max-w-full items-center overflow-hidden",
        className,
      )}
    >
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          type="button"
          onClick={() => scrollContainer("left")}
          className="absolute left-0 z-10 flex size-7 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-muted"
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="size-4 text-muted-foreground" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkOverflow}
        className={cn(
          "scrollbar-hide relative flex w-full min-w-0 max-w-full overflow-x-auto",
          isOutline ? "gap-2" : "gap-6 border-b border-border",
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tabs.map((tab) => {
          const isActive = value === tab.id;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
                else tabRefs.current.delete(tab.id);
              }}
              type="button"
              onClick={() => onValueChange(tab.id)}
              aria-pressed={isActive}
              className={cn(
                "shrink-0 text-sm font-medium transition-colors",
                isOutline
                  ? cn(
                      "rounded-md border px-3 py-1.5",
                      isActive
                        ? "border-border bg-background text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )
                  : cn(
                      "relative px-1 pb-3",
                      // Only use text-foreground class when no accentColor, otherwise use inline style
                      isActive && !accentColor
                        ? "text-foreground"
                        : !isActive
                          ? "text-muted-foreground hover:text-foreground"
                          : "",
                    ),
              )}
              style={
                !isOutline && isActive && accentColor
                  ? { color: accentColor }
                  : undefined
              }
            >
              {tab.label}
            </button>
          );
        })}
        {/* Animated underline for active tab */}
        {!isOutline && underlineStyle.width > 0 && (
          <span
            className="pointer-events-none absolute bottom-0 h-[3px] rounded-full transition-all duration-300 ease-out"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width,
              background: accentColor || "currentColor",
            }}
          />
        )}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          type="button"
          onClick={() => scrollContainer("right")}
          className="absolute right-0 z-10 flex size-7 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-muted"
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="size-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
