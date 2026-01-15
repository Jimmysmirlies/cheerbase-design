"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  PencilIcon,
} from "lucide-react";
import { motion } from "framer-motion";

import { OrganizerEventActionBar } from "@/components/features/events/OrganizerEventActionBar";
import { PageTitle } from "@/components/layout/PageTitle";
import {
  type BrandGradient,
  getGradientStartColor,
} from "@/lib/gradients";
import { UnifiedEventDetailBody } from "./UnifiedEventDetailBody";
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
  formatCurrency,
  type RegistrationStatus,
} from "@/data/events/analytics";
import { fadeInUp } from "@/lib/animations";
import { Section } from "@/components/layout/Section";

type OrganizerEventDetailContentProps = {
  /** Event data object */
  event: {
    id: string;
    name: string;
    date: string;
    description: string;
    organizer: string;
    location: string;
  };
  /** Organizer gradient for styling */
  organizerGradient: BrandGradient;
  /** Organizer followers count (formatted) */
  organizerFollowers?: string;
  /** Organizer events count */
  organizerEventsCount?: number;
  /** Organizer hosting duration (formatted) */
  organizerHostingDuration?: string;
  /** Gallery images for display */
  galleryImages?: string[];
  /** Event date parts for display */
  eventDateParts?: {
    month: string;
    day: string;
    weekday: string;
    fullDate: string;
  };
  /** Venue name */
  venueName?: string;
  /** City and state */
  cityState?: string;
  /** Registration deadline ISO string */
  registrationDeadlineISO?: string;
  /** Whether registration is closed */
  registrationClosed?: boolean;
  /** Timeline phases for display */
  timelinePhases?: {
    id: string;
    title: string;
    subtitle: string | null;
    border: string;
    background: string;
    dot: string;
    usesGradient: boolean;
    gradientBg?: string;
    borderColor?: string;
    dotColor?: string;
    isCurrent: boolean;
  }[];
  /** Pricing deadline label */
  pricingDeadlineLabel?: string;
  /** Pricing rows for display */
  pricingRows?: {
    label: string;
    subtitle: string;
    before: string;
    after: string;
  }[];
  /** Documents for display */
  documents?: { name: string; description: string; href: string }[];
  /** Whether event is a draft */
  isDraft?: boolean;
  /** Organizer page gradient override */
  organizerPageGradient?: BrandGradient;
  /** Organizer ID */
  organizerId?: string;
};

type ColumnKey =
  | "teamName"
  | "clubName"
  | "submittedAt"
  | "invoice"
  | "amount"
  | "status";

const COLUMN_LABELS: Record<ColumnKey, string> = {
  teamName: "Team Name",
  clubName: "Club",
  submittedAt: "Submitted",
  invoice: "Invoice",
  amount: "Amount",
  status: "Status",
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

function EventRegistrationsTab({
  eventId,
  organizerId,
}: {
  eventId: string;
  organizerId?: string;
}) {
  // Get table data filtered by eventId
  const tableData = useMemo(() => {
    if (!organizerId) return [];
    return getRegistrationTableData(organizerId).filter(
      (row) => row.eventId === eventId,
    );
  }, [organizerId, eventId]);

  // Calculate overview stats from filtered data
  const overview = useMemo(() => {
    if (!organizerId) return null;

    const registrations = getOrganizerRegistrations(organizerId).filter(
      (reg) => reg.eventId === eventId,
    );

    const now = new Date();
    let totalRegistrations = 0;
    let totalParticipants = 0;
    let revenuePaid = 0;
    let revenueOutstanding = 0;
    let overdueAmount = 0;

    registrations.forEach((reg) => {
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
  }, [organizerId, eventId]);

  // Table state
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set([
      "teamName",
      "clubName",
      "submittedAt",
      "invoice",
      "amount",
      "status",
    ]),
  );

  // Column sort state
  const [teamNameSort, setTeamNameSort] = useState<TableSortDirection>(null);
  const [submittedSort, setSubmittedSort] =
    useState<TableSortDirection>("desc");
  const [statusSort, setStatusSort] = useState<TableSortDirection>(null);

  // Column filter state
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    new Set(["paid", "unpaid", "overdue"]),
  );

  // Sync filter selections when tableData changes
  useEffect(() => {
    setSelectedTeams(new Set(tableData.map((row) => row.teamName)));
  }, [tableData]);

  // Unique options for filters
  const teamNameOptions = useMemo(
    () =>
      [...new Set(tableData.map((row) => row.teamName))]
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

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = [...tableData];

    // Apply column filters
    data = data.filter((row) => selectedTeams.has(row.teamName));
    data = data.filter((row) => selectedStatuses.has(row.status));

    // Apply sort
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
    selectedStatuses,
    teamNameSort,
    submittedSort,
    statusSort,
  ]);

  // Handle sort change
  const handleTeamNameSort = (dir: TableSortDirection) => {
    setTeamNameSort(dir);
    if (dir) {
      setSubmittedSort(null);
      setStatusSort(null);
    }
  };
  const handleSubmittedSort = (dir: TableSortDirection) => {
    setSubmittedSort(dir);
    if (dir) {
      setTeamNameSort(null);
      setStatusSort(null);
    }
  };
  const handleStatusSort = (dir: TableSortDirection) => {
    setStatusSort(dir);
    if (dir) {
      setTeamNameSort(null);
      setSubmittedSort(null);
    }
  };

  // Toggle column visibility
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

  // Check if any filters are applied
  const hasActiveFilters = useMemo(() => {
    const allTeamsSelected = selectedTeams.size === teamNameOptions.length;
    const allStatusesSelected = selectedStatuses.size === statusOptions.length;
    const hasFilters = !allTeamsSelected || !allStatusesSelected;
    const hasActiveSorts =
      teamNameSort !== null ||
      (submittedSort !== null && submittedSort !== "desc") ||
      statusSort !== null;
    return hasFilters || hasActiveSorts;
  }, [
    selectedTeams,
    selectedStatuses,
    teamNameOptions.length,
    statusOptions.length,
    teamNameSort,
    submittedSort,
    statusSort,
  ]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedTeams(new Set(teamNameOptions.map((opt) => opt.value)));
    setSelectedStatuses(new Set(statusOptions.map((opt) => opt.value)));
    setTeamNameSort(null);
    setSubmittedSort("desc");
    setStatusSort(null);
  };

  if (!overview) {
    return (
      <Section title="Registrations" showDivider={false}>
        <Card className="border-dashed border-border/70">
          <CardHeader>
            <p className="text-base font-semibold">No Registrations Yet</p>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Registrations will appear here once teams register for this event.
          </CardContent>
        </Card>
      </Section>
    );
  }

  const hasOverdue = overview.overdueAmount > 0;

  return (
    <>
      {/* Statistics Section */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
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
                <p className="mt-1 text-xs text-muted-foreground">
                  For this event
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
                <p className="mt-1 text-xs text-muted-foreground">
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
                <p className="mt-1 text-xs text-muted-foreground">
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
                  <p className="mt-1 text-xs text-amber-600">
                    {formatCurrency(overview.overdueAmount)} overdue
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pending payments
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </Section>
      </motion.div>

      {/* Registrations Table Section */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
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
                {visibleColumns.has("invoice") && (
                  <DataTableHead>Invoice</DataTableHead>
                )}
                {visibleColumns.has("amount") && (
                  <DataTableHead className="text-right">Amount</DataTableHead>
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
                    {visibleColumns.has("invoice") && (
                      <DataTableCell>
                        <Link
                          href={`${row.invoiceHref}?from=${encodeURIComponent(eventId)}`}
                          className="inline-flex items-center gap-1.5 text-primary hover:underline"
                        >
                          #{row.invoiceNumber}
                          <ExternalLinkIcon className="size-3" />
                        </Link>
                      </DataTableCell>
                    )}
                    {visibleColumns.has("amount") && (
                      <DataTableCell className="text-right text-muted-foreground">
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
                    {tableData.length === 0
                      ? "No registrations for this event yet."
                      : "No registrations match the current filters."}
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
    </>
  );
}

function EventSettingsTab({ eventId }: { eventId: string }) {
  void eventId;
  return (
    <Section title="Settings" showDivider={false}>
      <p className="body-text text-muted-foreground">
        Event settings content will be displayed here.
      </p>
    </Section>
  );
}

export function OrganizerEventDetailContent({
  event,
  organizerGradient,
  organizerFollowers,
  organizerEventsCount,
  organizerHostingDuration,
  galleryImages,
  eventDateParts,
  venueName,
  cityState,
  registrationDeadlineISO,
  registrationClosed,
  timelinePhases,
  pricingDeadlineLabel,
  pricingRows,
  documents,
  isDraft = false,
  organizerPageGradient,
  organizerId,
}: OrganizerEventDetailContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize tab from URL query param or default to 'event-page'
  const tabFromUrl = searchParams.get("tab");
  const validTab =
    tabFromUrl === "registrations" || tabFromUrl === "settings"
      ? tabFromUrl
      : "event-page";
  const [activeTab, setActiveTab] = useState(validTab);

  // Sync tab state with URL changes (e.g., when navigating back from invoice)
  useEffect(() => {
    setActiveTab(validTab);
  }, [validTab]);

  const handleEdit = () => {
    router.push(`/organizer/events/${event.id}/edit`);
  };

  // Get the gradient for the title
  const gradientKey = organizerPageGradient ?? organizerGradient ?? "primary";

  // Format the date for display
  const formatDateLabel = (date: string | Date): string => {
    const dateObj = new Date(date);
    if (Number.isNaN(dateObj.getTime())) return "";
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="mx-auto w-full max-w-7xl">
      {/* Header - no padding */}
      <PageTitle
        title={event.name}
        gradient={gradientKey}
        dateLabel={formatDateLabel(event.date)}
        locationLabel={event.location}
        actions={
          <Button variant="default" onClick={handleEdit}>
            <PencilIcon className="mr-2 size-4" />
            Edit Event
          </Button>
        }
      />

      {/* Action Bar - pt-6 (24px) */}
      <div className="pt-6">
        <OrganizerEventActionBar
          eventId={event.id}
          eventOrganizerName={event.organizer}
          isDraft={isDraft}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="unstyled"
          accentColor={getGradientStartColor(gradientKey)}
        />
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "event-page" && (
          <UnifiedEventDetailBody
            eventData={{
              id: event.id,
              name: event.name,
              date: event.date,
              description: event.description,
              organizer: event.organizer,
              location: event.location,
            }}
            organizerGradient={organizerGradient}
            organizerFollowers={organizerFollowers}
            organizerEventsCount={organizerEventsCount}
            organizerHostingDuration={organizerHostingDuration}
            hideRegistration
            displayProps={{
              galleryImages,
              eventDateParts,
              venueName,
              cityState,
              registrationDeadlineISO,
              registrationClosed,
              timelinePhases,
              pricingDeadlineLabel,
              pricingRows,
              documents,
            }}
          />
        )}

        {activeTab === "registrations" && (
          <EventRegistrationsTab eventId={event.id} organizerId={organizerId} />
        )}

        {activeTab === "settings" && <EventSettingsTab eventId={event.id} />}
      </div>
    </section>
  );
}
