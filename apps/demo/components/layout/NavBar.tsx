"use client";

/**
 * NavBar
 *
 * Purpose
 * - Global navigation with brand, search, and key links.
 * - Adapts links based on authentication role (public, club owner, organizer).
 *
 * Structure
 * - Sticky header with brand and search
 * - Inline nav links
 * - Auth dropdown for signed-in users; Get Started CTA for guests
 */
import { useEffect, useState } from "react";

import { Button } from "@workspace/ui/shadcn/button";

import Link from "next/link";
import { SearchIcon, XIcon } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useOrganizer } from "@/hooks/useOrganizer";
import { LayoutToggle } from "@/components/ui/LayoutToggle";
import { brandGradients, type BrandGradient } from "@/lib/gradients";

import {
  NavBarSearch,
  NavBarAuthMenu,
  MenuXToggle,
  type NavBarProps,
} from "./nav-bar-components";

export function NavBar({
  mode,
  variant,
  showNavLinks,
  showSidebarToggle,
  sidebarOpen = false,
  onSidebarToggle,
  layoutVariant,
  onLayoutChange,
  showLayoutToggle,
}: NavBarProps) {
  void mode;
  void variant;
  void showNavLinks;
  const { user } = useAuth();
  const { organizer } = useOrganizer();
  const role = user?.role ?? null;
  const [isDark, setIsDark] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);
  const [organizerGradient, setOrganizerGradient] = useState<
    string | undefined
  >(undefined);
  const [clubGradient, setClubGradient] = useState<string | undefined>(
    undefined,
  );

  // Get search components (desktop and mobile separately)
  const searchComponents = NavBarSearch({
    isNarrow,
    mobileSearchExpanded,
    setMobileSearchExpanded,
  });

  // Load organizer settings if applicable
  useEffect(() => {
    const loadGradient = () => {
      if (role === "organizer" && user?.organizerId) {
        try {
          const stored = localStorage.getItem(
            `cheerbase-organizer-settings-${user.organizerId}`,
          );
          if (stored) {
            const settings = JSON.parse(stored);
            if (settings.gradient) {
              setOrganizerGradient(settings.gradient);
              return;
            }
          }
        } catch {
          // Ignore storage errors
        }
      }
      setOrganizerGradient(undefined);
    };

    loadGradient();

    const handleSettingsChange = (event: CustomEvent<{ gradient: string }>) => {
      if (event.detail?.gradient) {
        setOrganizerGradient(event.detail.gradient);
      }
    };

    window.addEventListener(
      "organizer-settings-changed",
      handleSettingsChange as EventListener,
    );
    return () => {
      window.removeEventListener(
        "organizer-settings-changed",
        handleSettingsChange as EventListener,
      );
    };
  }, [role, user?.organizerId]);

  // Load club settings if applicable
  useEffect(() => {
    const loadGradient = () => {
      if (role === "club_owner" && user?.id) {
        try {
          const stored = localStorage.getItem(
            `cheerbase-club-settings-${user.id}`,
          );
          if (stored) {
            const settings = JSON.parse(stored);
            if (settings.gradient) {
              setClubGradient(settings.gradient);
              return;
            }
          }
        } catch {
          // Ignore storage errors
        }
      }
      setClubGradient(undefined);
    };

    loadGradient();

    const handleClubSettingsChange = (
      event: CustomEvent<{ gradient: string }>,
    ) => {
      if (event.detail?.gradient) {
        setClubGradient(event.detail.gradient);
      }
    };

    window.addEventListener(
      "club-settings-changed",
      handleClubSettingsChange as EventListener,
    );
    return () => {
      window.removeEventListener(
        "club-settings-changed",
        handleClubSettingsChange as EventListener,
      );
    };
  }, [role, user?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 767px)");
    const sync = (target: Pick<MediaQueryList, "matches">) =>
      setIsNarrow(target.matches);
    sync(query);
    const handler = (event: MediaQueryListEvent) => sync(event);
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handler);
      return () => query.removeEventListener("change", handler);
    }
    query.addListener(handler);
    return () => query.removeListener(handler);
  }, []);

  // Initialize theme state from localStorage
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("demo-theme");
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      }
    } catch {
      // localStorage is not available
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("demo-theme", next ? "dark" : "light");
    } catch {
      // ignore storage errors
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      {/* Main row - always 68px */}
      <div className="relative mx-auto flex h-[68px] w-full items-center justify-between gap-3 pr-6">
        {/* Left section with logo */}
        <div className="flex items-center">
          {/* Mobile sidebar toggle */}
          {showSidebarToggle && onSidebarToggle && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-3 lg:hidden"
              onClick={onSidebarToggle}
              aria-label={
                sidebarOpen ? "Close navigation menu" : "Open navigation menu"
              }
            >
              <MenuXToggle open={sidebarOpen} />
            </Button>
          )}
          {/* Logo - 68px container to align with collapsed sidebar icons */}
          <div className="flex w-[68px] shrink-0 items-center justify-center">
            <Link href="/">
              <svg
                viewBox="0 0 40 40"
                className="size-10"
                aria-label="Cheerbase"
              >
                <defs>
                  <linearGradient
                    id="navbar-logo-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    {(() => {
                      let gradientKey = "teal";
                      if (role === "organizer" && organizerGradient) {
                        gradientKey = organizerGradient;
                      } else if (role === "organizer" && organizer?.gradient) {
                        gradientKey = organizer.gradient;
                      } else if (role === "club_owner" && clubGradient) {
                        gradientKey = clubGradient;
                      }
                      const gradient =
                        brandGradients[gradientKey as BrandGradient];
                      if (gradient?.css) {
                        const colorMatches = gradient.css.matchAll(
                          /(#[0-9A-Fa-f]{6})\s+([\d.]+)%/g,
                        );
                        const stops = Array.from(colorMatches).map((match) => ({
                          color: match[1],
                          position: parseFloat(match[2] ?? "0"),
                        }));
                        if (stops.length > 0) {
                          return stops.map((stop) => (
                            <stop
                              key={stop.position}
                              offset={`${stop.position}%`}
                              stopColor={stop.color}
                            />
                          ));
                        }
                      }
                      return (
                        <>
                          <stop offset="0%" stopColor="#0d9488" />
                          <stop offset="100%" stopColor="#06B6D4" />
                        </>
                      );
                    })()}
                  </linearGradient>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="40"
                  height="40"
                  rx="10"
                  fill="url(#navbar-logo-gradient)"
                />
                <text
                  x="20"
                  y="26"
                  textAnchor="middle"
                  fill="white"
                  fontSize="16"
                  fontWeight="700"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  CB
                </text>
              </svg>
            </Link>
          </div>
        </div>

        {/* Desktop Search */}
        {searchComponents.DesktopSearch}

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Layout toggle for organizer section */}
          {showLayoutToggle && layoutVariant && onLayoutChange && (
            <LayoutToggle
              variants={["A", "B"]}
              value={layoutVariant}
              onChange={onLayoutChange}
              storageKey="cheerbase-organizer-layout-tutorial"
              tutorialTitle="Layout Options"
              tutorialDescription="Try different dashboard layouts to find what works best for you."
              tutorialItems={[
                { label: "A", description: "Full-width sidebar" },
                { label: "B", description: "Centered content" },
              ]}
            />
          )}

          {/* Mobile search toggle - left of avatar */}
          {isNarrow && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSearchExpanded(!mobileSearchExpanded)}
              aria-label={mobileSearchExpanded ? "Close search" : "Open search"}
            >
              {mobileSearchExpanded ? (
                <XIcon className="size-5" />
              ) : (
                <SearchIcon className="size-5" />
              )}
            </Button>
          )}

          {/* Auth Menu */}
          <NavBarAuthMenu
            isDark={isDark}
            onToggleTheme={toggleTheme}
            organizerGradient={organizerGradient}
            clubGradient={clubGradient}
            organizerDefaultGradient={organizer?.gradient}
          />
        </div>
      </div>

      {/* Mobile search - outside main row to push content down */}
      {searchComponents.MobileSearch}
    </header>
  );
}

// Re-export types for consumers
export type { NavBarProps } from "./nav-bar-components";
