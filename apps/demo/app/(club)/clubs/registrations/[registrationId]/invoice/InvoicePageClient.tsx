"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PrinterIcon, ArrowLeftIcon } from "lucide-react";

import { Button } from "@workspace/ui/shadcn/button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/shadcn/toggle-group";
import {
  InvoiceView,
  type InvoiceData,
  type InvoiceChangeInfo,
  type InvoiceSelectOption,
  type InvoiceHistoryItem,
} from "@/components/features/registration/invoice/InvoiceView";
import { PaymentMethodsDialog } from "@/components/features/registration/PaymentMethods";
import { MarkAsPaidDialog } from "@/components/features/registration/invoice/MarkAsPaidDialog";
import { toast } from "@workspace/ui/shadcn/sonner";
import { WalkthroughSpotlight } from "@/components/ui/RegistrationWalkthrough";
import { fadeInUp } from "@/lib/animations";
import { formatFriendlyDate } from "@/utils/format";
import { useRegistrationStorage } from "@/hooks/useRegistrationStorage";
import { getEntryMemberCount } from "@/utils/registration-stats";
import { resolveDivisionPricing } from "@/utils/pricing";
import type { RegistrationEntry } from "@/components/features/registration/flow/types";

// Calculate invoice total from invoice data
function calculateInvoiceTotal(invoice: InvoiceData): number {
  const gstRate = invoice.gstRate ?? 0.05;
  const qstRate = invoice.qstRate ?? 0.09975;
  const referenceDate = invoice.issuedDate || new Date();

  const pricingByDivision = invoice.divisionPricing.reduce<
    Record<string, (typeof invoice.divisionPricing)[0]>
  >((acc, option) => {
    acc[option.name] = option;
    return acc;
  }, {});

  let subtotal = 0;
  for (const [divisionName, entries] of Object.entries(
    invoice.entriesByDivision,
  )) {
    const qty = entries.reduce(
      (sum, entry) => sum + getEntryMemberCount(entry),
      0,
    );
    const pricing = pricingByDivision[divisionName];
    if (pricing) {
      const activeTier = resolveDivisionPricing(pricing, referenceDate);
      subtotal += qty * activeTier.price;
    }
  }

  const totalTax = subtotal * (gstRate + qstRate);
  return subtotal + totalTax;
}

type LayoutVariant = "A" | "B";

function LayoutToggle({
  variant,
  onChange,
}: {
  variant: LayoutVariant;
  onChange: (variant: LayoutVariant) => void;
}) {
  return (
    <div className="relative inline-flex items-center rounded-md border p-1 transition-all duration-300 border-border/70 bg-muted/40">
      <ToggleGroup
        type="single"
        value={variant}
        onValueChange={(v) => v && onChange(v as LayoutVariant)}
        className="gap-0"
      >
        {(["A", "B"] as const).map((v) => (
          <ToggleGroupItem
            key={v}
            value={v}
            aria-label={`Layout ${v}`}
            className="size-7 rounded-sm data-[state=on]:bg-background data-[state=on]:shadow-sm text-xs font-semibold"
          >
            {v}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .print-invoice,
    .print-invoice * {
      visibility: visible;
    }
    .print-invoice {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print {
      display: none !important;
    }
  }
`;

type InvoicePageClientProps = {
  invoices: InvoiceData[];
  registrationHref: string;
  registrationId: string;
  originalPaymentStatus: "paid" | "unpaid";
  /** When true, shows organizer-specific actions like "Mark as Paid" */
  isOrganizer?: boolean;
};

export function InvoicePageClient({
  invoices,
  registrationHref,
  registrationId,
  originalPaymentStatus,
  isOrganizer = false,
}: InvoicePageClientProps) {
  const { savedChanges, hasStoredChanges } =
    useRegistrationStorage(registrationId);

  const allInvoices = useMemo(() => {
    const baseInvoice = invoices[0];
    if (!baseInvoice) return [];

    if (
      hasStoredChanges &&
      savedChanges?.originalInvoice &&
      savedChanges?.newInvoice
    ) {
      const removedTeamIds = new Set(savedChanges.removedTeamIds);
      const pastEntriesByDivision: Record<string, RegistrationEntry[]> = {};
      for (const [division, entries] of Object.entries(
        baseInvoice.entriesByDivision,
      )) {
        pastEntriesByDivision[division] = [...entries];
      }

      const currentEntriesByDivision: Record<string, RegistrationEntry[]> = {};

      for (const [division, entries] of Object.entries(
        baseInvoice.entriesByDivision,
      )) {
        const remainingEntries = entries
          .filter((entry) => !removedTeamIds.has(entry.id))
          .map((entry) => {
            const modifiedRoster =
              savedChanges.modifiedRosters?.[entry.id] ||
              savedChanges.modifiedRosters?.[entry.teamId ?? ""];
            if (modifiedRoster) {
              return {
                ...entry,
                teamSize: modifiedRoster.length,
                members: modifiedRoster.map((m) => ({
                  name: m.name ?? `${m.firstName} ${m.lastName}`.trim(),
                  type: m.role
                    ? m.role.charAt(0).toUpperCase() + m.role.slice(1)
                    : "Athlete",
                  dob: m.dob ?? undefined,
                  email: m.email ?? undefined,
                  phone: m.phone ?? undefined,
                })),
              };
            }
            return entry;
          });
        if (remainingEntries.length > 0) {
          currentEntriesByDivision[division] = [...remainingEntries];
        }
      }

      const newDivisions = new Set<string>();
      const modifiedDivisions = new Set<string>();
      const removedDivisionsSet = new Set<string>();

      for (const addedTeam of savedChanges.addedTeams) {
        const division = addedTeam.division;
        const newEntry: RegistrationEntry = {
          id: addedTeam.id,
          division: addedTeam.division,
          mode: "existing",
          teamId: addedTeam.id,
          teamName: addedTeam.name,
          teamSize: addedTeam.members?.length ?? 0,
          members: addedTeam.members?.map((m) => ({
            name: `${m.firstName} ${m.lastName}`.trim(),
            type: m.role
              ? m.role.charAt(0).toUpperCase() + m.role.slice(1)
              : "Athlete",
            dob: m.dob ?? undefined,
            email: m.email ?? undefined,
            phone: m.phone ?? undefined,
          })),
        };

        // Check if this division already exists (then it's modified) or is entirely new
        if (currentEntriesByDivision[division]) {
          modifiedDivisions.add(division);
        } else {
          newDivisions.add(division);
          currentEntriesByDivision[division] = [];
        }
        currentEntriesByDivision[division].push(newEntry);
      }

      for (const removedId of removedTeamIds) {
        for (const [division, entries] of Object.entries(
          baseInvoice.entriesByDivision,
        )) {
          const hadTeam = entries.some((e) => e.id === removedId);
          if (hadTeam) {
            const remainingInDivision =
              currentEntriesByDivision[division]?.length ?? 0;
            if (remainingInDivision === 0) {
              removedDivisionsSet.add(division);
            } else {
              modifiedDivisions.add(division);
            }
          }
        }
      }

      if (savedChanges.modifiedRosters) {
        for (const modifiedTeamId of Object.keys(
          savedChanges.modifiedRosters,
        )) {
          for (const [division, entries] of Object.entries(
            baseInvoice.entriesByDivision,
          )) {
            const hasTeam = entries.some(
              (e) => e.id === modifiedTeamId || e.teamId === modifiedTeamId,
            );
            if (hasTeam && !removedDivisionsSet.has(division)) {
              modifiedDivisions.add(division);
            }
          }
        }
      }

      const changeInfo: InvoiceChangeInfo = {
        newDivisions,
        modifiedDivisions,
        removedDivisions: removedDivisionsSet,
      };

      const pastInvoicesCount = savedChanges.pastInvoices?.length ?? 0;
      const currentVersion = pastInvoicesCount + 2;

      const currentInvoice: InvoiceData = {
        ...baseInvoice,
        entriesByDivision: currentEntriesByDivision,
        invoiceNumber: savedChanges.newInvoice.invoiceNumber,
        orderVersion: currentVersion,
        issuedDate: new Date(savedChanges.newInvoice.invoiceDate),
        status: "unpaid",
        changeInfo,
        originalEntriesByDivision: pastEntriesByDivision,
      };

      const originalInvoice: InvoiceData = {
        ...baseInvoice,
        entriesByDivision: pastEntriesByDivision,
        invoiceNumber: savedChanges.originalInvoice.invoiceNumber,
        orderVersion: 1,
        issuedDate: new Date(savedChanges.originalInvoice.invoiceDate),
        status: originalPaymentStatus === "paid" ? "paid" : "void",
        payments:
          originalPaymentStatus === "paid"
            ? [
                {
                  amount: savedChanges.originalInvoice.total,
                  method: "Visa",
                  lastFour: "4242",
                  date: new Date(savedChanges.originalInvoice.invoiceDate),
                },
              ]
            : [],
      };

      // Build intermediate invoices from pastInvoices array
      const intermediateInvoices: InvoiceData[] = (
        savedChanges.pastInvoices ?? []
      ).map((pastInv, idx) => ({
        ...baseInvoice,
        invoiceNumber: pastInv.invoiceNumber,
        orderVersion: idx + 2,
        issuedDate: new Date(pastInv.invoiceDate),
        status: pastInv.status ?? "void",
        payments: [],
      }));

      return [currentInvoice, ...intermediateInvoices, originalInvoice];
    }

    return [baseInvoice];
  }, [invoices, hasStoredChanges, savedChanges, originalPaymentStatus]);

  const normalizedInvoices = useMemo(
    () =>
      allInvoices.map((invoice) => ({
        ...invoice,
        issuedDate: new Date(invoice.issuedDate),
        payments:
          invoice.payments?.map((payment) => ({
            ...payment,
            date: new Date(payment.date),
          })) ?? [],
      })),
    [allInvoices],
  );

  const sortedInvoicesBase = useMemo(
    () =>
      [...normalizedInvoices].sort((a, b) => b.orderVersion - a.orderVersion),
    [normalizedInvoices],
  );

  const [manualPayments, setManualPayments] = useState<
    Record<
      string,
      { amount: number; method: string; date: Date; notes: string }
    >
  >({});

  const sortedInvoices = useMemo(() => {
    return sortedInvoicesBase.map((invoice) => {
      const manualPayment = manualPayments[invoice.invoiceNumber];
      if (!manualPayment) return invoice;

      const existingPayments = invoice.payments ?? [];
      const newPayment = {
        amount: manualPayment.amount,
        method: manualPayment.method,
        lastFour: "",
        date: manualPayment.date,
      };

      const allPayments = [...existingPayments, newPayment];
      const newStatus: "paid" | "partial" | "unpaid" = "paid";

      return {
        ...invoice,
        payments: allPayments,
        status: newStatus,
      };
    });
  }, [sortedInvoicesBase, manualPayments]);

  const currentInvoice = sortedInvoices[0] ?? null;
  const currentInvoiceNumber = currentInvoice?.invoiceNumber ?? "";
  const pastInvoices = sortedInvoices.slice(1);

  const [selectedInvoiceNumber, setSelectedInvoiceNumber] =
    useState(currentInvoiceNumber);
  const [isPrinting, setIsPrinting] = useState(false);

  const [prevCurrentInvoiceNumber, setPrevCurrentInvoiceNumber] =
    useState(currentInvoiceNumber);

  useEffect(() => {
    if (
      currentInvoiceNumber &&
      currentInvoiceNumber !== prevCurrentInvoiceNumber
    ) {
      setSelectedInvoiceNumber(currentInvoiceNumber);
      setPrevCurrentInvoiceNumber(currentInvoiceNumber);
    }
  }, [currentInvoiceNumber, prevCurrentInvoiceNumber]);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showMarkAsPaid, setShowMarkAsPaid] = useState(false);
  const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>("A");

  const selectedInvoice =
    sortedInvoices.find((inv) => inv.invoiceNumber === selectedInvoiceNumber) ??
    currentInvoice;

  function handlePrint() {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  }

  const isPayable =
    selectedInvoice?.status !== "paid" && selectedInvoice?.status !== "void";

  const invoiceOptions: InvoiceSelectOption[] = sortedInvoices.map(
    (invoice, idx) => ({
      invoiceNumber: invoice.invoiceNumber,
      label: `#${invoice.invoiceNumber}`,
      isCurrent: idx === 0,
      status: invoice.status,
    }),
  );

  const invoiceHistory: InvoiceHistoryItem[] = sortedInvoices
    .map((invoice, idx) => ({
      invoiceNumber: invoice.invoiceNumber,
      issuedDate: invoice.issuedDate,
      isCurrent: idx === 0,
    }))
    .sort(
      (a, b) =>
        new Date(a.issuedDate).getTime() - new Date(b.issuedDate).getTime(),
    );

  function handleMarkAsPaid(data: {
    paymentDate: Date;
    paymentMethod: string;
    notes: string;
    invoiceTotal: number;
  }) {
    if (!selectedInvoice) return;

    // Record the manual payment
    setManualPayments((prev) => ({
      ...prev,
      [selectedInvoice.invoiceNumber]: {
        amount: data.invoiceTotal,
        method: data.paymentMethod,
        date: data.paymentDate,
        notes: data.notes,
      },
    }));

    toast.success("Invoice marked as paid", {
      description: `Payment of $${data.invoiceTotal.toLocaleString()} recorded for invoice #${selectedInvoice.invoiceNumber}`,
    });
  }

  const invoiceActions = (
    <>
      <Button variant="outline" size="sm" onClick={handlePrint}>
        <PrinterIcon className="mr-2 h-4 w-4" />
        Print
      </Button>
      {isOrganizer && isPayable && (
        <Button size="sm" onClick={() => setShowMarkAsPaid(true)}>
          Mark as Paid
        </Button>
      )}
      {!isOrganizer && isPayable && (
        <WalkthroughSpotlight step="complete" side="bottom" align="end">
          <Button size="sm" onClick={() => setShowPaymentMethods(true)}>
            Pay Invoice
          </Button>
        </WalkthroughSpotlight>
      )}
    </>
  );

  const Sidebar = (
    <motion.div
      className="hidden lg:block border-l border-border"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <aside className="sticky top-8 w-full pl-4">
        <div className="space-y-3 text-sm">
          <div className="text-muted-foreground text-xs uppercase tracking-wide">
            Current Invoice
          </div>
          {currentInvoice && (
            <div className="border-b border-border pb-3">
              <button
                type="button"
                className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm transition ${
                  selectedInvoiceNumber === currentInvoiceNumber
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted hover:text-primary"
                }`}
                aria-label="Current invoice"
                onClick={() => setSelectedInvoiceNumber(currentInvoiceNumber)}
              >
                <span className="font-medium">#{currentInvoiceNumber}</span>
                <span className="text-muted-foreground text-xs">
                  {formatFriendlyDate(currentInvoice.issuedDate)}
                </span>
              </button>
            </div>
          )}
          <div className="text-muted-foreground text-xs uppercase tracking-wide pt-2">
            Past Invoices
          </div>
          {pastInvoices.length > 0 ? (
            <div className="flex flex-col gap-1">
              {pastInvoices.map((invoice) => (
                <button
                  key={invoice.invoiceNumber}
                  type="button"
                  onClick={() =>
                    setSelectedInvoiceNumber(invoice.invoiceNumber)
                  }
                  className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm transition ${
                    invoice.invoiceNumber === selectedInvoiceNumber
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted hover:text-primary"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      #{invoice.invoiceNumber}
                    </span>
                    {invoice.status === "paid" && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                        Paid
                      </span>
                    )}
                    {invoice.status === "void" && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        Void
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {formatFriendlyDate(invoice.issuedDate)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border/60 p-4 text-center">
              <p className="text-xs text-muted-foreground">No past invoices</p>
            </div>
          )}
        </div>
      </aside>
    </motion.div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      <section className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-7xl">
          <motion.div
            className="no-print mb-6"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="-ml-2 h-10 w-10"
              >
                <Link href={registrationHref} aria-label="Back to registration">
                  <ArrowLeftIcon className="size-5" />
                </Link>
              </Button>
              <LayoutToggle
                variant={layoutVariant}
                onChange={setLayoutVariant}
              />
            </div>
          </motion.div>

          {layoutVariant === "A" ? (
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              <motion.div
                className="flex flex-col gap-6"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {selectedInvoice ? (
                  <InvoiceView
                    invoice={selectedInvoice}
                    variant={isPrinting ? "print" : "web"}
                    actions={invoiceActions}
                    invoiceHistory={invoiceHistory}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-muted-foreground">
                    No invoices available for this registration yet.
                  </div>
                )}
              </motion.div>
              {Sidebar}
            </div>
          ) : (
            <motion.div
              className="flex flex-col gap-6"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {selectedInvoice ? (
                <InvoiceView
                  invoice={selectedInvoice}
                  variant={isPrinting ? "print" : "web"}
                  invoiceOptions={invoiceOptions}
                  onInvoiceSelect={setSelectedInvoiceNumber}
                  actions={invoiceActions}
                  invoiceHistory={invoiceHistory}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-muted-foreground">
                  No invoices available for this registration yet.
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      <PaymentMethodsDialog
        open={showPaymentMethods}
        onOpenChange={setShowPaymentMethods}
      />

      <MarkAsPaidDialog
        open={showMarkAsPaid}
        onOpenChange={setShowMarkAsPaid}
        invoiceNumber={selectedInvoice?.invoiceNumber ?? ""}
        invoiceTotal={
          selectedInvoice ? calculateInvoiceTotal(selectedInvoice) : 0
        }
        onConfirm={handleMarkAsPaid}
      />
    </>
  );
}
