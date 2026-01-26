"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

type NavKey = string;

// Nav item blueprint; nickname is a stable handle for cross-feature references.
type NavItem = {
  key: NavKey;
  label: string;
  icon: ReactNode;
  href?: string;
  disabled?: boolean;
  badge?: string;
  nickname?: string;
};

// Nav section blueprint; nickname identifies the section in docs or telemetry.
type NavSection = {
  label?: string;
  header?: ReactNode;
  items: NavItem[];
  nickname?: string;
};

type SidebarProps = {
  active: NavKey;
  navSections: NavSection[];
  navOffset?: number;
  children?: ReactNode;
  isOpen?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
  positionMode?: "sticky" | "static";
  /** Content to render below the first section's header (e.g., global season dropdown) */
  headerSlot?: ReactNode;
  /** Whether the sidebar is collapsed (icon-only mode) */
  isCollapsed?: boolean;
  /** Callback when collapse state changes */
  onCollapseChange?: (collapsed: boolean) => void;
};

export function Sidebar({
  active,
  navSections,
  navOffset = 72,
  children: _children,
  isOpen = true,
  isMobile = false,
  onClose,
  positionMode = "sticky",
  headerSlot,
  isCollapsed = false,
  onCollapseChange,
}: SidebarProps) {
  void _children;
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const offset = Number.isFinite(navOffset) ? Math.max(navOffset, 0) : 72;
  const offsetPx = `${offset}px`;
  const availableHeight = offset > 0 ? `calc(100vh - ${offset}px)` : "100vh";

  // Sidebar widths: collapsed 68px, expanded 280px
  const sidebarWidth = isCollapsed ? 68 : 280;

  // Mobile overlay and drawer
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        <div
          onClick={onClose}
          className={cn(
            "fixed inset-0 z-[199] bg-black/50 transition-opacity duration-300 ease-in-out",
            isOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          style={{ top: offsetPx }}
        />
        {/* Drawer - slides in from left like sheets */}
        <aside
          className={cn(
            "fixed bottom-0 left-0 z-[200] flex w-[280px] max-w-[85vw] flex-col border-r border-border bg-background/95 backdrop-blur-sm transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
          style={{ top: offsetPx, padding: "16px" }}
        >
          {/* Header slot for mobile */}
          {headerSlot && <div className="mb-5">{headerSlot}</div>}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            {navSections.map((section, index) => (
              <div
                key={section.label ?? section.nickname ?? `section-${index}`}
              >
                {section.label && (
                  <p className="mb-2 label text-muted-foreground/80">
                    {section.label}
                  </p>
                )}
                {section.items.map((item) => {
                  const isActive = active === item.key;
                  return item.href && !item.disabled ? (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3.5 body-text font-medium transition-colors",
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {item.icon}
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 label text-muted-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <div
                      key={item.key}
                      className={cn(
                        "mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3.5 body-text font-medium",
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground",
                        item.disabled && "cursor-not-allowed opacity-50",
                      )}
                    >
                      {item.icon}
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 label text-muted-foreground">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>
      </>
    );
  }

  // Desktop: Sidebar with collapse functionality
  return (
    <aside
      className={cn(
        "flex flex-col overflow-visible border-r border-border bg-background/95 backdrop-blur-sm transition-all duration-200 ease-out",
        positionMode === "sticky" ? "sticky" : "relative",
      )}
      style={{
        width: `${sidebarWidth}px`,
        top: positionMode === "sticky" ? offsetPx : undefined,
        height: availableHeight,
        padding: isCollapsed ? "16px 10px" : "16px 12px",
      }}
    >
      {/* Collapse Toggle Button */}
      {onCollapseChange && (
        <button
          type="button"
          onClick={() => onCollapseChange(!isCollapsed)}
          className="absolute z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-colors hover:bg-muted"
          style={{
            top: "50%",
            transform: "translateY(-50%)",
            right: "-16px",
          }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="size-3.5 text-muted-foreground" />
          ) : (
            <ChevronLeftIcon className="size-3.5 text-muted-foreground" />
          )}
        </button>
      )}

      {/* Season Selector / Header Slot - hidden when collapsed */}
      {!isCollapsed && headerSlot && <div className="mb-5">{headerSlot}</div>}

      {/* Navigation */}
      <nav
        className={cn(
          "flex-1",
          isCollapsed ? "overflow-visible" : "overflow-y-auto",
        )}
      >
        {navSections.map((section, index) => (
          <div
            key={section.label ?? section.nickname ?? `section-${index}`}
            className={cn(index > 0 && "mt-5")}
          >
            {/* Section label - hidden when collapsed */}
            {!isCollapsed && section.label && (
              <p className="mb-2 px-3 label text-muted-foreground/80">
                {section.label}
              </p>
            )}

            {section.items.map((item) => {
              const isActive = active === item.key;
              const isHovered = hoveredItem === item.key;

              const buttonContent = (
                <>
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="flex-1">{item.label}</span>}
                  {!isCollapsed && item.badge && (
                    <span className="rounded-full bg-muted px-2 py-0.5 label text-muted-foreground">
                      {item.badge}
                    </span>
                  )}
                </>
              );

              const buttonClasses = cn(
                "relative mb-0.5 flex w-full items-center rounded-lg body-small font-medium transition-all duration-150",
                isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                item.disabled && "cursor-not-allowed opacity-50",
              );

              const tooltip = isCollapsed && isHovered && (
                <div
                  className="pointer-events-none absolute left-full top-1/2 z-[1000] -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-3 py-2 body-small font-medium text-background shadow-lg"
                  style={{ marginLeft: "12px" }}
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 text-xs opacity-70">
                      ({item.badge})
                    </span>
                  )}
                  {/* Arrow */}
                  <div
                    className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2"
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: "6px solid transparent",
                      borderBottom: "6px solid transparent",
                      borderRight: "6px solid hsl(var(--foreground))",
                    }}
                  />
                </div>
              );

              return (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item.key)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {item.href && !item.disabled ? (
                    <Link href={item.href} className={buttonClasses}>
                      {buttonContent}
                    </Link>
                  ) : (
                    <div
                      className={buttonClasses}
                      aria-disabled={item.disabled}
                    >
                      {buttonContent}
                    </div>
                  )}
                  {tooltip}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
