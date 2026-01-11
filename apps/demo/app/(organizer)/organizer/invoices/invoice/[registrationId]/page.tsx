import { OrganizerInvoicePage } from "./OrganizerInvoicePageClient";

type PageParams = {
  registrationId: string;
};

type SearchParams = {
  from?: string;
};

type PageProps = {
  params?: Promise<PageParams>;
  searchParams?: Promise<SearchParams>;
};

export default async function InvoicePage({ params, searchParams }: PageProps) {
  const resolvedParams = params ? await params : { registrationId: "" };
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const registrationId = decodeURIComponent(resolvedParams.registrationId);
  const fromEventId = resolvedSearchParams.from;

  return (
    <OrganizerInvoicePage
      registrationId={registrationId}
      fromEventId={fromEventId}
    />
  );
}
