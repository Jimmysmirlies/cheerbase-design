"use client";

/**
 * UnifiedInvoicePage
 *
 * Client component that renders invoice details for both demo and
 * localStorage-based registrations using a unified data layer.
 */

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { InvoicePageClient } from "@/app/(club)/clubs/registrations/[registrationId]/invoice/InvoicePageClient";
import { InvoicePageSkeleton } from "@/components/ui/skeletons";
import {
  useUnifiedClubData,
  getRegistrationById,
  getLocalStorageRegistration,
} from "@/hooks/useUnifiedClubData";
import { findEventById } from "@/data/events";
import { buildInvoiceDataFromRegistration } from "@/lib/invoices";
import type { InvoiceData } from "@/components/features/registration/invoice/InvoiceView";
import type { RegistrationEntry } from "@/components/features/registration/flow/types";

type UnifiedInvoicePageProps = {
  registrationId: string;
};

// Build invoice from localStorage registration data
function buildLocalStorageInvoice(
  localStorageReg: NonNullable<ReturnType<typeof getLocalStorageRegistration>>,
  event: ReturnType<typeof findEventById>,
): InvoiceData {
  const entriesByDivision: Record<string, RegistrationEntry[]> = {};

  localStorageReg.teams.forEach((team) => {
    const entry: RegistrationEntry = {
      id: team.id,
      division: team.division,
      mode: "existing",
      teamId: team.teamId,
      teamName: team.name,
      teamSize: team.members?.length ?? 0,
      members: team.members?.map((m) => ({
        name: m.name || `${m.firstName || ""} ${m.lastName || ""}`.trim(),
        type: m.role
          ? m.role.charAt(0).toUpperCase() + m.role.slice(1)
          : "Athlete",
        dob: m.dob || undefined,
        email: m.email || undefined,
        phone: m.phone || undefined,
      })),
    };

    const divisionEntries = entriesByDivision[team.division] ?? [];
    divisionEntries.push(entry);
    entriesByDivision[team.division] = divisionEntries;
  });

  // Build divisionPricing array from event data
  type DivisionPricingItem = {
    name: string;
    earlyBird?: { price: number; deadline?: string };
    regular: { price: number };
  };

  const divisionPricing: DivisionPricingItem[] = (
    event?.availableDivisions ?? []
  ).map((d) => ({
    name: d.name,
    earlyBird: d.earlyBird,
    regular: d.regular ?? { price: 130 },
  }));

  // If no pricing from event, derive from the teams
  if (divisionPricing.length === 0) {
    const uniqueDivisions = new Set(
      localStorageReg.teams.map((t) => t.division),
    );
    uniqueDivisions.forEach((division) => {
      divisionPricing.push({
        name: division,
        regular: { price: 130 },
      });
    });
  }

  const invoice: InvoiceData = {
    invoiceNumber: localStorageReg.invoiceNumber,
    orderVersion: 1,
    issuedDate: new Date(localStorageReg.invoiceDate),
    eventName: localStorageReg.eventName,
    clubName: "Demo Club Owner's Club",
    entriesByDivision,
    divisionPricing,
    payments:
      localStorageReg.status === "paid"
        ? [
            {
              amount: localStorageReg.total,
              method: "Visa",
              lastFour: "4242",
              date: localStorageReg.paidAt
                ? new Date(localStorageReg.paidAt)
                : new Date(localStorageReg.invoiceDate),
            },
          ]
        : [],
    status: localStorageReg.status === "paid" ? "paid" : "unpaid",
    gstRate: 0.05,
    qstRate: 0.09975,
  };

  return invoice;
}

export function UnifiedInvoicePage({
  registrationId,
}: UnifiedInvoicePageProps) {
  const router = useRouter();
  const { data, isLoading, error } = useUnifiedClubData();

  // Find the registration in unified data
  const registration = useMemo(() => {
    if (!data) return null;
    return getRegistrationById(data.registrations, registrationId);
  }, [data, registrationId]);

  // Check if this is a localStorage registration
  const localStorageReg = useMemo(() => {
    return getLocalStorageRegistration(registrationId);
  }, [registrationId]);

  // Redirect if registration not found after loading
  useEffect(() => {
    if (!isLoading && !registration) {
      router.push("/clubs/registrations");
    }
  }, [isLoading, registration, router]);

  if (isLoading) {
    return <InvoicePageSkeleton />;
  }

  if (error || !data || !registration) {
    return null; // Will redirect
  }

  const clubLabel = "Demo Club Owner's Club";
  const event = findEventById(registration.eventId);
  const registrationHref = `/clubs/registrations/${registrationId}`;

  // Build invoice data
  let invoices: InvoiceData[];

  if (localStorageReg) {
    // Build invoice from localStorage data
    const invoice = buildLocalStorageInvoice(localStorageReg, event);
    invoices = [invoice];
  } else {
    // Use demo data invoice calculation
    const invoice = buildInvoiceDataFromRegistration(
      registration,
      data,
      event,
      {
        clubName: clubLabel,
      },
    );
    invoices = [invoice];
  }

  const originalPaymentStatus =
    registration.status === "paid" ? "paid" : "unpaid";

  return (
    <InvoicePageClient
      invoices={invoices}
      registrationHref={registrationHref}
      registrationId={registrationId}
      originalPaymentStatus={originalPaymentStatus}
    />
  );
}
