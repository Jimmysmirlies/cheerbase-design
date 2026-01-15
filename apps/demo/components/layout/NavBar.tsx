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
    const query = window.matchMedia("(max-width: 1023px)");
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
    <header className="sticky top-0 z-30 w-full border-b border-sidebar-border bg-sidebar/80 backdrop-blur-md">
      {/* Main row - always 68px */}
      <div className="relative mx-auto flex h-[68px] w-full items-center justify-between gap-3 px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          {showSidebarToggle && onSidebarToggle ? (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onSidebarToggle}
              aria-label={
                sidebarOpen ? "Close navigation menu" : "Open navigation menu"
              }
            >
              <MenuXToggle open={sidebarOpen} />
            </Button>
          ) : null}
          <Link href="/" className="flex items-center gap-2">
            <svg
              viewBox="0 0 240 155.71"
              className="h-10 w-auto"
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
                      // Parse colors and positions from CSS gradient string
                      // Format: "linear-gradient(160deg, #8E69D0 0%, #576AE6 50.22%, #3B9BDF 100%)"
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
              <path
                fill="url(#navbar-logo-gradient)"
                d="M0,46.07c0-20.76,12.91-27.78,23.86-27.78,6.71,0,14.05,2.07,19,9.81l-7.75,6.4c-3-4.03-6.4-6.4-10.84-6.4-7.13,0-11.98,5.58-11.98,17.46,0,10.74,3.92,17.97,13.12,17.97,4.03,0,7.64-1.24,11.88-4.34l4.65,8.26c-4.03,3.31-10.33,5.89-17.97,5.89-15.18,0-23.96-9.81-23.96-27.27ZM64.03,0v24.27c3.41-4.13,8.67-5.99,13.94-5.99,10.74,0,16.53,5.99,16.53,18.18v35.32h-12.29v-33.15c0-6.09-1.24-10.85-7.85-10.85-5.89,0-10.33,4.96-10.33,10.23v33.77h-12.29V0h12.29ZM105.95,46.89c0-15.18,8.78-28.61,25.2-28.61,10.12,0,16.42,5.17,16.42,14.36,0,15.9-17.87,18.38-29.13,18.49.52,6.4,4.13,12.81,12.91,12.81,6.09,0,10.53-2.79,13.01-4.54l3.82,8.16c-1.65,1.45-8.47,5.78-18.18,5.78-17.04,0-24.07-10.95-24.07-26.44ZM136.63,33.15c0-3.82-2.48-6.09-6.2-6.09-8.26,0-12.08,7.64-12.39,15.18,5.58.1,18.59-1.14,18.59-9.09ZM156.02,40.98c1.06-15.14,10.75-27.93,27.14-26.78,10.1.71,16.02,6.3,15.38,15.47-1.11,15.87-19.11,17.09-30.34,16.41.07,6.42,3.23,13.06,11.99,13.68,6.08.43,10.7-2.05,13.3-3.62l3.24,8.41c-1.75,1.33-8.85,5.18-18.54,4.5-17-1.19-23.24-12.6-22.16-28.06ZM187.58,29.42c.27-3.81-2.05-6.25-5.76-6.51-8.24-.58-12.59,6.78-13.42,14.28,5.56.49,18.63.16,19.18-7.77ZM208.81,19.83h10.43v6.3c2.27-5.78,7.33-7.85,12.5-7.85,3.1,0,6.3.72,8.26,1.96l-2.17,10.22c-2.07-1.03-4.65-1.86-7.33-1.86-5.58,0-9.19,4.44-9.4,10.43v32.74h-12.29V19.83ZM28.26,84.07c12.27,0,23.28,3.7,23.28,17.14,0,7.41-4.02,12.38-9.95,15.13,8.57,2.01,13.44,7.62,13.44,16.51,0,13.86-9.84,21.59-27.83,21.59H3.07v-70.37h25.18ZM36.09,103.65c0-6.77-4.44-8.36-10.37-8.36h-7.51v17.14h6.77c7.83,0,11.11-3.81,11.11-8.78ZM38.94,132.85c0-6.24-4.23-9.52-11.54-9.52h-9.2v19.47h8.68c9.1,0,12.06-4.02,12.06-9.95ZM101.15,84.07l24.66,70.37h-15.98l-5.71-17.04h-23.17l-5.61,17.04h-14.92l23.59-70.37h17.14ZM92.58,98.15h-.32l-8.57,27.94h17.67l-8.78-27.94ZM130.35,148.73l5.4-12.49c4.34,2.75,13.01,6.35,19.68,6.35,4.97,0,9.63-1.59,9.63-8.25,0-5.61-5.4-7.41-12.17-9.52-9.21-2.75-20.32-6.88-20.32-20.74s10.37-21.27,24.55-21.27c9.95,0,19.15,4.23,24.97,10.16l-7.94,10.05c-5.61-4.34-11.54-7.41-16.93-7.41-4.23,0-8.78,1.8-8.78,7.2,0,5.71,5.5,7.62,12.91,9.95,9.63,3.07,19.89,7.09,19.89,21.06s-10.48,21.9-25.93,21.9c-10.47,0-21.06-4.23-24.97-6.98ZM237.21,84.07v13.23h-28.89v14.71h24.76v13.12h-24.76v16.08h29.63v13.23h-44.76v-70.37h44.02Z"
              />
            </svg>
          </Link>
        </div>

        {/* Search */}
        <NavBarSearch
          isNarrow={isNarrow}
          mobileSearchExpanded={mobileSearchExpanded}
          setMobileSearchExpanded={setMobileSearchExpanded}
        />

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
    </header>
  );
}

// Re-export types for consumers
export type { NavBarProps } from "./nav-bar-components";
