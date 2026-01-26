import { notFound } from "next/navigation";

import { EditRegistrationPageContent } from "./_components/EditRegistrationPageContent";
import { demoRegistrations } from "@/data";

type EditPageParams = {
  registrationId: string;
};

type EditPageProps = {
  params?: Promise<EditPageParams>;
};

export default async function EditRegistrationPage({ params }: EditPageProps) {
  const resolvedParams = params ? await params : null;
  if (!resolvedParams) {
    notFound();
  }

  const registrationId = decodeURIComponent(resolvedParams.registrationId);

  // Find registration to get event name for header
  const registration = demoRegistrations.find((r) => r.id === registrationId);
  const eventName = registration?.eventName ?? "Edit Registration";

  return (
    <EditRegistrationPageContent
      registrationId={registrationId}
      eventName={eventName}
    />
  );
}
