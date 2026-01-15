"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3Icon,
  ClipboardListIcon,
  HomeIcon,
  LayoutGridIcon,
  SettingsIcon,
} from "lucide-react";

import { ScrollArea } from "@workspace/ui/shadcn/scroll-area";

import { Sidebar } from "@/components/layout/Sidebar";
import { NavBar } from "@/components/layout/NavBar";
import { FocusModeLayout } from "@/components/layout/FocusModeLayout";
import { useAuth } from "@/components/providers/AuthProvider";
import { LayoutProvider } from "@/components/providers/LayoutProvider";
import { SeasonProvider } from "@/components/providers/SeasonProvider";

/**
 * Check if the current route should use focus mode (no sidebar/navbar).
 * Matches: /organizer/events/new, /organizer/events/[eventId]/edit, /organizer/settings/subscription
 */
function isFocusModeRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  // Match /organizer/events/new
  if (pathname === "/organizer/events/new") return true;
  // Match /organizer/events/[eventId]/edit
  if (/^\/organizer\/events\/[^/]+\/edit$/.test(pathname)) return true;
  // Match /organizer/settings/subscription
  if (pathname === "/organizer/settings/subscription") return true;
  return false;
}

const navItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <HomeIcon className="size-4" />,
    href: "/organizer",
  },
  {
    key: "events",
    label: "Events",
    icon: <LayoutGridIcon className="size-4" />,
    href: "/organizer/events",
  },
  {
    key: "registrations",
    label: "Registrations",
    icon: <ClipboardListIcon className="size-4" />,
    disabled: true,
    badge: "Coming soon",
  },
  {
    key: "invoices",
    label: "Invoices",
    icon: <BarChart3Icon className="size-4" />,
    href: "/organizer/invoices",
  },
  {
    key: "settings",
    label: "Settings",
    icon: <SettingsIcon className="size-4" />,
    href: "/organizer/settings",
  },
];

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  return (
    <SeasonProvider>
      <OrganizerLayoutInner>{children}</OrganizerLayoutInner>
    </SeasonProvider>
  );
}

function OrganizerLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const navWrapperRef = useRef<HTMLDivElement | null>(null);
  const [navHeight, setNavHeight] = useState(72);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user, status } = useAuth();

  // Check if we're on a focus mode route (no sidebar/navbar)
  const isFocusMode = isFocusModeRoute(pathname);

  const organizerNavSections = useMemo(
    () => [
      {
        nickname: "organizer-main",
        items: navItems,
      },
    ],
    [],
  );

  const active = useMemo(() => {
    if (!pathname) return "dashboard";
    if (pathname.includes("/events")) return "events";
    if (pathname.includes("/registrations")) return "registrations";
    if (pathname.includes("/invoices")) return "invoices";
    if (pathname.includes("/settings")) return "settings";
    return "dashboard";
  }, [pathname]);

  useEffect(() => {
    if (status === "loading") return;
    if (!user || user.role !== "organizer") {
      router.replace("/");
    }
  }, [user, status, router]);

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

  // Focus mode pages (no sidebar/navbar, custom header)
  if (isFocusMode) {
    return (
      <FocusModeLayout>
        {status === "loading" ? null : children}
      </FocusModeLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div ref={navWrapperRef} className="sticky top-0 z-40">
        <NavBar
          variant="organizer"
          showSidebarToggle={isMobile}
          sidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)}
        />
      </div>
      <div className="flex w-full overflow-visible">
        <Sidebar
          active={active}
          navSections={organizerNavSections}
          navOffset={navHeight}
          isOpen={isSidebarOpen}
          isMobile={isMobile}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onCollapseChange={setIsSidebarCollapsed}
        />
        <ScrollArea
          className="flex-1"
          style={{ height: `calc(100vh - ${navHeight}px)` }}
        >
          <main className="p-8">
            <LayoutProvider layout="A">
              {status === "loading" ? null : children}
            </LayoutProvider>
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
