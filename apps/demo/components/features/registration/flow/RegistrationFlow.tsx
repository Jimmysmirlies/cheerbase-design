"use client";

/**
 * RegistrationFlow
 *
 * Purpose
 * - Client-side flow for registering teams to an event outside of a modal context.
 *
 * Structure
 * - Page header describing the event
 * - Actions row with search input + "Register team" modal trigger
 * - Queued teams panel with division-grouped cards and totals footer
 * - Footer actions to clear the queue or submit registrations
 */
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import { Badge } from "@workspace/ui/shadcn/badge";
import { cn } from "@workspace/ui/lib/utils";

import {
  SearchIcon,
  UploadIcon,
  UserPlusIcon,
  UsersIcon,
  LayersIcon,
  WalletIcon,
  ChevronDownIcon,
} from "lucide-react";
// Link reserved for future navigation; keep import commented to suppress lint noise.
// import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "@workspace/ui/shadcn/sonner";

import { BulkUploadDialog } from "@/components/features/registration/bulk/BulkUploadDialog";
import { DivisionQueueSection } from "./DivisionQueueSection";
import type { Person, TeamRoster } from "@/types/club";
import type { DivisionPricing } from "@/types/events";
// formatting helpers used in TeamRow and other subcomponents
// (kept unused imports out of this module)
import { buildSnapshotHash, isRegistrationLocked } from "@/utils/registrations";

import { RegisterTeamModal } from "./RegisterTeamModal";
// TeamRow used in DivisionQueueSection; keep import local to that file
import {
  DEFAULT_ROLE,
  RegistrationEntry,
  RegistrationMember,
  TeamOption,
  EntryStatusMeta,
} from "./types";
import {
  getEntryMemberCount,
  groupEntriesByDivision,
} from "@/utils/registration-stats";
import { PricingReviewPage } from "./PricingReviewPage";

export type {
  TeamOption,
  RegistrationMember,
  RegistrationEntry,
} from "./types";

export type RegistrationFlowProps = {
  divisionPricing: DivisionPricing[];
  teams: TeamOption[];
  rosters?: TeamRoster[];
  initialEntries?: RegistrationEntry[];
  finalizeConfig?: Partial<FinalizeConfig>;
  readOnly?: boolean;
  onSubmit?: () => void;
  hideStats?: boolean;
  hideSubmitButton?: boolean;
  showPaymentMethods?: boolean;
  stepLabels?: {
    step1: string;
    step2: string;
  };
};

type FinalizeConfig = {
  ctaLabel: string;
  dialogTitle: string;
  dialogDescription: string;
  dialogConfirmLabel: string;
  redirectPath: string;
  onCtaHref?: string;
  summaryCard?: React.ReactNode;
  taxSummary?: {
    gstNumber: string;
    qstNumber: string;
    baseAmount: number;
    gstRate: number;
    qstRate: number;
  };
  ctaDisabled?: boolean;
  isReadOnly?: boolean;
};

const DEFAULT_FINALIZE_CONFIG: FinalizeConfig = {
  ctaLabel: "Finalize registration",
  dialogTitle: "Review and confirm",
  dialogDescription:
    "Double-check division totals and roster counts before submitting.",
  dialogConfirmLabel: "Submit registration",
  redirectPath: "/clubs?view=registrations",
  onCtaHref: undefined,
  ctaDisabled: false,
  isReadOnly: false,
};

// Section nickname: "Flow Shell" – orchestrates the primary registration workflow state.
export function RegistrationFlow({
  divisionPricing,
  teams,
  rosters,
  initialEntries = [],
  finalizeConfig,
  readOnly = false,
  onSubmit,
  hideStats = false,
  hideSubmitButton = false,
  showPaymentMethods = false,
  stepLabels = {
    step1: "Step 1 · Register Teams",
    step2: "Step 2 · Pricing",
  },
}: RegistrationFlowProps) {
  const divisionOptions = useMemo(
    () =>
      Array.from(new Set(divisionPricing.map((option) => option.name))).filter(
        Boolean,
      ),
    [divisionPricing],
  );
  const teamOptions = useMemo(() => teams.filter(Boolean), [teams]);
  const teamOptionsById = useMemo(() => {
    return teamOptions.reduce<Record<string, TeamOption>>((acc, team) => {
      acc[team.id] = team;
      return acc;
    }, {});
  }, [teamOptions]);
  const rosterMetaByTeamId = useMemo(() => {
    return (rosters ?? []).reduce<
      Record<string, { roster: TeamRoster; updatedAt?: string; hash?: string }>
    >((acc, roster) => {
      acc[roster.teamId] = {
        roster,
        updatedAt: roster.updatedAt,
        hash: buildSnapshotHash(roster),
      };
      return acc;
    }, {});
  }, [rosters]);

  const [entries, setEntries] = useState<RegistrationEntry[]>(initialEntries);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<"register" | "pricing">(
    "register",
  );
  const searchParamsNav = useSearchParams();
  const pathname = usePathname();

  const router = useRouter();
  const resolvedFinalizeConfig = useMemo<FinalizeConfig>(
    () => ({
      ...DEFAULT_FINALIZE_CONFIG,
      ...(finalizeConfig ?? {}),
    }),
    [finalizeConfig],
  );
  const isFlowReadOnly = Boolean(readOnly || resolvedFinalizeConfig.isReadOnly);

  const sanitizedSearch = searchTerm.trim().toLowerCase();

  const filteredEntries = useMemo(() => {
    if (!sanitizedSearch) return entries;
    return entries.filter((entry) => {
      const divisionMatch = entry.division
        .toLowerCase()
        .includes(sanitizedSearch);
      const teamLabel = (entry.teamName ?? entry.fileName ?? "").toLowerCase();
      return divisionMatch || teamLabel.includes(sanitizedSearch);
    });
  }, [entries, sanitizedSearch]);

  const groupedEntries = useMemo(
    () => groupEntriesByDivision(entries),
    [entries],
  );
  const filteredGroupedEntries = useMemo(
    () => groupEntriesByDivision(filteredEntries),
    [filteredEntries],
  );
  const divisionPriceMap = useMemo(() => {
    return divisionPricing.reduce<Record<string, number>>((acc, option) => {
      const price = option.regular?.price ?? option.earlyBird?.price ?? 0;
      acc[option.name] = price;
      return acc;
    }, {});
  }, [divisionPricing]);
  const totalParticipants = useMemo(() => {
    return entries.reduce((sum, entry) => sum + getEntryMemberCount(entry), 0);
  }, [entries]);
  const totalCost = useMemo(() => {
    return entries.reduce((sum, entry) => {
      const count = getEntryMemberCount(entry);
      const rate = divisionPriceMap[entry.division] ?? 0;
      return sum + count * rate;
    }, 0);
  }, [entries, divisionPriceMap]);
  const totalTeams = entries.length;
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }),
    [],
  );
  const stats = useMemo(
    () => [
      {
        label: "Total Participants",
        value: totalParticipants.toLocaleString(),
        icon: UsersIcon,
      },
      {
        label: "Total Teams",
        value: totalTeams.toLocaleString(),
        icon: LayersIcon,
      },
      {
        label: "Current Cost (Before Taxes)",
        value: currencyFormatter.format(totalCost),
        icon: WalletIcon,
      },
    ],
    [currencyFormatter, totalCost, totalParticipants, totalTeams],
  );

  const getTeamLabel = useCallback(
    (entry: RegistrationEntry) => {
      if (entry.teamName) return entry.teamName;
      if (entry.teamId) {
        const team = teamOptionsById[entry.teamId];
        if (team) {
          return team.name;
        }
      }
      if (entry.fileName) return entry.fileName;
      return "Team";
    },
    [teamOptionsById],
  );

  const handleAddEntry = (entry: RegistrationEntry) => {
    if (isFlowReadOnly) return;
    if (entry.mode === "existing" && entry.teamId) {
      const meta = rosterMetaByTeamId[entry.teamId];
      const rosterMembers = meta?.roster
        ? flattenRosterMembers(meta.roster)
        : (entry.members ?? []);
      const snapshotTakenAt = new Date().toISOString();
      const teamLabel =
        entry.teamName ?? teamOptionsById[entry.teamId]?.name ?? "Team";
      setEntries((prev) => [
        ...prev,
        {
          ...entry,
          teamName: teamLabel,
          members: rosterMembers,
          teamSize: rosterMembers.length,
          snapshotTakenAt,
          snapshotSourceTeamId: entry.teamId,
          snapshotRosterHash: meta?.hash,
        },
      ]);
      toast.success(`${teamLabel} added to registration`);
      return;
    }

    const label = getTeamLabel(entry);
    setEntries((prev) => [...prev, entry]);
    toast.success(`${label} added to registration`);
  };

  const handleRemoveEntry = useCallback(
    (id: string) => {
      if (isFlowReadOnly) return;
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    },
    [isFlowReadOnly],
  );

  const handleUpdateEntryMembers = (
    id: string,
    members: RegistrationMember[],
  ) => {
    const sanitizedMembers = members.filter((member) => {
      const content = [
        member.name?.trim(),
        member.email?.trim(),
        member.phone?.trim(),
        member.dob?.trim(),
        member.type?.trim(),
      ];
      return content.some(Boolean);
    });

    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              members: sanitizedMembers.map((member) => ({
                ...member,
                name: member.name?.trim() || "Unnamed",
                email: member.email?.trim() || undefined,
                phone: member.phone?.trim() || undefined,
                dob: member.dob?.trim() || undefined,
                type: member.type?.trim() || DEFAULT_ROLE,
              })),
              teamSize: sanitizedMembers.length,
            }
          : entry,
      ),
    );
  };

  const getEntryStatus = useCallback(
    (entry: RegistrationEntry): EntryStatusMeta => {
      const isLocked =
        entry.locked ||
        isFlowReadOnly ||
        isRegistrationLocked({
          paidAt: entry.paidAt,
          paymentDeadline: entry.paymentDeadline,
          registrationDeadline: entry.registrationDeadline,
        });
      const lockReason =
        entry.lockReason ??
        (entry.paidAt
          ? "paid"
          : isLocked && (entry.registrationDeadline || entry.paymentDeadline)
            ? "deadline"
            : undefined);
      const lockMessage =
        entry.lockMessage ??
        (lockReason === "paid"
          ? "Payment received. Contact the organizer for manual changes."
          : lockReason === "deadline"
            ? undefined
            : undefined);
      return {
        isLocked,
        lockReason,
        lockMessage,
      };
    },
    [isFlowReadOnly],
  );

  useEffect(() => {
    const a = searchParamsNav.get("action");
    setIsModalOpen(a === "register");
    setIsBulkOpen(a === "bulk");
  }, [searchParamsNav]);

  const handleReview = useCallback(() => {
    if (!entries.length || isFlowReadOnly) return;
    setActiveStep("pricing");
  }, [entries.length, isFlowReadOnly]);

  return (
    <section className="w-full space-y-6">
      {/* Step 1 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="flex flex-1 items-center justify-between text-left"
            onClick={() => setActiveStep("register")}
            aria-expanded={activeStep === "register"}
          >
            <div className="heading-4">{stepLabels.step1}</div>
          </button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              activeStep === "register" ? "Collapse step" : "Expand step"
            }
            onClick={() => setActiveStep("register")}
          >
            <ChevronDownIcon
              className={cn(
                "size-4 transition-transform",
                activeStep === "register" ? "rotate-180" : "rotate-0",
              )}
            />
          </Button>
        </div>
        <div
          className={cn(
            "overflow-hidden transition-all duration-500",
            activeStep === "register"
              ? "max-h-[4000px] opacity-100 translate-y-0"
              : "pointer-events-none max-h-0 -translate-y-2 opacity-0",
          )}
        >
          <div className="space-y-8 pt-4">
            {!hideStats && (
              <div className="grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="border-border/60 bg-card/70 text-card-foreground flex items-center justify-between rounded-2xl border px-4 py-3 shadow-sm"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-semibold">{stat.value}</p>
                    </div>
                    <stat.icon
                      className="text-muted-foreground size-5"
                      aria-hidden="true"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
                <div className="relative w-full sm:max-w-md">
                  <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                  <Input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search registered teams or participants"
                    className="w-full pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (isFlowReadOnly) return;
                      const params = new URLSearchParams(
                        Array.from(searchParamsNav.entries()),
                      );
                      params.set("action", "bulk");
                      router.replace(`${pathname}?${params.toString()}`);
                      setIsBulkOpen(true);
                    }}
                    disabled={isFlowReadOnly}
                  >
                    <UploadIcon className="mr-2 size-4" />
                    Bulk Upload
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (isFlowReadOnly) return;
                      const params = new URLSearchParams(
                        Array.from(searchParamsNav.entries()),
                      );
                      params.set("action", "register");
                      router.replace(`${pathname}?${params.toString()}`);
                      setIsModalOpen(true);
                    }}
                    disabled={!divisionOptions.length || isFlowReadOnly}
                  >
                    <UserPlusIcon className="mr-2 size-4" />
                    Register Team
                  </Button>
                </div>
              </div>

              <DivisionQueueSection
                entriesByDivision={groupedEntries}
                filteredEntriesByDivision={filteredGroupedEntries}
                allEntries={entries}
                divisionOptions={divisionOptions}
                searchTerm={sanitizedSearch}
                onRemoveEntry={handleRemoveEntry}
                onUpdateEntryMembers={handleUpdateEntryMembers}
                readOnly={isFlowReadOnly}
                getEntryStatus={getEntryStatus}
              />
            </div>

            <div className="flex justify-end">
              <Button
                className="w-fit"
                onClick={handleReview}
                disabled={!entries.length || isFlowReadOnly}
              >
                Review Pricing
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
          <button
            type="button"
            className="flex flex-1 items-center justify-between text-left"
            onClick={() => {
              if (!entries.length) return;
              setActiveStep("pricing");
            }}
            aria-expanded={activeStep === "pricing"}
            disabled={!entries.length}
          >
            <div className="flex items-center gap-3">
              <div>
                <p
                  className={cn(
                    "text-sm font-semibold uppercase tracking-wide",
                    entries.length
                      ? "text-muted-foreground"
                      : "text-muted-foreground/60",
                  )}
                >
                  {stepLabels.step2}
                </p>
              </div>
              <Badge
                variant={activeStep === "pricing" ? "outline" : "secondary"}
                className="text-xs font-semibold"
              >
                {activeStep === "pricing"
                  ? "In Progress"
                  : entries.length
                    ? "Pending"
                    : "Awaiting Teams"}
              </Badge>
            </div>
          </button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              activeStep === "pricing" ? "Collapse step" : "Expand step"
            }
            onClick={() => {
              if (!entries.length) return;
              setActiveStep("pricing");
            }}
            disabled={!entries.length}
          >
            <ChevronDownIcon
              className={cn(
                "size-4 transition-transform",
                activeStep === "pricing" ? "rotate-180" : "rotate-0",
              )}
            />
          </Button>
        </div>
        <div
          className={cn(
            "overflow-hidden transition-all duration-500",
            activeStep === "pricing"
              ? "max-h-[4000px] opacity-100 translate-y-0"
              : "pointer-events-none max-h-0 translate-y-4 opacity-0",
          )}
        >
          <div className="space-y-6 pt-4">
            <PricingReviewPage
              entries={entries}
              divisionPricing={divisionPricing}
              onSubmit={onSubmit}
              hideSubmitButton={hideSubmitButton}
              showPaymentMethods={showPaymentMethods}
            />
          </div>
        </div>
      </div>

      <RegisterTeamModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          const params = new URLSearchParams(
            Array.from(searchParamsNav.entries()),
          );
          if (open) params.set("action", "register");
          else params.delete("action");
          const q = params.toString();
          router.replace(q ? `${pathname}?${q}` : `${pathname}`);
        }}
        divisions={divisionOptions}
        teams={teamOptions}
        onSubmit={handleAddEntry}
      />
      <BulkUploadDialog
        open={isBulkOpen}
        onOpenChange={(open) => {
          setIsBulkOpen(open);
          const params = new URLSearchParams(
            Array.from(searchParamsNav.entries()),
          );
          if (open) params.set("action", "bulk");
          else params.delete("action");
          const q = params.toString();
          router.replace(q ? `${pathname}?${q}` : `${pathname}`);
        }}
        divisionPricing={divisionPricing}
        teamOptions={teamOptions}
        onImport={(newEntries) => {
          if (isFlowReadOnly) return;
          setEntries((prev) => [...prev, ...newEntries]);
        }}
      />
    </section>
  );
}

// DivisionQueueSection extracted to its own file.

// TeamRow extracted to its own file.

// --- Utilities -------------------------------------------------------------

function flattenRosterMembers(roster?: TeamRoster): RegistrationMember[] {
  if (!roster) return [];

  const roleMap: Array<{
    key: "coaches" | "athletes" | "reservists" | "chaperones";
    label: string;
  }> = [
    { key: "coaches", label: "Coach" },
    { key: "athletes", label: "Athlete" },
    { key: "reservists", label: "Reservist" },
    { key: "chaperones", label: "Chaperone" },
  ];

  return roleMap.flatMap(({ key, label }) => {
    const group = roster[key] ?? [];
    return group.map((member) => ({
      name: formatMemberName(member),
      type: label,
      dob: member.dob,
      email: member.email,
      phone: member.phone,
    }));
  });
}

function formatMemberName(
  member: Pick<Person, "firstName" | "lastName">,
): string {
  const parts = [member.firstName, member.lastName].filter(Boolean);
  return parts.length ? parts.join(" ") : "Unnamed";
}
