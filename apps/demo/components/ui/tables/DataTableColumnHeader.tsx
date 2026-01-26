"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@workspace/ui/shadcn/dropdown-menu";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronsUpDownIcon,
  X,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export type SortDirection = "asc" | "desc" | null;

export type FilterOption = {
  value: string;
  label: string;
};

export type DataTableColumnHeaderProps = {
  /** Column title displayed in the header */
  title: string;
  /** Current sort direction */
  sortDirection?: SortDirection;
  /** Callback when sort direction changes */
  onSortChange?: (direction: SortDirection) => void;
  /** Whether sorting is enabled for this column */
  sortable?: boolean;
  /** Available filter options */
  filterOptions?: FilterOption[];
  /** Currently selected filter values */
  selectedFilters?: Set<string>;
  /** Callback when filter selection changes */
  onFilterChange?: (selected: Set<string>) => void;
  /** Whether filtering is enabled for this column */
  filterable?: boolean;
  /** Additional class names for the th element */
  className?: string;
};

// ============================================================================
// DataTableColumnHeader
// ============================================================================

/**
 * Enhanced table column header with sort and filter dropdown.
 *
 * @example
 * ```tsx
 * <DataTableColumnHeader
 *   title="Team Name"
 *   sortable
 *   sortDirection={sortDirection}
 *   onSortChange={setSortDirection}
 *   filterable
 *   filterOptions={teamNames.map(name => ({ value: name, label: name }))}
 *   selectedFilters={selectedTeams}
 *   onFilterChange={setSelectedTeams}
 * />
 * ```
 */
export function DataTableColumnHeader({
  title,
  sortDirection,
  onSortChange,
  sortable = false,
  filterOptions = [],
  selectedFilters,
  onFilterChange,
  filterable = false,
  className,
}: DataTableColumnHeaderProps) {
  const hasInteractions = sortable || filterable;
  const allSelected =
    filterOptions.length > 0 && selectedFilters?.size === filterOptions.length;

  // Handle sort toggle
  const handleSort = (direction: SortDirection) => {
    if (!onSortChange) return;
    // If clicking the same direction, clear it
    if (sortDirection === direction) {
      onSortChange(null);
    } else {
      onSortChange(direction);
    }
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    if (!onFilterChange) return;
    if (allSelected) {
      // Deselect all
      onFilterChange(new Set());
    } else {
      // Select all
      onFilterChange(new Set(filterOptions.map((opt) => opt.value)));
    }
  };

  // Handle individual filter toggle
  const handleFilterToggle = (value: string) => {
    if (!onFilterChange || !selectedFilters) return;
    const next = new Set(selectedFilters);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    onFilterChange(next);
  };

  // Simple header without interactions
  if (!hasInteractions) {
    return (
      <th className={cn("px-3 py-3 font-medium sm:px-4", className)}>
        {title}
      </th>
    );
  }

  // Get sort icon
  const SortIcon =
    sortDirection === "asc"
      ? ArrowUpIcon
      : sortDirection === "desc"
        ? ArrowDownIcon
        : ChevronsUpDownIcon;

  return (
    <th className={cn("px-3 py-3 font-medium sm:px-4", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "-ml-3 h-8 gap-1.5 px-3 font-medium text-muted-foreground hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground",
              sortDirection && "bg-accent text-foreground",
            )}
          >
            {title}
            <SortIcon className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-56 max-w-80 overflow-hidden p-0 max-h-80"
        >
          <div className="max-h-80 overflow-y-auto scrollbar-hide p-1">
              {/* Header with Sort Toggle */}
              <div className="flex items-center justify-between gap-3 px-2 py-2">
                <p className="text-sm font-medium text-foreground">{title}</p>
                {sortable && (
                  <div className="relative inline-flex shrink-0 items-center rounded-md border border-border/70 bg-muted/40 p-1">
                    {sortDirection && (
                      <div
                        className={cn(
                          "absolute left-1 top-1 h-6 w-6 rounded-md bg-card shadow transition-transform duration-200 ease-out",
                          sortDirection === "desc" && "translate-x-6",
                        )}
                        aria-hidden
                      />
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="relative z-10 size-6 rounded-md p-0"
                      aria-label="Sort ascending"
                      aria-pressed={sortDirection === "asc"}
                      onClick={() => handleSort("asc")}
                    >
                      <ArrowUpIcon className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="relative z-10 size-6 rounded-md p-0"
                      aria-label="Sort descending"
                      aria-pressed={sortDirection === "desc"}
                      onClick={() => handleSort("desc")}
                    >
                      <ArrowDownIcon className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="relative z-10 size-6 rounded-md p-0"
                      aria-label="Clear sort"
                      aria-pressed={sortDirection === null}
                      onClick={() => onSortChange?.(null)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              {filterable && filterOptions.length > 0 && (
                <DropdownMenuSeparator />
              )}

              {/* Filter Controls */}
              {filterable && filterOptions.length > 0 && (
                <>
                  {/* Select All - Own Section */}
                  <div className="p-2">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={handleSelectAll}
                      onKeyDown={(e) => e.key === "Enter" && handleSelectAll()}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                    >
                      <span className="body-small font-medium">Select All</span>
                      {allSelected && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-4 shrink-0"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Filter Options */}
                  <div className="p-2">
                    {filterOptions.map((option) => {
                      const isChecked =
                        selectedFilters?.has(option.value) ?? false;
                      return (
                        <div
                          key={option.value}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleFilterToggle(option.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            handleFilterToggle(option.value)
                          }
                          className="flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                        >
                          <span className="body-small">{option.label}</span>
                          {isChecked && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="size-4 shrink-0"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </th>
  );
}
