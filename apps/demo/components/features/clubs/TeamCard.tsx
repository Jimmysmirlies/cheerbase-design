"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { ChevronDownIcon, PencilIcon, UsersIcon } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/shadcn/button";
import { Badge } from "@workspace/ui/shadcn/badge";
import { Skeleton } from "@workspace/ui/shadcn/skeleton";
import { GradientAvatar } from "@/components/ui/avatars/GradientAvatar";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableHead,
  DataTableCell,
} from "@/components/ui/tables";
import { formatFriendlyDate, formatPhoneNumber } from "@/utils/format";

// Unified member type that handles both formats
export type TeamMember = {
  id?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  dob?: string | null;
  role?: string | null; // Normalized field name
  type?: string | null; // Legacy support
};

export type TeamData = {
  id: string;
  name: string;
  division: string;
  members?: TeamMember[];
  detailId?: string; // Optional, used for registration context
};

type TeamCardProps = {
  team: TeamData;
  isEditMode?: boolean;
  onEdit?: (team: TeamData) => void;
  /** Show loading skeleton instead of content */
  isLoading?: boolean;
};

export function TeamCard({
  team,
  isEditMode = false,
  onEdit,
  isLoading = false,
}: TeamCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const roster = useMemo(() => team.members ?? [], [team.members]);
  const memberCount = roster.length;

  // Debug: Log width constraints and toggle visual debug
  const handleDebugClick = (e: React.MouseEvent) => {
    // Hold Shift + Click to toggle debug mode
    if (e.shiftKey) {
      e.stopPropagation();
      setDebugMode((prev) => !prev);
      if (!debugMode) {
        console.log("🎨 Debug mode: ON");
        console.log("📊 Outline Legend:");
        console.log("  🟢 Green  = Outer card (w-full)");
        console.log("  🟣 Purple = Flex container");
        console.log("  🔵 Blue   = Content div (min-w-0 flex-1)");
        console.log("  🔴 Red    = H3 heading (heading-4)");
      } else {
        console.log("🎨 Debug mode: OFF");
      }
      return;
    }

    const h3 = e.currentTarget.querySelector("h3") as HTMLElement | null;
    const contentDiv = h3?.parentElement as HTMLElement | null; // min-w-0 flex-1 div
    const flexContainer = e.currentTarget as HTMLElement; // flex container
    const outerCard = flexContainer.parentElement as HTMLElement | null; // w-full card

    if (h3 && contentDiv && flexContainer && outerCard) {
      console.group("🔍 TeamCard Layout Debug - Full Hierarchy");
      console.log("Team name:", team.name);
      console.log("");

      console.log("1️⃣ Outer Card (w-full):", {
        width: outerCard.offsetWidth,
        minWidth: getComputedStyle(outerCard).minWidth,
        maxWidth: getComputedStyle(outerCard).maxWidth,
        overflow: getComputedStyle(outerCard).overflow,
      });

      console.log("2️⃣ Flex Container (flex items-center):", {
        width: flexContainer.offsetWidth,
        minWidth: getComputedStyle(flexContainer).minWidth,
        display: getComputedStyle(flexContainer).display,
        gap: getComputedStyle(flexContainer).gap,
      });

      console.log("3️⃣ Content Div (min-w-0 flex-1):", {
        width: contentDiv.offsetWidth,
        minWidth: getComputedStyle(contentDiv).minWidth,
        flexGrow: getComputedStyle(contentDiv).flexGrow,
        flexShrink: getComputedStyle(contentDiv).flexShrink,
        flexBasis: getComputedStyle(contentDiv).flexBasis,
      });

      console.log("4️⃣ H3 Heading (heading-4):", {
        width: h3.offsetWidth,
        scrollWidth: h3.scrollWidth,
        minWidth: getComputedStyle(h3).minWidth,
        whiteSpace: getComputedStyle(h3).whiteSpace,
        overflow: getComputedStyle(h3).overflow,
        textOverflow: getComputedStyle(h3).textOverflow,
      });

      console.log("");
      console.log("✨ Results:");
      console.log("  - Text is truncated?", h3.scrollWidth > h3.offsetWidth);
      console.log(
        "  - Text overflow visible:",
        h3.scrollWidth - h3.offsetWidth,
        "px",
      );
      console.log(
        "  - Content div can shrink?",
        getComputedStyle(contentDiv).minWidth === "0px",
      );
      console.log(
        "  - H3 can shrink?",
        getComputedStyle(h3).minWidth === "0px",
      );
      console.log(
        "  - Flex container can shrink?",
        getComputedStyle(flexContainer).minWidth === "0px",
      );

      // Check parent chain for width constraints
      console.log("");
      console.log("🔗 Parent Chain (checking for width constraints):");
      let parent = outerCard.parentElement;
      let level = 5;
      while (parent && level <= 8) {
        const styles = getComputedStyle(parent);
        const hasWidthConstraint =
          styles.width !== "auto" ||
          styles.minWidth !== "0px" ||
          styles.maxWidth !== "none";
        console.log(
          `${level}️⃣ ${parent.className.slice(0, 60)}${parent.className.length > 60 ? "..." : ""}`,
          {
            width: styles.width,
            minWidth: styles.minWidth,
            maxWidth: styles.maxWidth,
            display: styles.display,
            hasConstraint: hasWidthConstraint,
          },
        );
        parent = parent.parentElement;
        level++;
      }

      console.groupEnd();
    }
  };

  // Sort roster: coaches first, then others
  const prioritizedRoster = useMemo(() => {
    if (!roster.length) return [];
    const coaches = roster.filter(
      (member) => getMemberRole(member)?.toLowerCase() === "coach",
    );
    const others = roster.filter(
      (member) => getMemberRole(member)?.toLowerCase() !== "coach",
    );
    return [...coaches, ...others];
  }, [roster]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-md border border-border/70 bg-card/60">
        <div className="flex items-center gap-2 p-3 sm:gap-4 sm:p-5">
          <Skeleton className="size-10 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-32 rounded" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="size-3.5 rounded-full" />
              <Skeleton className="h-3.5 w-24 rounded" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-md sm:size-9" />
        </div>
      </div>
    );
  }

  const toggleExpanded = () => setExpanded((prev) => !prev);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleExpanded();
    }
  };

  return (
    <div
      className={cn(
        "w-full min-w-0 overflow-hidden rounded-md border border-border/70 bg-card/60 transition-all hover:border-primary/20",
        debugMode && "outline outline-2 outline-green-500 outline-offset-2",
      )}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={(e) => {
          handleDebugClick(e);
          toggleExpanded();
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex cursor-pointer items-center gap-2 p-3 focus:outline-none sm:gap-4 sm:p-5 min-w-0",
          debugMode && "outline outline-2 outline-purple-500",
        )}
      >
        <GradientAvatar name={team.name} size="sm" />
        <div
          className={cn(
            "min-w-0 flex-1",
            debugMode && "outline outline-2 outline-blue-500",
          )}
        >
          <h3
            className={cn(
              "heading-4 text-foreground line-clamp-2",
              debugMode && "outline outline-2 outline-red-500",
            )}
          >
            {team.name}
          </h3>
          <div className="mt-0.5 flex items-center gap-1.5">
            <UsersIcon
              className="size-3.5 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="body-small text-muted-foreground">
              {memberCount} {memberCount === 1 ? "Member" : "Members"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {isEditMode && onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 text-xs px-2"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(team);
              }}
            >
              <span className="hidden xs:inline sm:hidden">Edit</span>
              <PencilIcon className="size-3.5 sm:ml-1.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
            onClick={(event) => {
              event.stopPropagation();
              toggleExpanded();
            }}
          >
            <ChevronDownIcon
              className={cn(
                "size-4 sm:size-5 transition-transform",
                expanded && "rotate-180",
              )}
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div
          aria-hidden={!expanded}
          className={cn(
            "overflow-hidden border-t bg-muted/20 transition-[opacity,transform,border-color] duration-300 ease-out",
            expanded
              ? "border-border/70 opacity-100 translate-y-0"
              : "pointer-events-none border-transparent opacity-0 -translate-y-2",
          )}
        >
          {prioritizedRoster.length ? (
            <DataTable variant="minimal">
              <DataTableHeader>
                <tr>
                  <DataTableHead>Name</DataTableHead>
                  <DataTableHead>DOB</DataTableHead>
                  <DataTableHead className="hidden md:table-cell md:px-5">
                    Email
                  </DataTableHead>
                  <DataTableHead className="hidden sm:table-cell sm:px-5">
                    Phone
                  </DataTableHead>
                  <DataTableHead className="text-right">Role</DataTableHead>
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {prioritizedRoster.map((member, index) => (
                  <DataTableRow
                    key={member.id ?? `${team.id}-member-${index}`}
                    animated={expanded}
                    animationDelay={index * 60}
                  >
                    <DataTableCell className="text-foreground">
                      {formatMemberName(member)}
                    </DataTableCell>
                    <DataTableCell>
                      {formatFriendlyDate(member.dob ?? undefined)}
                    </DataTableCell>
                    <DataTableCell className="hidden md:table-cell md:px-5">
                      {member.email ?? "—"}
                    </DataTableCell>
                    <DataTableCell className="hidden sm:table-cell sm:px-5">
                      {formatPhoneNumber(member.phone ?? undefined)}
                    </DataTableCell>
                    <DataTableCell className="text-right">
                      <RoleBadge role={getMemberRole(member)} />
                    </DataTableCell>
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTable>
          ) : (
            <div className="px-5 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                No members added yet. Edit roster to add members.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to get role from either 'role' or 'type' field
function getMemberRole(member: TeamMember): string | null | undefined {
  return member.role ?? member.type;
}

function formatMemberName(member: TeamMember) {
  if (member.name?.trim()) return member.name.trim();
  const name = [member.firstName, member.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || "Team member";
}

function formatRole(role?: string | null) {
  if (!role) return "—";
  const normalized = role.trim();
  if (!normalized) return "—";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function RoleBadge({ role }: { role?: string | null }) {
  const normalizedRole = role?.trim().toLowerCase();

  if (!normalizedRole) {
    return <span className="text-muted-foreground">—</span>;
  }

  const roleConfig: Record<string, { label: string; className: string }> = {
    coach: {
      label: "Coach",
      className:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    },
    athlete: {
      label: "Athlete",
      className:
        "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    },
    reservist: {
      label: "Reservist",
      className:
        "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    },
    chaperone: {
      label: "Chaperone",
      className:
        "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    },
  };

  const config = roleConfig[normalizedRole] ?? {
    label: formatRole(role),
    className:
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-700",
  };

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
