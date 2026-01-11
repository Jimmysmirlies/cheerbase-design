"use client";

import type { ReactNode } from "react";
import Link from "next/link";

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
  supportTitle?: string;
  supportText?: string;
  positionMode?: "sticky" | "static";
  /** Content to render below the first section's header (e.g., global season dropdown) */
  headerSlot?: ReactNode;
};

export function Sidebar({
  active,
  navSections,
  navOffset = 72,
  children: _children,
  isOpen = true,
  isMobile = false,
  onClose,
  supportTitle = "Support",
  supportText = "Need help? Reach out to your CSM or email support@cheerbase.test",
  positionMode = "sticky",
  headerSlot,
}: SidebarProps) {
  void _children;
  const offset = Number.isFinite(navOffset) ? Math.max(navOffset, 0) : 72;
  const offsetPx = `${offset}px`;
  const availableHeight = offset > 0 ? `calc(100vh - ${offset}px)` : "100vh";

  return (
    <>
      <aside
        className={cn(
          "flex w-72 flex-col transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isMobile
            ? "fixed left-0 z-30 shadow-lg border-r border-sidebar-border bg-sidebar"
            : "",
          !isMobile && positionMode === "sticky"
            ? "sticky border-r border-sidebar-border bg-sidebar"
            : "",
          !isMobile && positionMode === "static" ? "bg-transparent" : "",
        )}
        style={
          !isMobile && positionMode === "static"
            ? { height: availableHeight }
            : { top: offsetPx, height: availableHeight }
        }
      >
        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4 pt-5">
          {navSections.map((section, index) => (
            <div
              key={section.label ?? section.nickname ?? `section-${index}`}
              className="flex flex-col gap-6"
            >
              {section.header ? (
                <div>{section.header}</div>
              ) : section.label ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                  {section.label}
                </p>
              ) : null}
              {/* Render headerSlot after the first section's header */}
              {index === 0 && headerSlot ? <div>{headerSlot}</div> : null}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = active === item.key;
                  const buttonClasses = cn(
                    "group flex w-full items-center justify-between rounded-sm px-4 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-primary/10",
                    item.disabled ? "cursor-not-allowed opacity-70" : null,
                  );

                  const content = (
                    <div className="flex flex-1 items-center gap-4">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                  );

                  const badge = item.badge ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.badge}
                    </span>
                  ) : null;

                  if (item.href && !item.disabled) {
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        className={buttonClasses}
                        onClick={() => {
                          if (isMobile && onClose) onClose();
                        }}
                      >
                        {content}
                        {badge}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={item.key}
                      className={buttonClasses}
                      aria-disabled={item.disabled}
                    >
                      {content}
                      {badge}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <p className="text-sm font-semibold text-foreground">
              {supportTitle}
            </p>
            <p>{supportText}</p>
          </div>
        </nav>
      </aside>

      {isMobile && isOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-[1px] lg:hidden"
          style={{ top: offsetPx }}
          onClick={onClose}
        />
      ) : null}
    </>
  );
}
