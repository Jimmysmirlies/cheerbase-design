import { UnifiedRegistrationPage } from "@/components/features/clubs/UnifiedRegistrationPage";

type PageParams = {
  registrationId: string;
};

type PageProps = {
  params?: Promise<PageParams>;
};

export default async function RegistrationPage({ params }: PageProps) {
  const resolvedParams = params ? await params : { registrationId: "" };
  const registrationId = decodeURIComponent(resolvedParams.registrationId);

  return <UnifiedRegistrationPage registrationId={registrationId} />;
}
