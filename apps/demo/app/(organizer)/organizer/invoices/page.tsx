"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@workspace/ui/shadcn/card";
import { Badge } from "@workspace/ui/shadcn/badge";
import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
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
  SearchIcon,
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
  getOrganizerRegistrations,
  getRegistrationTableData,
  getInvoiceHistory,
  formatCurrency,
  type RegistrationStatus,
} from "@/data/events/analytics";
import {
  getEventsByOrganizerId,
  parseEventDate,
  isEventInSeason,
} from "@/data/events/selectors";
import { PageTitle } from "@/components/layout/PageTitle";
import { Section } from "@/components/layout/Section";
import { SeasonDropdown } from "@/components/layout/SeasonDropdown";
import { useSeason } from "@/components/providers/SeasonProvider";
import { PageTabs } from "@/components/ui/PageTabs";
import { type BrandGradient, getGradientStartColor } from "@/lib/gradients";
import { fadeInUp } from "@/lib/animations";

type InvoicesTab = "registrations" | "history";

type ColumnKey =
  | "teamName"
  | "clubName"
  | "submittedAt"
  | "event"
  | "invoice"
  | "status";

const COLUMN_LABELS: Record<ColumnKey, string> = {
  teamName: "Team Name",
  clubName: "Club",
  submittedAt: "Submitted",
  event: "Event",
  invoice: "Invoice",
  status: "Status",
};

type HistoryColumnKey =
  | "teamName"
  | "clubOwner"
  | "event"
  | "invoice"
  | "paidBy"
  | "note"
  | "date";

const HISTORY_COLUMN_LABELS: Record<HistoryColumnKey, string> = {
  teamName: "Team Name",
  clubOwner: "Club Owner",
  event: "Event",
  invoice: "Invoice",
  paidBy: "Paid By",
  note: "Note",
  date: "Date",
};

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
  const [organizerGradient, setOrganizerGradient] = useState<
    BrandGradient | undefined
  >(undefined);
  const { selectedSeason, isAllSeasons } = useSeason();

  const [activeTab, setActiveTab] = useState<InvoicesTab>("registrations");
  const [historySearch, setHistorySearch] = useState("");

  const organizerEvents = useMemo(
    () => (organizerId ? getEventsByOrganizerId(organizerId) : []),
    [organizerId],
  );

  const seasonEventIds = useMemo(() => {
    if (isAllSeasons) {
      return new Set(organizerEvents.map((event) => event.id));
    }

    if (!selectedSeason) return new Set<string>();

    const eventIds = new Set<string>();
    organizerEvents.forEach((event) => {
      const eventDate = parseEventDate(event.date);
      if (
        isEventInSeason(eventDate, selectedSeason.start, selectedSeason.end)
      ) {
        eventIds.add(event.id);
      }
    });
    return eventIds;
  }, [organizerEvents, selectedSeason, isAllSeasons]);

  const overview = useMemo(() => {
    if (!organizerId) return null;

    const allRegistrations = getOrganizerRegistrations(organizerId);
    const filteredRegistrations = allRegistrations.filter((reg) =>
      seasonEventIds.has(reg.eventId),
    );

    const now = new Date();
    let totalRegistrations = 0;
    let totalParticipants = 0;
    let revenuePaid = 0;
    let revenueOutstanding = 0;
    let overdueAmount = 0;

    filteredRegistrations.forEach((reg) => {
      totalRegistrations++;
      totalParticipants += reg.athletes;
      const amount = parseFloat(reg.invoiceTotal) || 0;

      if (reg.status === "paid") {
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
    return allData.filter((row) => seasonEventIds.has(row.eventId));
  }, [organizerId, seasonEventIds]);

  const historyData = useMemo(() => {
    if (!organizerId) return [];
    const allHistory = getInvoiceHistory(organizerId);
    return allHistory.filter((entry) => seasonEventIds.has(entry.eventId));
  }, [organizerId, seasonEventIds]);

  const [historyTeamNameSort, setHistoryTeamNameSort] =
    useState<TableSortDirection>(null);
  const [historyEventSort, setHistoryEventSort] =
    useState<TableSortDirection>(null);
  const [historyDateSort, setHistoryDateSort] =
    useState<TableSortDirection>("desc");
  const [historyPaidBySort, setHistoryPaidBySort] =
    useState<TableSortDirection>(null);

  // Table state
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set([
      "teamName",
      "clubName",
      "submittedAt",
      "event",
      "invoice",
      "status",
    ]),
  );

  const [historyVisibleColumns, setHistoryVisibleColumns] = useState<
    Set<HistoryColumnKey>
  >(
    new Set([
      "teamName",
      "clubOwner",
      "event",
      "invoice",
      "paidBy",
      "note",
      "date",
    ]),
  );

  const [historySelectedTeams, setHistorySelectedTeams] = useState<Set<string>>(
    new Set(),
  );
  const [historySelectedEvents, setHistorySelectedEvents] = useState<
    Set<string>
  >(new Set());
  const [historySelectedPaidBy, setHistorySelectedPaidBy] = useState<
    Set<string>
  >(new Set());

  const [teamNameSort, setTeamNameSort] = useState<TableSortDirection>(null);
  const [submittedSort, setSubmittedSort] =
    useState<TableSortDirection>("desc");
  const [eventSort, setEventSort] = useState<TableSortDirection>(null);
  const [statusSort, setStatusSort] = useState<TableSortDirection>(null);

  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    new Set(["paid", "unpaid", "overdue"]),
  );

  useEffect(() => {
    setSelectedTeams(new Set(tableData.map((row) => row.teamName)));
    setSelectedEvents(new Set(tableData.map((row) => row.eventName)));
  }, [tableData]);

  const teamNameOptions = useMemo(
    () =>
      [...new Set(tableData.map((row) => row.teamName))]
        .sort()
        .map((name) => ({ value: name, label: name })),
    [tableData],
  );
  const eventOptions = useMemo(
    () =>
      [...new Set(tableData.map((row) => row.eventName))]
        .sort()
        .map((name) => ({ value: name, label: name })),
    [tableData],
  );
  const statusOptions = useMemo(
    () => [
      { value: "paid", label: "Paid" },
      { value: "unpaid", label: "Unpaid" },
      { value: "overdue", label: "Overdue" },
    ],
    [],
  );

  useEffect(() => {
    setHistorySelectedTeams(
      new Set(historyData.map((entry) => entry.teamName)),
    );
    setHistorySelectedEvents(
      new Set(historyData.map((entry) => entry.eventName)),
    );
    setHistorySelectedPaidBy(
      new Set(historyData.map((entry) => entry.paidByOrganizer)),
    );
  }, [historyData]);

  const historyTeamNameOptions = useMemo(
    () =>
      [...new Set(historyData.map((entry) => entry.teamName))]
        .sort()
        .map((name) => ({ value: name, label: name })),
    [historyData],
  );
  const historyEventOptions = useMemo(
    () =>
      [...new Set(historyData.map((entry) => entry.eventName))]
        .sort()
        .map((name) => ({ value: name, label: name })),
    [historyData],
  );
  const historyPaidByOptions = useMemo(
    () =>
      [...new Set(historyData.map((entry) => entry.paidByOrganizer))]
        .sort()
        .map((name) => ({ value: name, label: name })),
    [historyData],
  );

  const filteredHistoryData = useMemo(() => {
    let data = [...historyData];

    data = data.filter((entry) => historySelectedTeams.has(entry.teamName));
    data = data.filter((entry) => historySelectedEvents.has(entry.eventName));
    data = data.filter((entry) =>
      historySelectedPaidBy.has(entry.paidByOrganizer),
    );

    if (historySearch.trim()) {
      const searchLower = historySearch.toLowerCase();
      data = data.filter(
        (entry) =>
          entry.invoiceNumber.toLowerCase().includes(searchLower) ||
          entry.teamName.toLowerCase().includes(searchLower) ||
          entry.clubOwner.toLowerCase().includes(searchLower) ||
          entry.eventName.toLowerCase().includes(searchLower),
      );
    }

    if (historyTeamNameSort) {
      data.sort((a, b) => {
        const diff = a.teamName.localeCompare(b.teamName);
        return historyTeamNameSort === "asc" ? diff : -diff;
      });
    } else if (historyEventSort) {
      data.sort((a, b) => {
        const diff = a.eventName.localeCompare(b.eventName);
        return historyEventSort === "asc" ? diff : -diff;
      });
    } else if (historyPaidBySort) {
      data.sort((a, b) => {
        const diff = a.paidByOrganizer.localeCompare(b.paidByOrganizer);
        return historyPaidBySort === "asc" ? diff : -diff;
      });
    } else if (historyDateSort) {
      data.sort((a, b) => {
        const diff = a.changeDate.getTime() - b.changeDate.getTime();
        return historyDateSort === "asc" ? diff : -diff;
      });
    }

    return data;
  }, [
    historyData,
    historySelectedTeams,
    historySelectedEvents,
    historySelectedPaidBy,
    historySearch,
    historyTeamNameSort,
    historyEventSort,
    historyPaidBySort,
    historyDateSort,
  ]);

  const filteredData = useMemo(() => {
    let data = [...tableData];

    data = data.filter((row) => selectedTeams.has(row.teamName));
    data = data.filter((row) => selectedEvents.has(row.eventName));
    data = data.filter((row) => selectedStatuses.has(row.status));

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
  }, [
    tableData,
    selectedTeams,
    selectedEvents,
    selectedStatuses,
    teamNameSort,
    submittedSort,
    eventSort,
    statusSort,
  ]);

  const handleTeamNameSort = (dir: TableSortDirection) => {
    setTeamNameSort(dir);
    if (dir) {
      setSubmittedSort(null);
      setEventSort(null);
      setStatusSort(null);
    }
  };
  const handleSubmittedSort = (dir: TableSortDirection) => {
    setSubmittedSort(dir);
    if (dir) {
      setTeamNameSort(null);
      setEventSort(null);
      setStatusSort(null);
    }
  };
  const handleEventSort = (dir: TableSortDirection) => {
    setEventSort(dir);
    if (dir) {
      setTeamNameSort(null);
      setSubmittedSort(null);
      setStatusSort(null);
    }
  };
  const handleStatusSort = (dir: TableSortDirection) => {
    setStatusSort(dir);
    if (dir) {
      setTeamNameSort(null);
      setSubmittedSort(null);
      setEventSort(null);
    }
  };

  const toggleColumn = (column: ColumnKey) => {
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

  const hasActiveFilters = useMemo(() => {
    const allTeamsSelected = selectedTeams.size === teamNameOptions.length;
    const allEventsSelected = selectedEvents.size === eventOptions.length;
    const allStatusesSelected = selectedStatuses.size === statusOptions.length;
    const hasActiveFilters =
      !allTeamsSelected || !allEventsSelected || !allStatusesSelected;

    // Check if any column is sorted (excluding default submittedSort of "desc")
    const hasActiveSorts =
      teamNameSort !== null ||
      (submittedSort !== null && submittedSort !== "desc") ||
      eventSort !== null ||
      statusSort !== null;

    return hasActiveFilters || hasActiveSorts;
  }, [
    selectedTeams,
    selectedEvents,
    selectedStatuses,
    teamNameOptions.length,
    eventOptions.length,
    statusOptions.length,
    teamNameSort,
    submittedSort,
    eventSort,
    statusSort,
  ]);

  const clearFilters = () => {
    setSelectedTeams(new Set(teamNameOptions.map((opt) => opt.value)));
    setSelectedEvents(new Set(eventOptions.map((opt) => opt.value)));
    setSelectedStatuses(new Set(statusOptions.map((opt) => opt.value)));
    setTeamNameSort(null);
    setSubmittedSort("desc");
    setEventSort(null);
    setStatusSort(null);
  };

  const handleHistoryTeamNameSort = (dir: TableSortDirection) => {
    setHistoryTeamNameSort(dir);
    if (dir) {
      setHistoryEventSort(null);
      setHistoryDateSort(null);
      setHistoryPaidBySort(null);
    }
  };
  const handleHistoryEventSort = (dir: TableSortDirection) => {
    setHistoryEventSort(dir);
    if (dir) {
      setHistoryTeamNameSort(null);
      setHistoryDateSort(null);
      setHistoryPaidBySort(null);
    }
  };
  const handleHistoryDateSort = (dir: TableSortDirection) => {
    setHistoryDateSort(dir);
    if (dir) {
      setHistoryTeamNameSort(null);
      setHistoryEventSort(null);
      setHistoryPaidBySort(null);
    }
  };
  const handleHistoryPaidBySort = (dir: TableSortDirection) => {
    setHistoryPaidBySort(dir);
    if (dir) {
      setHistoryTeamNameSort(null);
      setHistoryEventSort(null);
      setHistoryDateSort(null);
    }
  };

  const toggleHistoryColumn = (column: HistoryColumnKey) => {
    if (column === "teamName") return;
    setHistoryVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(column)) {
        next.delete(column);
      } else {
        next.add(column);
      }
      return next;
    });
  };

  const historyHasActiveFilters = useMemo(() => {
    const allTeamsSelected =
      historySelectedTeams.size === historyTeamNameOptions.length;
    const allEventsSelected =
      historySelectedEvents.size === historyEventOptions.length;
    const allPaidBySelected =
      historySelectedPaidBy.size === historyPaidByOptions.length;
    const hasActiveFilters =
      !allTeamsSelected || !allEventsSelected || !allPaidBySelected;

    const hasActiveSorts =
      historyTeamNameSort !== null ||
      historyEventSort !== null ||
      (historyDateSort !== null && historyDateSort !== "desc") ||
      historyPaidBySort !== null;

    return hasActiveFilters || hasActiveSorts;
  }, [
    historySelectedTeams,
    historySelectedEvents,
    historySelectedPaidBy,
    historyTeamNameOptions.length,
    historyEventOptions.length,
    historyPaidByOptions.length,
    historyTeamNameSort,
    historyEventSort,
    historyDateSort,
    historyPaidBySort,
  ]);

  const clearHistoryFilters = () => {
    setHistorySelectedTeams(
      new Set(historyTeamNameOptions.map((opt) => opt.value)),
    );
    setHistorySelectedEvents(
      new Set(historyEventOptions.map((opt) => opt.value)),
    );
    setHistorySelectedPaidBy(
      new Set(historyPaidByOptions.map((opt) => opt.value)),
    );
    setHistoryTeamNameSort(null);
    setHistoryEventSort(null);
    setHistoryDateSort("desc");
    setHistoryPaidBySort(null);
  };

  useEffect(() => {
    const loadGradient = () => {
      if (organizerId) {
        try {
          const stored = localStorage.getItem(
            `cheerbase-organizer-settings-${organizerId}`,
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
      setOrganizerGradient(organizer?.gradient as BrandGradient | undefined);
    };

    loadGradient();

    const handleSettingsChange = (event: CustomEvent<{ gradient: string }>) => {
      if (event.detail?.gradient) {
        setOrganizerGradient(event.detail.gradient as BrandGradient);
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
  }, [organizerId, organizer?.gradient]);

  const gradientValue = organizerGradient || organizer?.gradient;

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <PageTitle title="Invoices" gradient={gradientValue} />
        <div className="pt-6">
          <SeasonDropdown />
        </div>
        <div className="flex flex-col gap-4 pt-8">
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
      <section className="mx-auto w-full max-w-6xl">
        <PageTitle title="Invoices" gradient={gradientValue} />
        <div className="pt-6">
          <SeasonDropdown />
        </div>
        <div className="flex flex-col gap-4 pt-8">
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
    <section className="mx-auto w-full max-w-6xl">
      <PageTitle title="Invoices" gradient={gradientValue} />

      <div className="pt-6">
        <SeasonDropdown />
      </div>

      <div className="pt-6">
        <PageTabs
          tabs={[
            { id: "registrations", label: "Registrations" },
            { id: "history", label: "History" },
          ]}
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as InvoicesTab)}
          accentColor={
            organizerGradient
              ? getGradientStartColor(organizerGradient)
              : undefined
          }
        />
      </div>

      <div>
        {activeTab === "registrations" && (
          <>
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Section title="Statistics" showDivider={false}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Registrations
                      </p>
                      <CalendarIcon className="size-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-semibold">
                        {overview.totalRegistrations}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Across all events
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Participants
                      </p>
                      <UsersIcon className="size-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-semibold">
                        {overview.totalParticipants.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Athletes registered
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Revenue Collected
                      </p>
                      <DollarSignIcon className="size-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-semibold">
                        {formatCurrency(overview.revenuePaid)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        From paid registrations
                      </p>
                    </CardContent>
                  </Card>
                  <Card className={hasOverdue ? "border-amber-500/50" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Outstanding Balance
                      </p>
                      {hasOverdue ? (
                        <AlertTriangleIcon className="size-4 text-amber-500" />
                      ) : (
                        <DollarSignIcon className="size-4 text-muted-foreground" />
                      )}
                    </CardHeader>
                    <CardContent>
                      <p
                        className={`text-2xl font-semibold ${hasOverdue ? "text-amber-600" : ""}`}
                      >
                        {formatCurrency(overview.revenueOutstanding)}
                      </p>
                      {hasOverdue ? (
                        <p className="text-xs text-amber-600 mt-1">
                          {formatCurrency(overview.overdueAmount)} overdue
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          Pending payments
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </Section>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Section
                title="Registrations"
                titleRight={
                  <div className="flex items-center gap-3">
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
                        {(Object.keys(COLUMN_LABELS) as ColumnKey[]).map(
                          (column) => (
                            <DropdownMenuCheckboxItem
                              key={column}
                              checked={visibleColumns.has(column)}
                              onCheckedChange={() => toggleColumn(column)}
                              disabled={column === "teamName"}
                            >
                              {COLUMN_LABELS[column]}
                            </DropdownMenuCheckboxItem>
                          ),
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                }
              >
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
                      {visibleColumns.has("clubName") && (
                        <DataTableHead>Club</DataTableHead>
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
                          {visibleColumns.has("clubName") && (
                            <DataTableCell className="text-muted-foreground">
                              {row.clubName}
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
                                <span className="text-foreground">
                                  {row.eventName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {row.eventId}
                                </span>
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
                                className={cn(
                                  "font-medium",
                                  getStatusBadgeVariant(row.status),
                                )}
                              >
                                {row.status.charAt(0).toUpperCase() +
                                  row.status.slice(1)}
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

                {filteredData.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredData.length} of {tableData.length}{" "}
                    registrations
                    {filteredData.length < tableData.length && " (filtered)"}
                  </p>
                )}
              </Section>
            </motion.div>
          </>
        )}

        {activeTab === "history" && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col gap-6 py-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by invoice number, club name, team name, or event name..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-3">
                {historyHasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={clearHistoryFilters}
                  >
                    <X className="size-4" />
                    Clear Filters
                  </Button>
                )}
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
                    {(
                      Object.keys(HISTORY_COLUMN_LABELS) as HistoryColumnKey[]
                    ).map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column}
                        checked={historyVisibleColumns.has(column)}
                        onCheckedChange={() => toggleHistoryColumn(column)}
                        disabled={column === "teamName"}
                      >
                        {HISTORY_COLUMN_LABELS[column]}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <DataTable>
              <DataTableHeader>
                <tr>
                  {historyVisibleColumns.has("teamName") && (
                    <DataTableColumnHeader
                      title="Team Name"
                      sortable
                      sortDirection={historyTeamNameSort}
                      onSortChange={handleHistoryTeamNameSort}
                      filterable
                      filterOptions={historyTeamNameOptions}
                      selectedFilters={historySelectedTeams}
                      onFilterChange={setHistorySelectedTeams}
                    />
                  )}
                  {historyVisibleColumns.has("clubOwner") && (
                    <DataTableHead>Club Owner</DataTableHead>
                  )}
                  {historyVisibleColumns.has("event") && (
                    <DataTableColumnHeader
                      title="Event"
                      sortable
                      sortDirection={historyEventSort}
                      onSortChange={handleHistoryEventSort}
                      filterable
                      filterOptions={historyEventOptions}
                      selectedFilters={historySelectedEvents}
                      onFilterChange={setHistorySelectedEvents}
                    />
                  )}
                  {historyVisibleColumns.has("invoice") && (
                    <DataTableHead>Invoice</DataTableHead>
                  )}
                  {historyVisibleColumns.has("paidBy") && (
                    <DataTableColumnHeader
                      title="Paid By"
                      sortable
                      sortDirection={historyPaidBySort}
                      onSortChange={handleHistoryPaidBySort}
                      filterable
                      filterOptions={historyPaidByOptions}
                      selectedFilters={historySelectedPaidBy}
                      onFilterChange={setHistorySelectedPaidBy}
                    />
                  )}
                  {historyVisibleColumns.has("note") && (
                    <DataTableHead>Note</DataTableHead>
                  )}
                  {historyVisibleColumns.has("date") && (
                    <DataTableColumnHeader
                      title="Date"
                      className="text-right"
                      sortable
                      sortDirection={historyDateSort}
                      onSortChange={handleHistoryDateSort}
                    />
                  )}
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {filteredHistoryData.length > 0 ? (
                  filteredHistoryData.map((entry, index) => (
                    <DataTableRow key={entry.id} animationDelay={index * 40}>
                      {historyVisibleColumns.has("teamName") && (
                        <DataTableCell className="font-medium text-foreground">
                          {entry.teamName}
                        </DataTableCell>
                      )}
                      {historyVisibleColumns.has("clubOwner") && (
                        <DataTableCell className="text-muted-foreground">
                          {entry.clubOwner}
                        </DataTableCell>
                      )}
                      {historyVisibleColumns.has("event") && (
                        <DataTableCell>
                          <div className="flex flex-col">
                            <span className="text-foreground">
                              {entry.eventName}
                            </span>
                          </div>
                        </DataTableCell>
                      )}
                      {historyVisibleColumns.has("invoice") && (
                        <DataTableCell>
                          <Link
                            href={`/organizer/invoices/invoice/${entry.id}`}
                            className="inline-flex items-center gap-1.5 text-primary hover:underline"
                          >
                            #{entry.invoiceNumber}
                            <ExternalLinkIcon className="size-3" />
                          </Link>
                        </DataTableCell>
                      )}
                      {historyVisibleColumns.has("paidBy") && (
                        <DataTableCell className="text-foreground">
                          {entry.paidByOrganizer}
                        </DataTableCell>
                      )}
                      {historyVisibleColumns.has("note") && (
                        <DataTableCell className="max-w-[200px] truncate text-muted-foreground">
                          {entry.paymentNote || "—"}
                        </DataTableCell>
                      )}
                      {historyVisibleColumns.has("date") && (
                        <DataTableCell className="text-right text-muted-foreground">
                          {entry.changeDateFormatted}
                        </DataTableCell>
                      )}
                    </DataTableRow>
                  ))
                ) : (
                  <DataTableRow>
                    <DataTableCell
                      colSpan={historyVisibleColumns.size}
                      className="p-8 text-center text-sm text-muted-foreground"
                    >
                      {historySearch
                        ? "No payment history matches your search."
                        : "No payment history available."}
                    </DataTableCell>
                  </DataTableRow>
                )}
              </DataTableBody>
            </DataTable>

            {filteredHistoryData.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredHistoryData.length} of {historyData.length}{" "}
                payment records
                {filteredHistoryData.length < historyData.length &&
                  " (filtered)"}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
