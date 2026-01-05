import { UnifiedInvoicePage } from "@/components/features/clubs/UnifiedInvoicePage";

type PageParams = {
  registrationId: string;
};

type PageProps = {
  params?: Promise<PageParams>;
};

export default async function InvoicePage({ params }: PageProps) {
  const resolvedParams = params ? await params : { registrationId: "" };
  const registrationId = decodeURIComponent(resolvedParams.registrationId);

  return <UnifiedInvoicePage registrationId={registrationId} />;
}
