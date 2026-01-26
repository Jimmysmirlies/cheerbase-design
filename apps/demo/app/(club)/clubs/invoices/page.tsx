"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@workspace/ui/shadcn/card";
import { Badge } from "@workspace/ui/shadcn/badge";
import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import { cn } from "@workspace/ui/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/shadcn/dialog";
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

import { useAuth } from "@/components/providers/AuthProvider";
import { useClubData } from "@/hooks/useClubData";
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
import { formatCurrency, type RegistrationStatus } from "@/data/events/analytics";
import { Section } from "@/components/layout/Section";
import { PageTabs } from "@/components/ui/PageTabs";
import { CardSkeleton } from "@/components/ui";
import { fadeInUp } from "@/lib/animations";
import type { ClubData, RegisteredTeamDTO } from "@/lib/club-data";
import { formatHashBasedInvoiceNumber } from "@/lib/invoice-numbers";

type InvoicesTab = "registrations" | "history";

// Types for processed invoice data
// Each invoice can have multiple teams (when registered together)
type InvoiceTableRow = {
  id: string; // Parent registration ID or single registration ID
  teamNames: string[]; // All teams on this invoice
  teamIds: string[];
  eventName: string;
  eventId: string;
  organizer: string;
  invoiceNumber: string;
  invoiceHref: string;
  invoiceTotal: number;
  paymentDeadline: Date;
  paymentDeadlineFormatted: string;
  status: RegistrationStatus;
  teamCount: number;
};

type InvoiceHistoryEntry = {
  id: string;
  invoiceNumber: string;
  teamNames: string[];
  teamIds: string[];
  eventName: string;
  eventId: string;
  organizer: string;
  paidAt: Date;
  paidAtFormatted: string;
  invoiceTotal: number;
  paidByOrganizer: string;
  paymentNote: string;
  teamCount: number;
};

type OverviewData = {
  totalRegistrations: number;
  totalParticipants: number;
  revenuePaid: number;
  revenueOutstanding: number;
  overdueAmount: number;
};

// Process club data into invoice table rows
function processClubDataForInvoices(data: ClubData | null): {
  overview: OverviewData;
  tableData: InvoiceTableRow[];
  historyData: InvoiceHistoryEntry[];
} {
  if (!data) {
    return {
      overview: { totalRegistrations: 0, totalParticipants: 0, revenuePaid: 0, revenueOutstanding: 0, overdueAmount: 0 },
      tableData: [],
      historyData: [],
    };
  }

  const { registrations, registeredTeams } = data;
  const now = new Date();

  // Build team lookup from registered teams
  const teamMap = new Map<string, RegisteredTeamDTO>();
  registeredTeams.forEach((rt) => {
    teamMap.set(rt.id, rt);
    if (rt.sourceTeamId) {
      teamMap.set(`rt-${rt.sourceTeamId}`, rt);
    }
  });

  // Calculate overview
  let totalRegistrations = 0;
  let totalParticipants = 0;
  let revenuePaid = 0;
  let revenueOutstanding = 0;
  let overdueAmount = 0;

  registrations.forEach((reg) => {
    totalRegistrations++;
    totalParticipants += reg.athletes ?? 0;
    const amount = reg.invoiceTotal;

    if (reg.status === "paid") {
      revenuePaid += amount;
    } else {
      revenueOutstanding += amount;
      if (reg.paymentDeadline) {
        const deadline = new Date(reg.paymentDeadline);
        if (deadline < now) {
          overdueAmount += amount;
        }
      }
    }
  });

  // Group registrations by parent registration ID (for multi-team invoices)
  // If no parent, the registration is its own group
  const invoiceGroups = new Map<string, typeof registrations>();

  registrations.forEach((reg) => {
    const groupKey = reg._parentRegistrationId ?? reg.id;
    const existing = invoiceGroups.get(groupKey) ?? [];
    existing.push(reg);
    invoiceGroups.set(groupKey, existing);
  });

  // Build table rows from grouped registrations
  const tableRows: InvoiceTableRow[] = [];

  invoiceGroups.forEach((groupRegs, groupId) => {
    // Skip empty groups (should not happen but TypeScript requires check)
    if (groupRegs.length === 0) return;

    // Use the first registration for shared data (event, organizer, deadline)
    const firstReg = groupRegs[0]!;
    const paymentDeadline = firstReg.paymentDeadline ? new Date(firstReg.paymentDeadline) : new Date();

    // Collect all team names and IDs
    const teamNames: string[] = [];
    const teamIds: string[] = [];
    let totalAmount = 0;

    groupRegs.forEach((reg) => {
      const registeredTeamId = reg.registeredTeamId ?? `rt-${reg.teamId}`;
      const registeredTeam = teamMap.get(registeredTeamId);
      const teamName = registeredTeam?.name ?? reg.teamId ?? "Unknown Team";
      teamNames.push(teamName);
      teamIds.push(reg.teamId ?? "");
      totalAmount += reg.invoiceTotal;
    });

    // Determine status based on payment state
    let status: RegistrationStatus = "unpaid";
    const allPaid = groupRegs.every((r) => r.status === "paid");
    if (allPaid) {
      status = "paid";
    } else if (paymentDeadline < now) {
      status = "overdue";
    }

    // Use stored invoice number if available, otherwise fall back to legacy hash-based
    const invoiceNumber =
      firstReg.invoiceNumber ?? formatHashBasedInvoiceNumber(groupId, firstReg.eventId);

    tableRows.push({
      id: groupId,
      teamNames,
      teamIds,
      eventName: firstReg.eventName,
      eventId: firstReg.eventId,
      organizer: firstReg.organizer,
      invoiceNumber,
      invoiceHref: `/clubs/registrations/${groupId}/invoice`,
      invoiceTotal: totalAmount,
      paymentDeadline,
      paymentDeadlineFormatted: paymentDeadline.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status,
      teamCount: teamNames.length,
    });
  });

  // Sort: unpaid/overdue first, then by deadline
  tableRows.sort((a, b) => {
    if (a.status !== "paid" && b.status === "paid") return -1;
    if (a.status === "paid" && b.status !== "paid") return 1;
    return a.paymentDeadline.getTime() - b.paymentDeadline.getTime();
  });

  // Build history rows (paid invoices only) - grouped by parent registration
  const historyRows: InvoiceHistoryEntry[] = [];

  invoiceGroups.forEach((groupRegs, groupId) => {
    // Skip empty groups
    if (groupRegs.length === 0) return;

    // Only include fully paid invoices
    const allPaid = groupRegs.every((r) => r.status === "paid" && r.paidAt);
    if (!allPaid) return;

    const firstReg = groupRegs[0]!;
    const paidAt = new Date(firstReg.paidAt!);

    // Collect all team names and IDs
    const teamNames: string[] = [];
    const teamIds: string[] = [];
    let totalAmount = 0;

    groupRegs.forEach((reg) => {
      const registeredTeamId = reg.registeredTeamId ?? `rt-${reg.teamId}`;
      const registeredTeam = teamMap.get(registeredTeamId);
      const teamName = registeredTeam?.name ?? reg.teamId ?? "Unknown Team";
      teamNames.push(teamName);
      teamIds.push(reg.teamId ?? "");
      totalAmount += reg.invoiceTotal;
    });

    // Use stored invoice number if available, otherwise fall back to legacy hash-based
    const invoiceNumber =
      firstReg.invoiceNumber ?? formatHashBasedInvoiceNumber(groupId, firstReg.eventId);

    historyRows.push({
      id: groupId,
      invoiceNumber,
      teamNames,
      teamIds,
      eventName: firstReg.eventName,
      eventId: firstReg.eventId,
      organizer: firstReg.organizer,
      paidAt,
      paidAtFormatted: paidAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      invoiceTotal: totalAmount,
      paidByOrganizer: "Unknown", // Not available in RegistrationDTO
      paymentNote: "", // Not available in RegistrationDTO
      teamCount: teamNames.length,
    });
  });

  // Sort by paid date (newest first)
  historyRows.sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime());

  return {
    overview: { totalRegistrations, totalParticipants, revenuePaid, revenueOutstanding, overdueAmount },
    tableData: tableRows,
    historyData: historyRows,
  };
}

type ColumnKey =
  | "event"
  | "teamName"
  | "organizer"
  | "invoice"
  | "dueDate"
  | "amount"
  | "status";

const COLUMN_LABELS: Record<ColumnKey, string> = {
  event: "Event",
  teamName: "Team",
  organizer: "Organizer",
  invoice: "Invoice",
  dueDate: "Due Date",
  amount: "Amount",
  status: "Status",
};

type HistoryColumnKey =
  | "event"
  | "teamName"
  | "organizer"
  | "invoice"
  | "amount"
  | "paidDate";

const HISTORY_COLUMN_LABELS: Record<HistoryColumnKey, string> = {
  event: "Event",
  teamName: "Team",
  organizer: "Organizer",
  invoice: "Invoice",
  amount: "Amount",
  paidDate: "Paid Date",
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

export default function ClubInvoicesPage() {
  const { user, status: authStatus } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<InvoicesTab>("registrations");
  const [historySearch, setHistorySearch] = useState("");
  const [selectedPayment, setSelectedPayment] =
    useState<InvoiceHistoryEntry | null>(null);
  const [selectedRegistration, setSelectedRegistration] =
    useState<InvoiceTableRow | null>(null);

  // Auth check
  useEffect(() => {
    if (authStatus === "loading") return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (user.role !== "club_owner") {
      router.replace(user.role === "organizer" ? "/organizer" : "/");
    }
  }, [user, authStatus, router]);

  // Use the same data source as the registrations page
  const { data: clubData, loading: clubDataLoading } = useClubData(user?.id);

  // Process club data into invoice format
  const { overview, tableData, historyData } = useMemo(
    () => processClubDataForInvoices(clubData),
    [clubData],
  );

  // Screen size detection for responsive columns
  const [screenSize, setScreenSize] = useState<"sm" | "md" | "lg">("lg");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getScreenSize = () => {
      if (window.innerWidth >= 1024) return "lg";
      if (window.innerWidth >= 768) return "md";
      return "sm";
    };

    setScreenSize(getScreenSize());

    const handleResize = () => {
      setScreenSize(getScreenSize());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive column defaults based on screen size
  const getResponsiveColumns = useCallback((): Set<ColumnKey> => {
    if (screenSize === "lg") {
      return new Set([
        "event",
        "teamName",
        "organizer",
        "invoice",
        "dueDate",
        "amount",
        "status",
      ]);
    }
    if (screenSize === "md") {
      return new Set(["event", "teamName", "invoice", "amount", "status"]);
    }
    return new Set(["event", "amount", "status"]);
  }, [screenSize]);

  const getResponsiveHistoryColumns = useCallback((): Set<HistoryColumnKey> => {
    if (screenSize === "lg") {
      return new Set([
        "event",
        "teamName",
        "organizer",
        "invoice",
        "amount",
        "paidDate",
      ]);
    }
    if (screenSize === "md") {
      return new Set(["event", "teamName", "invoice", "amount"]);
    }
    return new Set(["event", "amount"]);
  }, [screenSize]);

  // Table state - synced with screen size
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set(["event", "amount", "status"]),
  );

  const [historyVisibleColumns, setHistoryVisibleColumns] = useState<
    Set<HistoryColumnKey>
  >(new Set(["event", "amount"]));

  // Sync visible columns with screen size on mount and resize
  useEffect(() => {
    setVisibleColumns(getResponsiveColumns());
  }, [getResponsiveColumns]);

  useEffect(() => {
    setHistoryVisibleColumns(getResponsiveHistoryColumns());
  }, [getResponsiveHistoryColumns]);

  // Sorting state
  const [teamNameSort, setTeamNameSort] = useState<TableSortDirection>(null);
  const [eventSort, setEventSort] = useState<TableSortDirection>(null);
  const [invoiceSort, setInvoiceSort] = useState<TableSortDirection>(null);
  const [dueDateSort, setDueDateSort] = useState<TableSortDirection>("asc");
  const [statusSort, setStatusSort] = useState<TableSortDirection>(null);

  const [historyTeamNameSort, setHistoryTeamNameSort] =
    useState<TableSortDirection>(null);
  const [historyEventSort, setHistoryEventSort] =
    useState<TableSortDirection>(null);
  const [historyPaidDateSort, setHistoryPaidDateSort] =
    useState<TableSortDirection>("desc");

  // Filter state
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    new Set(["paid", "unpaid", "overdue"]),
  );

  const [historySelectedTeams, setHistorySelectedTeams] = useState<Set<string>>(
    new Set(),
  );
  const [historySelectedEvents, setHistorySelectedEvents] = useState<
    Set<string>
  >(new Set());

  // Initialize filters
  useEffect(() => {
    // Flatten all team names from all invoices
    const allTeamNames = tableData.flatMap((row) => row.teamNames);
    setSelectedTeams(new Set(allTeamNames));
    setSelectedEvents(new Set(tableData.map((row) => row.eventName)));
  }, [tableData]);

  useEffect(() => {
    const allHistoryTeamNames = historyData.flatMap((entry) => entry.teamNames);
    setHistorySelectedTeams(new Set(allHistoryTeamNames));
    setHistorySelectedEvents(
      new Set(historyData.map((entry) => entry.eventName)),
    );
  }, [historyData]);

  // Filter options
  const teamNameOptions = useMemo(
    () =>
      [...new Set(tableData.flatMap((row) => row.teamNames))]
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

  const historyTeamNameOptions = useMemo(
    () =>
      [...new Set(historyData.flatMap((entry) => entry.teamNames))]
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

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    let data = [...tableData];

    // Show invoice if ANY of its teams match the selected teams
    data = data.filter((row) => row.teamNames.some((name) => selectedTeams.has(name)));
    data = data.filter((row) => selectedEvents.has(row.eventName));
    data = data.filter((row) => selectedStatuses.has(row.status));

    if (teamNameSort) {
      data.sort((a, b) => {
        // Sort by first team name in the group
        const diff = (a.teamNames[0] ?? "").localeCompare(b.teamNames[0] ?? "");
        return teamNameSort === "asc" ? diff : -diff;
      });
    } else if (eventSort) {
      data.sort((a, b) => {
        const diff = a.eventName.localeCompare(b.eventName);
        return eventSort === "asc" ? diff : -diff;
      });
    } else if (invoiceSort) {
      data.sort((a, b) => {
        const diff = a.invoiceNumber.localeCompare(b.invoiceNumber);
        return invoiceSort === "asc" ? diff : -diff;
      });
    } else if (dueDateSort) {
      data.sort((a, b) => {
        const diff =
          a.paymentDeadline.getTime() - b.paymentDeadline.getTime();
        return dueDateSort === "asc" ? diff : -diff;
      });
    } else if (statusSort) {
      const statusOrder = { overdue: 0, unpaid: 1, paid: 2 };
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
    eventSort,
    invoiceSort,
    dueDateSort,
    statusSort,
  ]);

  const filteredHistoryData = useMemo(() => {
    let data = [...historyData];

    // Show invoice if ANY of its teams match the selected teams
    data = data.filter((entry) => entry.teamNames.some((name) => historySelectedTeams.has(name)));
    data = data.filter((entry) => historySelectedEvents.has(entry.eventName));

    if (historySearch.trim()) {
      const searchLower = historySearch.toLowerCase();
      data = data.filter(
        (entry) =>
          entry.invoiceNumber.toLowerCase().includes(searchLower) ||
          entry.teamNames.some((name) => name.toLowerCase().includes(searchLower)) ||
          entry.eventName.toLowerCase().includes(searchLower) ||
          entry.organizer.toLowerCase().includes(searchLower),
      );
    }

    if (historyTeamNameSort) {
      data.sort((a, b) => {
        const diff = (a.teamNames[0] ?? "").localeCompare(b.teamNames[0] ?? "");
        return historyTeamNameSort === "asc" ? diff : -diff;
      });
    } else if (historyEventSort) {
      data.sort((a, b) => {
        const diff = a.eventName.localeCompare(b.eventName);
        return historyEventSort === "asc" ? diff : -diff;
      });
    } else if (historyPaidDateSort) {
      data.sort((a, b) => {
        const diff = a.paidAt.getTime() - b.paidAt.getTime();
        return historyPaidDateSort === "asc" ? diff : -diff;
      });
    }

    return data;
  }, [
    historyData,
    historySelectedTeams,
    historySelectedEvents,
    historySearch,
    historyTeamNameSort,
    historyEventSort,
    historyPaidDateSort,
  ]);

  // Sort handlers
  const handleTeamNameSort = (dir: TableSortDirection) => {
    setTeamNameSort(dir);
    if (dir) {
      setEventSort(null);
      setInvoiceSort(null);
      setDueDateSort(null);
      setStatusSort(null);
    }
  };
  const handleEventSort = (dir: TableSortDirection) => {
    setEventSort(dir);
    if (dir) {
      setTeamNameSort(null);
      setInvoiceSort(null);
      setDueDateSort(null);
      setStatusSort(null);
    }
  };
  const handleInvoiceSort = (dir: TableSortDirection) => {
    setInvoiceSort(dir);
    if (dir) {
      setTeamNameSort(null);
      setEventSort(null);
      setDueDateSort(null);
      setStatusSort(null);
    }
  };
  const handleDueDateSort = (dir: TableSortDirection) => {
    setDueDateSort(dir);
    if (dir) {
      setTeamNameSort(null);
      setEventSort(null);
      setInvoiceSort(null);
      setStatusSort(null);
    }
  };
  const handleStatusSort = (dir: TableSortDirection) => {
    setStatusSort(dir);
    if (dir) {
      setTeamNameSort(null);
      setEventSort(null);
      setInvoiceSort(null);
      setDueDateSort(null);
    }
  };

  const handleHistoryTeamNameSort = (dir: TableSortDirection) => {
    setHistoryTeamNameSort(dir);
    if (dir) {
      setHistoryEventSort(null);
      setHistoryPaidDateSort(null);
    }
  };
  const handleHistoryEventSort = (dir: TableSortDirection) => {
    setHistoryEventSort(dir);
    if (dir) {
      setHistoryTeamNameSort(null);
      setHistoryPaidDateSort(null);
    }
  };
  const handleHistoryPaidDateSort = (dir: TableSortDirection) => {
    setHistoryPaidDateSort(dir);
    if (dir) {
      setHistoryTeamNameSort(null);
      setHistoryEventSort(null);
    }
  };

  // Column toggle
  const toggleColumn = (column: ColumnKey) => {
    if (column === "event") return; // Event is always visible

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

  const toggleHistoryColumn = (column: HistoryColumnKey) => {
    if (column === "event") return; // Event is always visible
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

  // Filter status
  const hasActiveFilters = useMemo(() => {
    const allTeamsSelected = selectedTeams.size === teamNameOptions.length;
    const allEventsSelected = selectedEvents.size === eventOptions.length;
    const allStatusesSelected = selectedStatuses.size === statusOptions.length;
    const hasActiveFilters =
      !allTeamsSelected || !allEventsSelected || !allStatusesSelected;

    const hasActiveSorts =
      teamNameSort !== null ||
      eventSort !== null ||
      invoiceSort !== null ||
      (dueDateSort !== null && dueDateSort !== "asc") ||
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
    eventSort,
    invoiceSort,
    dueDateSort,
    statusSort,
  ]);

  const clearFilters = () => {
    setSelectedTeams(new Set(teamNameOptions.map((opt) => opt.value)));
    setSelectedEvents(new Set(eventOptions.map((opt) => opt.value)));
    setSelectedStatuses(new Set(statusOptions.map((opt) => opt.value)));
    setTeamNameSort(null);
    setEventSort(null);
    setInvoiceSort(null);
    setDueDateSort("asc");
    setStatusSort(null);
  };

  const historyHasActiveFilters = useMemo(() => {
    const allTeamsSelected =
      historySelectedTeams.size === historyTeamNameOptions.length;
    const allEventsSelected =
      historySelectedEvents.size === historyEventOptions.length;
    const hasActiveFilters = !allTeamsSelected || !allEventsSelected;

    const hasActiveSorts =
      historyTeamNameSort !== null ||
      historyEventSort !== null ||
      (historyPaidDateSort !== null && historyPaidDateSort !== "desc");

    return hasActiveFilters || hasActiveSorts;
  }, [
    historySelectedTeams,
    historySelectedEvents,
    historyTeamNameOptions.length,
    historyEventOptions.length,
    historyTeamNameSort,
    historyEventSort,
    historyPaidDateSort,
  ]);

  const clearHistoryFilters = () => {
    setHistorySelectedTeams(
      new Set(historyTeamNameOptions.map((opt) => opt.value)),
    );
    setHistorySelectedEvents(
      new Set(historyEventOptions.map((opt) => opt.value)),
    );
    setHistoryTeamNameSort(null);
    setHistoryEventSort(null);
    setHistoryPaidDateSort("desc");
  };

  if (authStatus === "loading" || clubDataLoading) {
    return (
      <section className="mx-auto min-w-0 w-full max-w-6xl">
        <h1 className="heading-2">Invoices</h1>
        <div className="flex flex-col gap-4 pt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
          <div className="pt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} rows={3} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!user || user.role !== "club_owner") return null;

  const hasOverdue = overview.overdueAmount > 0;

  return (
    <section className="mx-auto min-w-0 w-full max-w-6xl">
      <h1 className="heading-2">Invoices</h1>

      <div className="pt-6">
        <PageTabs
          tabs={[
            { id: "registrations", label: "Registrations" },
            { id: "history", label: "Payment History" },
          ]}
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as InvoicesTab)}
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
              <Section title="Overview" showDivider={false}>
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
                        Total Athletes
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
                        Total Paid
                      </p>
                      <DollarSignIcon className="size-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-semibold">
                        {formatCurrency(overview.revenuePaid)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Payments completed
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
                              disabled={column === "event"}
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
                      {visibleColumns.has("teamName") && (
                        <DataTableColumnHeader
                          title="Team"
                          sortable
                          sortDirection={teamNameSort}
                          onSortChange={handleTeamNameSort}
                          filterable
                          filterOptions={teamNameOptions}
                          selectedFilters={selectedTeams}
                          onFilterChange={setSelectedTeams}
                        />
                      )}
                      {visibleColumns.has("organizer") && (
                        <DataTableHead>Organizer</DataTableHead>
                      )}
                      {visibleColumns.has("invoice") && (
                        <DataTableColumnHeader
                          title="Invoice"
                          sortable
                          sortDirection={invoiceSort}
                          onSortChange={handleInvoiceSort}
                        />
                      )}
                      {visibleColumns.has("dueDate") && (
                        <DataTableColumnHeader
                          title="Due Date"
                          sortable
                          sortDirection={dueDateSort}
                          onSortChange={handleDueDateSort}
                        />
                      )}
                      {visibleColumns.has("amount") && (
                        <DataTableHead>Amount</DataTableHead>
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
                        <DataTableRow
                          key={row.id}
                          animationDelay={index * 40}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedRegistration(row)}
                        >
                          {visibleColumns.has("event") && (
                            <DataTableCell className="font-medium text-foreground">
                              {row.eventName}
                            </DataTableCell>
                          )}
                          {visibleColumns.has("teamName") && (
                            <DataTableCell>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-foreground">{row.teamNames[0]}</span>
                                {row.teamCount > 1 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{row.teamCount - 1} more team{row.teamCount > 2 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            </DataTableCell>
                          )}
                          {visibleColumns.has("organizer") && (
                            <DataTableCell className="text-muted-foreground">
                              {row.organizer}
                            </DataTableCell>
                          )}
                          {visibleColumns.has("invoice") && (
                            <DataTableCell>
                              <Link
                                href={row.invoiceHref}
                                className="inline-flex items-center gap-1.5 text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                #{row.invoiceNumber}
                                <ExternalLinkIcon className="size-3" />
                              </Link>
                            </DataTableCell>
                          )}
                          {visibleColumns.has("dueDate") && (
                            <DataTableCell className="text-muted-foreground">
                              {row.paymentDeadlineFormatted}
                            </DataTableCell>
                          )}
                          {visibleColumns.has("amount") && (
                            <DataTableCell className="text-foreground font-medium">
                              {formatCurrency(row.invoiceTotal)}
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
                  placeholder="Search by invoice number, team name, event, or organizer..."
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
                        disabled={column === "event"}
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
                  {historyVisibleColumns.has("teamName") && (
                    <DataTableColumnHeader
                      title="Team"
                      sortable
                      sortDirection={historyTeamNameSort}
                      onSortChange={handleHistoryTeamNameSort}
                      filterable
                      filterOptions={historyTeamNameOptions}
                      selectedFilters={historySelectedTeams}
                      onFilterChange={setHistorySelectedTeams}
                    />
                  )}
                  {historyVisibleColumns.has("organizer") && (
                    <DataTableHead>Organizer</DataTableHead>
                  )}
                  {historyVisibleColumns.has("invoice") && (
                    <DataTableHead>Invoice</DataTableHead>
                  )}
                  {historyVisibleColumns.has("amount") && (
                    <DataTableHead>Amount</DataTableHead>
                  )}
                  {historyVisibleColumns.has("paidDate") && (
                    <DataTableColumnHeader
                      title="Paid Date"
                      className="text-right"
                      sortable
                      sortDirection={historyPaidDateSort}
                      onSortChange={handleHistoryPaidDateSort}
                    />
                  )}
                </tr>
              </DataTableHeader>
              <DataTableBody>
                {filteredHistoryData.length > 0 ? (
                  filteredHistoryData.map((entry, index) => (
                    <DataTableRow
                      key={entry.id}
                      animationDelay={index * 40}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedPayment(entry)}
                    >
                      {historyVisibleColumns.has("event") && (
                        <DataTableCell className="font-medium text-foreground">
                          {entry.eventName}
                        </DataTableCell>
                      )}
                      {historyVisibleColumns.has("teamName") && (
                        <DataTableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-foreground">{entry.teamNames[0]}</span>
                            {entry.teamCount > 1 && (
                              <span className="text-xs text-muted-foreground">
                                +{entry.teamCount - 1} more team{entry.teamCount > 2 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </DataTableCell>
                      )}
                      {historyVisibleColumns.has("organizer") && (
                        <DataTableCell className="text-muted-foreground">
                          {entry.organizer}
                        </DataTableCell>
                      )}
                      {historyVisibleColumns.has("invoice") && (
                        <DataTableCell className="text-foreground">
                          #{entry.invoiceNumber}
                        </DataTableCell>
                      )}
                      {historyVisibleColumns.has("amount") && (
                        <DataTableCell className="text-foreground font-medium">
                          {formatCurrency(entry.invoiceTotal)}
                        </DataTableCell>
                      )}
                      {historyVisibleColumns.has("paidDate") && (
                        <DataTableCell className="text-right text-muted-foreground">
                          {entry.paidAtFormatted}
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

      {/* Payment Detail Modal */}
      <Dialog
        open={selectedPayment !== null}
        onOpenChange={(open) => !open && setSelectedPayment(null)}
      >
        <DialogContent className="max-w-md rounded-xl border-border/40 p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
            <DialogTitle className="heading-3">Payment Details</DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className="px-6 py-5 space-y-4">
              {/* Invoice Number */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Invoice
                </p>
                <p className="body-text font-medium">
                  #{selectedPayment.invoiceNumber}
                </p>
              </div>

              {/* Team Names */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {selectedPayment.teamCount > 1 ? "Teams" : "Team"}
                </p>
                <div className="body-text">
                  {selectedPayment.teamNames.map((name, idx) => (
                    <p key={idx}>{name}</p>
                  ))}
                </div>
              </div>

              {/* Event */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Event
                </p>
                <p className="body-text">{selectedPayment.eventName}</p>
              </div>

              {/* Organizer */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Organizer
                </p>
                <p className="body-text">{selectedPayment.organizer}</p>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Amount
                </p>
                <p className="body-text font-medium">
                  {formatCurrency(selectedPayment.invoiceTotal)}
                </p>
              </div>

              {/* Received By */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Received By
                </p>
                <p className="body-text">{selectedPayment.paidByOrganizer}</p>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Paid Date
                </p>
                <p className="body-text">{selectedPayment.paidAtFormatted}</p>
              </div>

              {/* Note */}
              {selectedPayment.paymentNote && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Note
                  </p>
                  <div className="rounded-lg bg-muted/50 border border-border/40 p-4">
                    <p className="body-text text-foreground whitespace-pre-wrap">
                      {selectedPayment.paymentNote}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-end">
            <Button variant="ghost" onClick={() => setSelectedPayment(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Registration Detail Modal */}
      <Dialog
        open={selectedRegistration !== null}
        onOpenChange={(open) => !open && setSelectedRegistration(null)}
      >
        <DialogContent className="max-w-md rounded-xl border-border/40 p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40">
            <DialogTitle className="heading-3">Registration Details</DialogTitle>
          </DialogHeader>

          {selectedRegistration && (
            <div className="px-6 py-5 space-y-4">
              {/* Invoice Number */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Invoice
                </p>
                <p className="body-text font-medium">
                  #{selectedRegistration.invoiceNumber}
                </p>
              </div>

              {/* Event */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Event
                </p>
                <p className="body-text">{selectedRegistration.eventName}</p>
              </div>

              {/* Team Names */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {selectedRegistration.teamCount > 1 ? "Teams" : "Team"}
                </p>
                <div className="body-text">
                  {selectedRegistration.teamNames.map((name, idx) => (
                    <p key={idx}>{name}</p>
                  ))}
                </div>
              </div>

              {/* Organizer */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Organizer
                </p>
                <p className="body-text">{selectedRegistration.organizer}</p>
              </div>

              {/* Due Date */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Due Date
                </p>
                <p className="body-text">
                  {selectedRegistration.paymentDeadlineFormatted}
                </p>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Amount
                </p>
                <p className="body-text font-medium">
                  {formatCurrency(selectedRegistration.invoiceTotal)}
                </p>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-medium",
                    getStatusBadgeVariant(selectedRegistration.status),
                  )}
                >
                  {selectedRegistration.status.charAt(0).toUpperCase() +
                    selectedRegistration.status.slice(1)}
                </Badge>
              </div>
            </div>
          )}

          <div className="px-6 py-4 border-t border-border/40 bg-muted/30 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setSelectedRegistration(null)}
            >
              Close
            </Button>
            <Button asChild>
              <Link href={selectedRegistration?.invoiceHref ?? "#"}>
                View Invoice
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
