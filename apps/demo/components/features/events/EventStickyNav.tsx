"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { cn } from "@workspace/ui/lib/utils";
import { type BrandGradient } from "@/lib/gradients";
import { useEventSection } from "./EventSectionContext";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "registration-pricing", label: "Pricing" },
  { id: "date-time", label: "Date & Time" },
  { id: "location", label: "Location" },
  { id: "gallery", label: "Gallery" },
  { id: "organizer", label: "Organizer" },
  { id: "documents", label: "Documents" },
  { id: "results", label: "Results" },
] as const;

const NAV_HEIGHT = 68; // Height of the main navbar
const STICKY_NAV_HEIGHT = 52; // Height of the sticky section nav
const SCROLL_OFFSET = NAV_HEIGHT + STICKY_NAV_HEIGHT + 20; // Extra padding for visual comfort

type EventStickyNavProps = {
  /** The organizer's brand gradient for active indicator */
  gradient?: BrandGradient;
  /** Custom sections list (optional, uses default if not provided) */
  sections?: Array<{ id: string; label: string }>;
};

export function EventStickyNav({
  gradient = "teal",
  sections = SECTIONS as unknown as Array<{ id: string; label: string }>,
}: EventStickyNavProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSectionLocal] = useState<string | null>(null);
  const { setActiveSection: setContextActiveSection, setGradient } =
    useEventSection();
  const isScrollingToSection = useRef(false);

  // Sync gradient to context on mount/change
  useEffect(() => {
    setGradient(gradient);
  }, [gradient, setGradient]);

  // Wrapper to update both local and context state
  const setActiveSection = useCallback(
    (id: string | null) => {
      setActiveSectionLocal(id);
      setContextActiveSection(id);
    },
    [setContextActiveSection],
  );
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  // Check if we should show the sticky nav based on scroll position
  const updateVisibility = useCallback(() => {
    // Show sticky nav as soon as user starts scrolling (small threshold to avoid flicker)
    setIsVisible(window.scrollY > 10);
  }, []);

  // Determine which section is currently in view
  const updateActiveSection = useCallback(() => {
    if (isScrollingToSection.current) return;

    const viewportCenter = window.innerHeight / 3; // Check against upper third of viewport

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (!section) continue;

      const element = document.getElementById(section.id);
      if (!element) continue;

      const rect = element.getBoundingClientRect();
      // Section is active if its top is above the viewport center point
      // Account for the sticky nav height
      if (rect.top <= SCROLL_OFFSET + viewportCenter) {
        setActiveSection(section.id);
        return;
      }
    }

    // Default to first section if none match
    const firstSection = sections[0];
    if (firstSection) {
      setActiveSection(firstSection.id);
    }
  }, [sections, setActiveSection]);

  // Update underline position when active section changes
  useLayoutEffect(() => {
    const updateUnderline = () => {
      const container = navContainerRef.current;
      const activeTab = activeSection
        ? tabRefs.current.get(activeSection)
        : null;
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
  }, [activeSection, sections, isVisible]);

  // Combined scroll handler
  useEffect(() => {
    const handleScroll = () => {
      updateVisibility();
      updateActiveSection();
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [updateVisibility, updateActiveSection]);

  // Scroll to section handler
  const scrollToSection = useCallback(
    (id: string) => {
      const section = document.getElementById(id);
      if (!section) return;

      // Mark that we're programmatically scrolling
      isScrollingToSection.current = true;
      setActiveSection(id);

      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      const top =
        section.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });

      // Allow scroll detection to resume after animation completes
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingToSection.current = false;
      }, 800);
    },
    [setActiveSection],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm transition-all duration-300",
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none",
      )}
      style={{ top: NAV_HEIGHT }}
    >
      <div className="mx-auto flex h-[52px] max-w-6xl items-center justify-center px-4 lg:px-8">
        <nav
          ref={navContainerRef}
          className="scrollbar-hide relative flex h-full items-center gap-6 overflow-x-auto"
        >
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(section.id, el);
                  else tabRefs.current.delete(section.id);
                }}
                type="button"
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "relative shrink-0 whitespace-nowrap px-1 body-small font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {section.label}
              </button>
            );
          })}
          {/* Animated underline for active tab */}
          {underlineStyle.width > 0 && (
            <span
              className="pointer-events-none absolute bottom-0 h-[3px] rounded-t-full bg-primary transition-all duration-300 ease-out"
              style={{
                left: underlineStyle.left,
                width: underlineStyle.width,
              }}
            />
          )}
        </nav>
      </div>
    </div>
  );
}
