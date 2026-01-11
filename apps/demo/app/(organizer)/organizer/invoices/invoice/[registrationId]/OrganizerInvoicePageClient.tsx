"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { InvoicePageClient } from "@/app/(club)/clubs/registrations/[registrationId]/invoice/InvoicePageClient";
import { InvoicePageSkeleton } from "@/components/ui/skeletons";
import {
  useUnifiedClubData,
  getRegistrationById,
} from "@/hooks/useUnifiedClubData";
import { findEventById } from "@/data/events";
import { buildInvoiceDataFromRegistration } from "@/lib/invoices";
import type { InvoiceData } from "@/components/features/registration/invoice/InvoiceView";

type OrganizerInvoicePageProps = {
  registrationId: string;
  fromEventId?: string;
};

export function OrganizerInvoicePage({
  registrationId,
  fromEventId,
}: OrganizerInvoicePageProps) {
  const router = useRouter();
  const { data, isLoading, error } = useUnifiedClubData();

  const registration = useMemo(() => {
    if (!data) return null;
    return getRegistrationById(data.registrations, registrationId);
  }, [data, registrationId]);

  useEffect(() => {
    if (!isLoading && !registration) {
      router.push("/organizer/invoices");
    }
  }, [isLoading, registration, router]);

  if (isLoading) {
    return <InvoicePageSkeleton />;
  }

  if (error || !data || !registration) {
    return null;
  }

  // Use default club name since Registration type doesn't include clubName
  const clubLabel = "Demo Club";
  const event = findEventById(registration.eventId);

  // Back button goes to the source page - event detail registrations tab or invoices list
  const registrationHref = fromEventId
    ? `/organizer/events/${encodeURIComponent(fromEventId)}?tab=registrations`
    : "/organizer/invoices";

  const invoice = buildInvoiceDataFromRegistration(registration, data, event, {
    clubName: clubLabel,
  });
  const invoices: InvoiceData[] = [invoice];

  const originalPaymentStatus =
    registration.status === "paid" ? "paid" : "unpaid";

  return (
    <InvoicePageClient
      invoices={invoices}
      registrationHref={registrationHref}
      registrationId={registrationId}
      originalPaymentStatus={originalPaymentStatus}
      isOrganizer
    />
  );
}
