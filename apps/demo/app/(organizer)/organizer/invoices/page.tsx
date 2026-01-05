"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@workspace/ui/shadcn/card";
import { Badge } from "@workspace/ui/shadcn/badge";
import { Button } from "@workspace/ui/shadcn/button";
import { cn } from "@workspace/ui/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/shadcn/dropdown-menu";
import { 
  UsersIcon, 
  DollarSignIcon, 
  CalendarIcon,
  AlertTriangleIcon,
  SlidersHorizontalIcon,
  ExternalLinkIcon,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

import { useOrganizer } from "@/hooks/useOrganizer";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableHead,
  DataTableCell,
  DataTableColumnHeader,
  type SortDirection as TableSortDirection,
} from "@/components/ui/tables";
import { 
  getOrganizerOverview, 
  getOrganizerRegistrations,
  getRegistrationTableData, 
  formatCurrency,
  type RegistrationStatus,
} from "@/data/events/analytics";
import { 
  getEventsByOrganizerId,
  parseEventDate,
  isEventInSeason,
} from "@/data/events/selectors";
import { ActionBar } from "@/components/layout/ActionBar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { type BrandGradient } from "@/lib/gradients";
import { GlassSelect } from "@workspace/ui/components/glass-select";
import { fadeInUp } from "@/lib/animations";

type ColumnKey = "teamName" | "submittedAt" | "event" | "invoice" | "status";

const COLUMN_LABELS: Record<ColumnKey, string> = {
  teamName: "Team Name",
  submittedAt: "Submitted",
  event: "Event",
  invoice: "Invoice",
  status: "Status",
};

type SeasonOption = {
  id: string
  label: string
  start: Date
  end: Date
  type: "current" | "past"
}

const seasonOptions: SeasonOption[] = [
  {
    id: "2025-2026",
    label: "Nov 2025 - May 2026",
    start: new Date(2025, 10, 1),
    end: new Date(2026, 4, 30),
    type: "current",
  },
  {
    id: "2024-2025",
    label: "Nov 2024 - May 2025",
    start: new Date(2024, 10, 1),
    end: new Date(2025, 4, 30),
    type: "past",
  },
  {
    id: "2023-2024",
    label: "Nov 2023 - May 2024",
    start: new Date(2023, 10, 1),
    end: new Date(2024, 4, 30),
    type: "past",
  },
]

const ALL_SEASONS_ID = "all"

const defaultSeason =
  seasonOptions.find((season) => season.type === "current") ?? seasonOptions[0]!
const defaultSeasonId = defaultSeason.id

function resolveSeasonById(seasonId: string): SeasonOption | null {
  if (seasonId === ALL_SEASONS_ID) return null
  return seasonOptions.find((season) => season.id === seasonId) ?? defaultSeason
}

function getStatusBadgeVariant(status: RegistrationStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
    case "unpaid":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
  }
}

export default function OrganizerInvoicesPage() {
  const { organizer, organizerId, isLoading } = useOrganizer();
  const [organizerGradient, setOrganizerGradient] = useState<BrandGradient | undefined>(undefined);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(defaultSeasonId);
  
  const selectedSeason = resolveSeasonById(selectedSeasonId);
  const isAllSeasons = selectedSeasonId === ALL_SEASONS_ID;
  
  // Get events and filter by season
  const organizerEvents = useMemo(() => 
    organizerId ? getEventsByOrganizerId(organizerId) : [],
    [organizerId]
  );
  
  const seasonEventIds = useMemo(() => {
    // If "All Seasons" is selected, return all event IDs
    if (isAllSeasons) {
      return new Set(organizerEvents.map(event => event.id));
    }
    
    // Otherwise, filter by selected season
    if (!selectedSeason) return new Set<string>();
    
    const eventIds = new Set<string>();
    organizerEvents.forEach(event => {
      const eventDate = parseEventDate(event.date);
      if (isEventInSeason(eventDate, selectedSeason.start, selectedSeason.end)) {
        eventIds.add(event.id);
      }
    });
    return eventIds;
  }, [organizerEvents, selectedSeason, isAllSeasons]);
  
  const overview = useMemo(() => {
    if (!organizerId) return null;
    
    // Get all registrations and filter by season
    const allRegistrations = getOrganizerRegistrations(organizerId);
    const filteredRegistrations = allRegistrations.filter(reg => seasonEventIds.has(reg.eventId));
    
    // Recalculate overview from filtered registrations
    const now = new Date();
    let totalRegistrations = 0;
    let totalParticipants = 0;
    let revenuePaid = 0;
    let revenueOutstanding = 0;
    let overdueAmount = 0;
    
    filteredRegistrations.forEach(reg => {
      totalRegistrations++;
      totalParticipants += reg.athletes;
      const amount = parseFloat(reg.invoiceTotal) || 0;
      
      if (reg.status === 'paid') {
        revenuePaid += amount;
      } else {
        revenueOutstanding += amount;
        const deadline = new Date(reg.paymentDeadline);
        if (deadline < now) {
          overdueAmount += amount;
        }
      }
    });
    
    return {
      totalRegistrations,
      totalParticipants,
      revenuePaid,
      revenueOutstanding,
      overdueAmount,
    };
  }, [organizerId, seasonEventIds]);
  
  const tableData = useMemo(() => {
    if (!organizerId) return [];
    const allData = getRegistrationTableData(organizerId);
    return allData.filter(row => seasonEventIds.has(row.eventId));
  }, [organizerId, seasonEventIds]);
  
  const seasonSelectOptions = useMemo(() => {
    // All seasons in descending order (newest first)
    const allSeasonsSorted = [...seasonOptions].sort((a, b) => {
      // Sort by start date descending
      return b.start.getTime() - a.start.getTime();
    }).map((option) => ({ value: option.id, label: option.label }));
    
    return [
      { value: ALL_SEASONS_ID, label: "All Seasons" },
      { type: "separator" as const },
      ...allSeasonsSorted,
    ];
  }, []);

  // Table state
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set(["teamName", "submittedAt", "event", "invoice", "status"])
  );
  
  // Column sort state
  const [teamNameSort, setTeamNameSort] = useState<TableSortDirection>(null);
  const [submittedSort, setSubmittedSort] = useState<TableSortDirection>("desc");
  const [eventSort, setEventSort] = useState<TableSortDirection>(null);
  const [statusSort, setStatusSort] = useState<TableSortDirection>(null);
  
  // Column filter state - initialize with all selected
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    new Set(["paid", "unpaid", "overdue"])
  );
  
  // Sync filter selections when tableData changes (select all by default)
  useEffect(() => {
    setSelectedTeams(new Set(tableData.map(row => row.teamName)));
    setSelectedEvents(new Set(tableData.map(row => row.eventName)));
  }, [tableData]);
  
  // Unique options for filters
  const teamNameOptions = useMemo(() => 
    [...new Set(tableData.map(row => row.teamName))].sort().map(name => ({ value: name, label: name })),
    [tableData]
  );
  const eventOptions = useMemo(() => 
    [...new Set(tableData.map(row => row.eventName))].sort().map(name => ({ value: name, label: name })),
    [tableData]
  );
  const statusOptions = useMemo(() => [
    { value: "paid", label: "Paid" },
    { value: "unpaid", label: "Unpaid" },
    { value: "overdue", label: "Overdue" },
  ], []);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = [...tableData];
    
    // Apply column filters
    data = data.filter((row) => selectedTeams.has(row.teamName));
    data = data.filter((row) => selectedEvents.has(row.eventName));
    data = data.filter((row) => selectedStatuses.has(row.status));

    // Apply sort (priority: most recently changed sort)
    if (teamNameSort) {
      data.sort((a, b) => {
        const diff = a.teamName.localeCompare(b.teamName);
        return teamNameSort === "asc" ? diff : -diff;
      });
    } else if (submittedSort) {
      data.sort((a, b) => {
        const diff = a.submittedAt.getTime() - b.submittedAt.getTime();
        return submittedSort === "asc" ? diff : -diff;
      });
    } else if (eventSort) {
      data.sort((a, b) => {
        const diff = a.eventName.localeCompare(b.eventName);
        return eventSort === "asc" ? diff : -diff;
      });
    } else if (statusSort) {
      const statusOrder = { paid: 0, unpaid: 1, overdue: 2 };
      data.sort((a, b) => {
        const diff = statusOrder[a.status] - statusOrder[b.status];
        return statusSort === "asc" ? diff : -diff;
      });
    }

    return data;
  }, [tableData, selectedTeams, selectedEvents, selectedStatuses, teamNameSort, submittedSort, eventSort, statusSort]);
  
  // Handle sort change (clear other sorts when one is set)
  const handleTeamNameSort = (dir: TableSortDirection) => {
    setTeamNameSort(dir);
    if (dir) { setSubmittedSort(null); setEventSort(null); setStatusSort(null); }
  };
  const handleSubmittedSort = (dir: TableSortDirection) => {
    setSubmittedSort(dir);
    if (dir) { setTeamNameSort(null); setEventSort(null); setStatusSort(null); }
  };
  const handleEventSort = (dir: TableSortDirection) => {
    setEventSort(dir);
    if (dir) { setTeamNameSort(null); setSubmittedSort(null); setStatusSort(null); }
  };
  const handleStatusSort = (dir: TableSortDirection) => {
    setStatusSort(dir);
    if (dir) { setTeamNameSort(null); setSubmittedSort(null); setEventSort(null); }
  };

  // Toggle column visibility
  const toggleColumn = (column: ColumnKey) => {
    // Don't allow hiding teamName
    if (column === "teamName") return;
    
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(column)) {
        next.delete(column);
      } else {
        next.add(column);
      }
      return next;
    });
  };

  // Check if any filters or sorts are applied
  const hasActiveFilters = useMemo(() => {
    const allTeamsSelected = selectedTeams.size === teamNameOptions.length;
    const allEventsSelected = selectedEvents.size === eventOptions.length;
    const allStatusesSelected = selectedStatuses.size === statusOptions.length;
    const hasActiveFilters = !allTeamsSelected || !allEventsSelected || !allStatusesSelected;
    
    // Check if any column is sorted (excluding default submittedSort of "desc")
    const hasActiveSorts = teamNameSort !== null || 
                          (submittedSort !== null && submittedSort !== "desc") || 
                          eventSort !== null || 
                          statusSort !== null;
    
    return hasActiveFilters || hasActiveSorts;
  }, [selectedTeams, selectedEvents, selectedStatuses, teamNameOptions.length, eventOptions.length, statusOptions.length, teamNameSort, submittedSort, eventSort, statusSort]);

  // Clear all filters and sorts
  const clearFilters = () => {
    // Clear filters (select all options)
    setSelectedTeams(new Set(teamNameOptions.map(opt => opt.value)));
    setSelectedEvents(new Set(eventOptions.map(opt => opt.value)));
    setSelectedStatuses(new Set(statusOptions.map(opt => opt.value)));
    
    // Clear sorts (reset to default state)
    setTeamNameSort(null);
    setSubmittedSort("desc"); // Reset to default
    setEventSort(null);
    setStatusSort(null);
  };

  // Load organizer gradient from settings or default
  useEffect(() => {
    const loadGradient = () => {
      if (organizerId) {
        try {
          const stored = localStorage.getItem(`cheerbase-organizer-settings-${organizerId}`)
          if (stored) {
            const settings = JSON.parse(stored)
            if (settings.gradient) {
              setOrganizerGradient(settings.gradient)
              return
            }
          }
        } catch {
          // Ignore storage errors
        }
      }
      // Fall back to organizer's default gradient
      setOrganizerGradient(organizer?.gradient as BrandGradient | undefined)
    }

    loadGradient()

    // Listen for settings changes
    const handleSettingsChange = (event: CustomEvent<{ gradient: string }>) => {
      if (event.detail?.gradient) {
        setOrganizerGradient(event.detail.gradient as BrandGradient)
      }
    }

    window.addEventListener('organizer-settings-changed', handleSettingsChange as EventListener)
    return () => {
      window.removeEventListener('organizer-settings-changed', handleSettingsChange as EventListener)
    }
  }, [organizerId, organizer?.gradient])

  const gradientValue = organizerGradient || organizer?.gradient;

  if (isLoading) {
    return (
      <section className="flex flex-1 flex-col">
        <PageHeader title="Invoices" gradient={gradientValue} />
        <ActionBar
          leftContent={<div className="h-10 w-48 animate-pulse rounded bg-muted" />}
        />
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!overview) {
    return (
      <section className="flex flex-1 flex-col">
        <PageHeader title="Invoices" gradient={gradientValue} />
        <ActionBar
          leftContent={
            <GlassSelect
              value={selectedSeasonId}
              onValueChange={setSelectedSeasonId}
              options={seasonSelectOptions}
            />
          }
        />
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 lg:px-8">
          <Card className="border-dashed border-border/70">
            <CardHeader>
              <p className="text-base font-semibold">No Data Available</p>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Invoices will appear here once you have events and registrations.
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  const hasOverdue = overview.overdueAmount > 0;

  return (
    <section className="flex flex-1 flex-col">
      <PageHeader title="Invoices" gradient={gradientValue} />

      <ActionBar
        leftContent={
          <GlassSelect
            value={selectedSeasonId}
            onValueChange={setSelectedSeasonId}
            options={seasonSelectOptions}
          />
        }
      />

      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 lg:px-8">
        {/* Statistics Section */}
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Section title="Statistics" showDivider={false}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
                  <CalendarIcon className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{overview.totalRegistrations}</p>
                  <p className="text-xs text-muted-foreground mt-1">Across all events</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
                  <UsersIcon className="size-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{overview.totalParticipants.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Athletes registered</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Revenue Collected</p>
                  <DollarSignIcon className="size-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{formatCurrency(overview.revenuePaid)}</p>
                  <p className="text-xs text-muted-foreground mt-1">From paid registrations</p>
                </CardContent>
              </Card>
              <Card className={hasOverdue ? "border-amber-500/50" : ""}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <p className="text-sm font-medium text-muted-foreground">Outstanding Balance</p>
                  {hasOverdue ? (
                    <AlertTriangleIcon className="size-4 text-amber-500" />
                  ) : (
                    <DollarSignIcon className="size-4 text-muted-foreground" />
                  )}
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-semibold ${hasOverdue ? "text-amber-600" : ""}`}>
                    {formatCurrency(overview.revenueOutstanding)}
                  </p>
                  {hasOverdue ? (
                    <p className="text-xs text-amber-600 mt-1">
                      {formatCurrency(overview.overdueAmount)} overdue
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">Pending payments</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </Section>
        </motion.div>

        {/* Registrations Table Section */}
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Section
            title="Registrations"
            titleRight={
              <div className="flex items-center gap-3">
                {/* Clear Filters Button - appears when filters are applied */}
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    onClick={clearFilters}
                  >
                    <X className="size-4" />
                    Clear Filters
                  </Button>
                )}
                {/* Column Visibility */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <SlidersHorizontalIcon className="size-4" />
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[180px]">
                    <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(Object.keys(COLUMN_LABELS) as ColumnKey[]).map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column}
                        checked={visibleColumns.has(column)}
                        onCheckedChange={() => toggleColumn(column)}
                        disabled={column === "teamName"}
                      >
                        {COLUMN_LABELS[column]}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            }
          >
            {/* Table */}
            <DataTable>
              <DataTableHeader>
                <tr>
                  {visibleColumns.has("teamName") && (
                    <DataTableColumnHeader
                      title="Team Name"
                      sortable
                      sortDirection={teamNameSort}
                      onSortChange={handleTeamNameSort}
                      filterable
                      filterOptions={teamNameOptions}
                      selectedFilters={selectedTeams}
                      onFilterChange={setSelectedTeams}
                    />
                  )}
                  {visibleColumns.has("submittedAt") && (
                    <DataTableColumnHeader
                      title="Submitted"
                      sortable
                      sortDirection={submittedSort}
                      onSortChange={handleSubmittedSort}
                    />
                  )}
                  {visibleColumns.has("event") && (
                    <DataTableColumnHeader
                      title="Event"
                      sortable
                      sortDirection={eventSort}
                      onSortChange={handleEventSort}
                      filterable
                      filterOptions={eventOptions}
                      selectedFilters={selectedEvents}
                      onFilterChange={setSelectedEvents}
                    />
                  )}
                  {visibleColumns.has("invoice") && (
                    <DataTableHead>Invoice</DataTableHead>
                  )}
                  {visibleColumns.has("status") && (
                    <DataTableColumnHeader
                      title="Status"
                      className="text-right"
                      sortable
                      sortDirection={statusSort}
                      onSortChange={handleStatusSort}
                      filterable
                      filterOptions={statusOptions}
                      selectedFilters={selectedStatuses}
                      onFilterChange={setSelectedStatuses}
                    />
                  )}
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <DataTableRow key={row.id} animationDelay={index * 40}>
                      {visibleColumns.has("teamName") && (
                        <DataTableCell className="font-medium text-foreground">
                          {row.teamName}
                        </DataTableCell>
                      )}
                      {visibleColumns.has("submittedAt") && (
                        <DataTableCell className="text-muted-foreground">
                          {row.submittedAtFormatted}
                        </DataTableCell>
                      )}
                      {visibleColumns.has("event") && (
                        <DataTableCell>
                          <div className="flex flex-col">
                            <span className="text-foreground">{row.eventName}</span>
                            <span className="text-xs text-muted-foreground">{row.eventId}</span>
                          </div>
                        </DataTableCell>
                      )}
                      {visibleColumns.has("invoice") && (
                        <DataTableCell>
                          <Link 
                            href={row.invoiceHref}
                            className="inline-flex items-center gap-1.5 text-primary hover:underline"
                          >
                            #{row.invoiceNumber}
                            <ExternalLinkIcon className="size-3" />
                          </Link>
                        </DataTableCell>
                      )}
                      {visibleColumns.has("status") && (
                        <DataTableCell className="text-right">
                          <Badge 
                            variant="outline" 
                            className={cn("font-medium", getStatusBadgeVariant(row.status))}
                          >
                            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                          </Badge>
                        </DataTableCell>
                      )}
                    </DataTableRow>
                  ))
                ) : (
                  <DataTableRow>
                    <DataTableCell 
                      colSpan={visibleColumns.size} 
                      className="p-8 text-center text-sm text-muted-foreground"
                    >
                      No registrations match the current filters.
                    </DataTableCell>
                  </DataTableRow>
                )}
              </DataTableBody>
            </DataTable>

            {/* Table Summary */}
            {filteredData.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredData.length} of {tableData.length} registrations
                {filteredData.length < tableData.length && " (filtered)"}
              </p>
            )}
          </Section>
        </motion.div>
      </div>
    </section>
  );
}
