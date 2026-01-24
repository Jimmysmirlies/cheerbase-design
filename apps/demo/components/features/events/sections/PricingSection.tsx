"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/shadcn/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/shadcn/command";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/shadcn/alert-dialog";
import {
  Trash2Icon,
  PlusIcon,
  ChevronsUpDownIcon,
  CheckIcon,
  SparklesIcon,
  Settings2Icon,
} from "lucide-react";
import { divisionFullNames } from "@/data/divisions";
import { PricingCardGrid } from "@/components/ui/cards/PricingCard";
import { useFocusModeSettings } from "@/hooks/useFocusModeSettings";
import type { Event, DivisionPricing } from "@/types/events";
import type { BaseSectionProps } from "./types";

export type PricingRow = {
  label: string;
  subtitle: string;
  before: string;
  after: string;
};

export type PricingSectionProps = BaseSectionProps & {
  /** Pre-computed pricing rows for display */
  pricingRows?: PricingRow[];
  /** Early bird deadline label for display */
  pricingDeadlineLabel?: string;
};

/** Compute pricing rows from availableDivisions */
function computePricingRows(
  divisions: DivisionPricing[] | undefined,
  earlyBirdEnabled: boolean,
): PricingRow[] {
  if (!divisions || divisions.length === 0) return [];

  return divisions.map((div) => {
    const regularPrice = div.regular?.price ?? 0;
    const earlyBirdPrice = div.earlyBird?.price ?? regularPrice;

    return {
      label: div.name,
      subtitle: "",
      before: earlyBirdEnabled
        ? `$${earlyBirdPrice.toFixed(0)}`
        : `$${regularPrice.toFixed(0)}`,
      after: `$${regularPrice.toFixed(0)}`,
    };
  });
}

type EditablePricingRow = {
  name: string;
  earlyBirdPrice: string;
  regularPrice: string;
};

const ACTIONS_COLUMN_WIDTH = 56;

function buildEditableRows(divisions: DivisionPricing[]): EditablePricingRow[] {
  if (!divisions?.length) return [];
  return divisions.map((div) => ({
    name: div.name,
    earlyBirdPrice: div.earlyBird?.price?.toString() ?? "",
    regularPrice: div.regular.price?.toString() ?? "",
  }));
}

function createEmptyRow(): EditablePricingRow {
  return {
    name: divisionFullNames[0] ?? "",
    earlyBirdPrice: "",
    regularPrice: "",
  };
}

function rowsToDivisions(
  rows: EditablePricingRow[],
  earlyBirdEnabled: boolean,
): DivisionPricing[] {
  return rows
    .filter((row) => row.name)
    .map((row) => {
      const regularPrice = parseFloat(row.regularPrice) || 0;
      const earlyBirdPrice = parseFloat(row.earlyBirdPrice) || 0;

      const division: DivisionPricing = {
        name: row.name,
        regular: { price: regularPrice },
      };

      if (earlyBirdEnabled && earlyBirdPrice > 0) {
        division.earlyBird = { price: earlyBirdPrice };
      }

      return division;
    });
}

// Searchable Division Combobox Component
function DivisionCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-8 w-full justify-between text-left font-normal"
        >
          <span className="truncate">{value || "Select division..."}</span>
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search divisions..." />
          <CommandList>
            <CommandEmpty>No division found.</CommandEmpty>
            <CommandGroup>
              {divisionFullNames.map((division) => (
                <CommandItem
                  key={division}
                  value={division}
                  onSelect={(currentValue) => {
                    onChange(currentValue);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 size-4",
                      value === division ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {division}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * PricingSection displays division pricing.
 * Supports both view and edit modes with early bird pricing.
 */
export function PricingSection({
  mode,
  eventData,
  onUpdate,
  onCloseEdit,
  pricingRows: propPricingRows,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pricingDeadlineLabel: _,
  organizerGradient,
}: PricingSectionProps) {
  const earlyBirdEnabled = eventData.earlyBirdEnabled ?? false;
  const divisions = eventData.availableDivisions || [];

  // VIEW MODE
  if (mode === "view") {
    // Use provided rows or compute from availableDivisions
    const rows =
      propPricingRows || computePricingRows(divisions, earlyBirdEnabled);

    return (
      <PricingCardGrid
        cards={rows.map((row) => ({
          label: row.label,
          subtitle: row.subtitle,
          price: row.before,
          originalPrice: earlyBirdEnabled ? row.after : undefined,
          gradient: organizerGradient,
        }))}
      />
    );
  }

  // EDIT MODE - Complex table-based editor
  return (
    <PricingEditor
      eventData={eventData}
      onUpdate={onUpdate!}
      onCloseEdit={onCloseEdit}
      earlyBirdEnabled={earlyBirdEnabled}
      divisions={divisions}
    />
  );
}

// Separate component for the edit mode to manage its own state
function PricingEditor({
  eventData,
  onUpdate,
  onCloseEdit,
  earlyBirdEnabled,
  divisions,
}: {
  eventData: Partial<Event>;
  onUpdate: (updates: Partial<Event>) => void;
  onCloseEdit?: () => void;
  earlyBirdEnabled: boolean;
  divisions: DivisionPricing[];
}) {
  const { setSidebarOpen, requestMobileSheetOpen } = useFocusModeSettings();

  const normalizedRows = useMemo(
    () => buildEditableRows(divisions),
    [divisions],
  );
  const initialRowsRef = useRef<EditablePricingRow[]>(normalizedRows);
  const [rows, setRows] = useState<EditablePricingRow[]>(normalizedRows);
  const [rowToRemove, setRowToRemove] = useState<{
    index: number;
    name: string;
  } | null>(null);

  // Sync rows when divisions change externally
  useEffect(() => {
    const newRows = buildEditableRows(divisions);
    initialRowsRef.current = newRows;
    setRows(newRows);
  }, [divisions]);

  // Sync changes back to parent
  useEffect(() => {
    const newDivisions = rowsToDivisions(rows, earlyBirdEnabled);
    const currentDivisions = eventData.availableDivisions || [];

    if (JSON.stringify(newDivisions) !== JSON.stringify(currentDivisions)) {
      onUpdate({ availableDivisions: newDivisions });
    }
  }, [rows, earlyBirdEnabled, onUpdate, eventData.availableDivisions]);

  const handleOpenSettings = useCallback(() => {
    // Close the edit card and open the settings sidebar (or mobile sheet)
    onCloseEdit?.();
    setSidebarOpen(true);
    requestMobileSheetOpen();
  }, [onCloseEdit, setSidebarOpen, requestMobileSheetOpen]);

  const handleCellChange = useCallback(
    (rowIndex: number, columnId: keyof EditablePricingRow, value: string) => {
      setRows((prev) => {
        const currentRow = prev[rowIndex];
        if (!currentRow) return prev;
        const next = [...prev];
        next[rowIndex] = {
          name: currentRow.name,
          earlyBirdPrice: currentRow.earlyBirdPrice,
          regularPrice: currentRow.regularPrice,
          [columnId]: value,
        };
        return next;
      });
    },
    [],
  );

  const promptRemoveRow = useCallback(
    (rowIndex: number, divisionName: string) => {
      setRowToRemove({
        index: rowIndex,
        name: divisionName || "this division",
      });
    },
    [],
  );

  const confirmRemoveRow = useCallback(() => {
    if (rowToRemove !== null) {
      setRows((prev) => prev.filter((_, index) => index !== rowToRemove.index));
      setRowToRemove(null);
    }
  }, [rowToRemove]);

  const cancelRemoveRow = useCallback(() => {
    setRowToRemove(null);
  }, []);

  const handleAddRow = useCallback(() => {
    setRows((prev) => [...prev, createEmptyRow()]);
  }, []);

  const handleDuplicateLast = useCallback(() => {
    setRows((prev) => {
      if (!prev.length) return [createEmptyRow()];
      const last = prev[prev.length - 1];
      if (!last) return [createEmptyRow()];
      return [
        ...prev,
        {
          name: last.name,
          earlyBirdPrice: last.earlyBirdPrice,
          regularPrice: last.regularPrice,
        },
      ];
    });
  }, []);

  const handleReset = useCallback(() => {
    setRows(initialRowsRef.current);
  }, []);

  const hasChanges = useMemo(
    () => JSON.stringify(initialRowsRef.current) !== JSON.stringify(rows),
    [rows],
  );

  const columns = useMemo<ColumnDef<EditablePricingRow>[]>(() => {
    const cols: ColumnDef<EditablePricingRow>[] = [
      {
        header: "Division",
        accessorKey: "name",
        cell: ({ getValue, row }) => {
          const value = getValue<string>() || "";
          return (
            <DivisionCombobox
              value={value}
              onChange={(newValue) =>
                handleCellChange(row.index, "name", newValue)
              }
            />
          );
        },
      },
    ];

    if (earlyBirdEnabled) {
      cols.push({
        header: "Early Bird Price",
        accessorKey: "earlyBirdPrice",
        cell: ({ getValue, row }) => (
          <Input
            type="number"
            min="0"
            step="0.01"
            value={getValue<string>() ?? ""}
            onChange={(e) =>
              handleCellChange(row.index, "earlyBirdPrice", e.target.value)
            }
            placeholder="0.00"
            className="h-8"
          />
        ),
      });
    }

    cols.push(
      {
        header: "Price",
        accessorKey: "regularPrice",
        cell: ({ getValue, row }) => (
          <Input
            type="number"
            min="0"
            step="0.01"
            value={getValue<string>() ?? ""}
            onChange={(e) =>
              handleCellChange(row.index, "regularPrice", e.target.value)
            }
            placeholder="0.00"
            className="h-8"
          />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => promptRemoveRow(row.index, row.original.name)}
              aria-label="Remove division"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2Icon className="size-4" aria-hidden="true" />
            </Button>
          </div>
        ),
      },
    );

    return cols;
  }, [earlyBirdEnabled, handleCellChange, promptRemoveRow]);

  const table = useReactTable<EditablePricingRow>({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const dataColumnCount = earlyBirdEnabled ? 3 : 2;

  return (
    <div className="flex flex-col gap-4 pt-2">
      {/* Early Bird Notice - shown when not enabled */}
      {!earlyBirdEnabled && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800/50 dark:bg-amber-900/20">
          <SparklesIcon className="mt-0.5 size-5 shrink-0 text-amber-500" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-1">
              <p className="body-small font-medium text-amber-900 dark:text-amber-100">
                Want to offer early bird pricing?
              </p>
              <p className="body-small text-amber-700 dark:text-amber-300">
                Enable early bird pricing in Event Settings to add discounted
                rates for teams that register before a deadline.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-fit border-amber-300 bg-white text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50"
              onClick={handleOpenSettings}
            >
              <Settings2Icon className="mr-2 size-4" />
              Open Event Settings
            </Button>
          </div>
        </div>
      )}

      {/* Early Bird Active indicator - shown when enabled */}
      {earlyBirdEnabled && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50/50 px-4 py-3 dark:border-green-800/50 dark:bg-green-900/20">
          <SparklesIcon className="size-4 text-green-600 dark:text-green-400" />
          <p className="body-small font-medium text-green-800 dark:text-green-200">
            Early bird pricing is enabled
          </p>
          <span className="body-small text-green-600 dark:text-green-400">
            — Set discounted prices in the Early Bird column below
          </span>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" onClick={handleAddRow}>
            <PlusIcon className="mr-2 size-4" />
            Add Division
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleDuplicateLast}
            disabled={!rows.length}
          >
            Duplicate last row
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset changes
          </Button>
        </div>
        <span
          className={cn(
            "text-xs font-medium",
            hasChanges ? "text-amber-600" : "text-muted-foreground",
          )}
        >
          {hasChanges ? "Unsaved changes" : "All changes saved"}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border border-border/70 bg-card/60">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-left text-sm">
            <colgroup>
              {Array.from({ length: dataColumnCount }).map((_, i) => (
                <col
                  key={`data-column-${i}`}
                  style={{
                    width: `calc((100% - ${ACTIONS_COLUMN_WIDTH}px) / ${dataColumnCount})`,
                  }}
                />
              ))}
              <col style={{ width: `${ACTIONS_COLUMN_WIDTH}px` }} />
            </colgroup>
            <thead className="bg-muted/40 text-muted-foreground">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 py-3 text-left font-medium sm:px-4"
                      style={
                        header.column.id === "actions"
                          ? { width: `${ACTIONS_COLUMN_WIDTH}px` }
                          : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t border-border/50">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 py-3 align-top sm:px-4"
                        style={
                          cell.column.id === "actions"
                            ? { width: `${ACTIONS_COLUMN_WIDTH}px` }
                            : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={table.getAllLeafColumns().length}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    Add divisions to begin setting up pricing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remove Division Confirmation Dialog */}
      <AlertDialog
        open={rowToRemove !== null}
        onOpenChange={(open) => !open && cancelRemoveRow()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove division pricing?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove pricing for{" "}
              <span className="font-medium text-foreground">
                {rowToRemove?.name}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRemoveRow}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveRow}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** Check if section has data to display */
PricingSection.hasData = (eventData: Partial<Event>): boolean => {
  return !!(
    eventData.availableDivisions && eventData.availableDivisions.length > 0
  );
};

/** Empty state configuration */
PricingSection.emptyTitle = "Set division pricing";
PricingSection.emptyDescription = "Configure pricing for each division";
