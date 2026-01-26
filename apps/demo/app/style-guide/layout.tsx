"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  BracesIcon,
  MousePointerClickIcon,
  PaletteIcon,
  PuzzleIcon,
  ScanIcon,
  TypeIcon,
  BoxIcon,
  CalendarIcon,
  UsersIcon,
  FilterIcon,
  LayoutGridIcon,
  ListIcon,
  BellIcon,
  PlusSquareIcon,
  SquareIcon,
  ZapIcon,
} from "lucide-react";

import { ScrollArea } from "@workspace/ui/shadcn/scroll-area";

import { Sidebar } from "@/components/layout/Sidebar";
import { NavBar } from "@/components/layout/NavBar";

const guideNavSections = [
  {
    label: "Style Guide",
    nickname: "style-guide-shell",
    items: [
      {
        key: "overview",
        label: "Overview",
        icon: <BookOpenIcon className="size-4" />,
        href: "/style-guide",
        nickname: "guide-overview",
      },
      {
        key: "colors",
        label: "Color Roles",
        icon: <PaletteIcon className="size-4" />,
        href: "/style-guide/colors",
        nickname: "guide-colors",
      },
      {
        key: "typography",
        label: "Typography",
        icon: <TypeIcon className="size-4" />,
        href: "/style-guide/typography",
        nickname: "guide-typography",
      },
      {
        key: "spacing",
        label: "Spacing & Radii",
        icon: <ScanIcon className="size-4" />,
        href: "/style-guide/spacing",
        nickname: "guide-spacing",
      },
      {
        key: "buttons",
        label: "Button Patterns",
        icon: <MousePointerClickIcon className="size-4" />,
        href: "/style-guide/buttons",
        nickname: "guide-buttons",
      },
      {
        key: "api-contracts",
        label: "API Contracts",
        icon: <BracesIcon className="size-4" />,
        href: "/style-guide/api-contracts",
        nickname: "guide-api-contracts",
      },
    ],
  },
  {
    label: "Components",
    nickname: "components-shell",
    items: [
      {
        key: "components",
        label: "Overview",
        icon: <PuzzleIcon className="size-4" />,
        href: "/style-guide/components",
        nickname: "guide-components",
      },
      {
        key: "empty-state-button",
        label: "Empty State Button",
        icon: <PlusSquareIcon className="size-4" />,
        href: "/style-guide/components/empty-state-button",
        nickname: "guide-empty-state-button",
      },
      {
        key: "event-card",
        label: "Event Card",
        icon: <CalendarIcon className="size-4" />,
        href: "/style-guide/components/event-card",
        nickname: "guide-event-card",
      },
      {
        key: "event-categories-section",
        label: "Event Categories",
        icon: <ListIcon className="size-4" />,
        href: "/style-guide/components/event-categories-section",
        nickname: "guide-event-categories-section",
      },
      {
        key: "hero",
        label: "Hero",
        icon: <BoxIcon className="size-4" />,
        href: "/style-guide/components/hero",
        nickname: "guide-hero",
      },
      {
        key: "icon-box",
        label: "Icon Box",
        icon: <SquareIcon className="size-4" />,
        href: "/style-guide/components/icon-box",
        nickname: "guide-icon-box",
      },
      {
        key: "organizer-card",
        label: "Organizer Card",
        icon: <UsersIcon className="size-4" />,
        href: "/style-guide/components/organizer-card",
        nickname: "guide-organizer-card",
      },
      {
        key: "organizers-section",
        label: "Organizers Section",
        icon: <LayoutGridIcon className="size-4" />,
        href: "/style-guide/components/organizers-section",
        nickname: "guide-organizers-section",
      },
      {
        key: "quick-action-card",
        label: "Quick Action Card",
        icon: <ZapIcon className="size-4" />,
        href: "/style-guide/components/quick-action-card",
        nickname: "guide-quick-action-card",
      },
      {
        key: "quick-filter-rail",
        label: "Quick Filter Rail",
        icon: <FilterIcon className="size-4" />,
        href: "/style-guide/components/quick-filter-rail",
        nickname: "guide-quick-filter-rail",
      },
      {
        key: "registration-notice-bar",
        label: "Registration Notice Bar",
        icon: <BellIcon className="size-4" />,
        href: "/style-guide/components/registration-notice-bar",
        nickname: "guide-registration-notice-bar",
      },
    ],
  },
];

export default function StyleGuideLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const navWrapperRef = useRef<HTMLDivElement | null>(null);
  const [navHeight, setNavHeight] = useState(72);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const active = useMemo(() => {
    if (!pathname) return "overview";
    if (pathname.includes("/colors")) return "colors";
    if (pathname.includes("/typography")) return "typography";
    if (pathname.includes("/spacing")) return "spacing";
    if (pathname.includes("/buttons")) return "buttons";
    if (pathname.includes("/api-contracts")) return "api-contracts";
    if (pathname === "/style-guide/components/hero") return "hero";
    if (pathname === "/style-guide/components/icon-box") return "icon-box";
    if (pathname === "/style-guide/components/event-card") return "event-card";
    if (pathname === "/style-guide/components/organizer-card")
      return "organizer-card";
    if (pathname === "/style-guide/components/quick-action-card")
      return "quick-action-card";
    if (pathname === "/style-guide/components/quick-filter-rail")
      return "quick-filter-rail";
    if (pathname === "/style-guide/components/registration-notice-bar")
      return "registration-notice-bar";
    if (pathname === "/style-guide/components/organizers-section")
      return "organizers-section";
    if (pathname === "/style-guide/components/event-categories-section")
      return "event-categories-section";
    if (pathname === "/style-guide/components/empty-state-button")
      return "empty-state-button";
    if (pathname === "/style-guide/components") return "components";
    return "overview";
  }, [pathname]);

  useEffect(() => {
    const element = navWrapperRef.current;
    if (!element) return;

    const updateHeight = () => {
      const next = element.getBoundingClientRect().height;
      if (!next) return;
      setNavHeight(next);
    };

    updateHeight();

    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      const observer = new window.ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const next = entry.contentRect.height;
        if (next) {
          setNavHeight(next);
        }
      });
      observer.observe(element);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const syncFromQuery = (target: Pick<MediaQueryList, "matches">) => {
      setIsMobile(target.matches);
      setIsSidebarOpen(target.matches ? false : true);
    };

    syncFromQuery(mediaQuery);
    const handler = (event: MediaQueryListEvent) => syncFromQuery(event);
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }

    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div ref={navWrapperRef} className="fixed inset-x-0 top-0 z-40">
        <NavBar
          showSidebarToggle={isMobile}
          sidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
      </div>
      <div className="flex" style={{ paddingTop: `${navHeight}px` }}>
        <Sidebar
          active={active}
          navSections={guideNavSections}
          navOffset={navHeight}
          isOpen={isSidebarOpen}
          isMobile={isMobile}
          onClose={() => setIsSidebarOpen(false)}
        />
        <ScrollArea
          className="flex-1"
          style={{ height: `calc(100vh - ${navHeight}px)` }}
        >
          <main>{children}</main>
        </ScrollArea>
      </div>
    </div>
  );
}
