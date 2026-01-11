import { PageHeader } from "@/components/layout/PageHeader";

const eventDiscovery = [
  {
    endpoint: "GET /events",
    purpose: "Fetch searchable marketplace list",
    params: "sport, region, dateRange, visibility, limit",
    response: `{
  "events": [
    {
      "id": "orchard-classic",
      "name": "Orchard City Classic",
      "sport": "Soccer",
      "startDate": "2025-05-18",
      "endDate": "2025-05-20",
      "location": { "city": "San Jose", "state": "CA" },
      "visibility": "public",
      "organizer": { "id": "district-sports", "name": "District Sports Network" },
      "followers": 423
    }
  ],
  "pagination": { "cursor": "..." }
}`,
    uiStates:
      'Loading skeleton cards, Empty prompt "Reset filters", Error banner with retry',
  },
  {
    endpoint: "GET /events/{id}",
    purpose: "Populate event detail page",
    params: "include (divisions, schedule)",
    response: `{
  "id": "orchard-classic",
  "name": "Orchard City Classic",
  "visibility": "public",
  "heroImage": "https://...",
  "divisions": [
    { "id": "u14", "name": "U14", "capacity": 16, "registered": 12, "fee": 450 }
  ],
  "requirements": [...],
  "organizer": { "id": "district-sports", "name": "District Sports Network" }
}`,
    uiStates:
      "Loading skeleton hero + tabs, Empty divisions → follow organizer CTA, Error → inline alert + back link",
  },
];

const registrationLifecycle = [
  {
    endpoint: "POST /registrations",
    purpose: "Start registration for club/team",
    params: "Body { clubId, eventId, divisionId, teamName, roster[] }",
    response: `{
  "id": "reg_123",
  "status": "pending_payment",
  "nextAction": "completePayment",
  "checkoutUrl": "https://pay.ralli.app/..."
}`,
    uiStates:
      "Success redirect to payment, Validation errors inline, Error toast with retry",
  },
  {
    endpoint: "PATCH /registrations/{id}",
    purpose: "Update roster/payments",
    params: "Body { roster, waiversSigned, paymentStatus }",
    response: `{
  "id": "reg_123",
  "status": "confirmed",
  "audit": [
    { "at": "2025-03-01T18:22:00Z", "by": "user", "change": "Roster updated" }
  ]
}`,
    uiStates:
      "Loading overlay during submit, Success confirmation banner, Conflict waitlist modal",
  },
  {
    endpoint: "GET /registrations?clubId=",
    purpose: "Dashboard list",
    params: "Query status, eventDateRange",
    response: `{
  "registrations": [
    {
      "id": "reg_123",
      "event": { "id": "orchard-classic", "name": "Orchard City Classic", "startDate": "2025-05-18" },
      "status": "confirmed",
      "balanceDue": 0
    }
  ]
}`,
    uiStates:
      'Loading table skeleton, Empty state CTA "Browse events", Error inline alert',
  },
];

const organizerOnboarding = [
  {
    endpoint: "POST /host-applications",
    purpose: 'Submit "Host Events" inquiry',
    params:
      "Body { companyName, contactEmail, phone, sportFocus, sampleEventUrl }",
    response: `{
  "id": "apply_456",
  "status": "under_review",
  "submittedAt": "2025-02-10T15:30:00Z"
}`,
    uiStates:
      "Success thank-you message, Validation highlights, Error modal retry",
  },
  {
    endpoint: "GET /host-applications/{id}",
    purpose: "Admin review detail",
    params: "Path id",
    response: `{
  "id": "apply_456",
  "status": "under_review",
  "companyName": "Baseline Events",
  "notes": [
    { "author": "admin", "body": "Looks legit", "createdAt": "2025-02-11T09:00:00Z" }
  ],
  "history": []
}`,
    uiStates:
      "Loading skeleton detail, Decision controls disabled until load, Error fallback message",
  },
  {
    endpoint: "POST /host-applications/{id}/decision",
    purpose: "Approve/decline application",
    params: 'Body { decision: "approve" | "decline", message }',
    response: `{
  "id": "apply_456",
  "status": "approved",
  "organizerAccountInvite": "https://ralli.app/invite/..."
}`,
    uiStates:
      "Success toast with invite link, Decline prompts reason + sends email, Error keeps modal open",
  },
];

type ContractRow = (typeof eventDiscovery)[number];

function ContractTable({
  title,
  rows,
}: {
  title: string;
  rows: ContractRow[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-semibold">{title}</p>
      <div className="overflow-x-auto rounded-2xl border border-border bg-card/60">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Endpoint / Method</th>
              <th className="px-4 py-3 font-semibold">Purpose</th>
              <th className="px-4 py-3 font-semibold">Key Params / Body</th>
              <th className="px-4 py-3 font-semibold">Response Sample</th>
              <th className="px-4 py-3 font-semibold">UI States</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-muted/30">
            {rows.map((row) => (
              <tr key={row.endpoint}>
                <td className="align-top px-4 py-4 font-semibold text-foreground">
                  {row.endpoint}
                </td>
                <td className="align-top px-4 py-4 text-muted-foreground">
                  {row.purpose}
                </td>
                <td className="align-top px-4 py-4 text-muted-foreground">
                  {row.params}
                </td>
                <td className="align-top px-4 py-4">
                  <pre className="whitespace-pre-wrap rounded-xl bg-background/80 p-3 text-xs font-mono text-muted-foreground shadow-inner">
                    {row.response}
                  </pre>
                </td>
                <td className="align-top px-4 py-4 text-muted-foreground">
                  {row.uiStates}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ApiContractsPage() {
  return (
    <>
      <PageHeader
        title="API Contracts"
        subtitle="Reference endpoints that power the discovery-first experience. Each table pairs the request/response shape with the UI states designers need to mock."
        breadcrumbs={[{ label: "Brand Guidelines", href: "/style-guide" }]}
      />
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Event Discovery */}
          <div className="flex flex-col gap-4 px-1">
            <ContractTable title="Event Discovery" rows={eventDiscovery} />
          </div>

          {/* Registration Lifecycle */}
          <div className="flex flex-col gap-4 px-1">
            <div className="h-px w-full bg-border" />
            <ContractTable
              title="Registration Lifecycle"
              rows={registrationLifecycle}
            />
          </div>

          {/* Organizer Onboarding */}
          <div className="flex flex-col gap-4 px-1">
            <div className="h-px w-full bg-border" />
            <ContractTable
              title="Organizer Onboarding"
              rows={organizerOnboarding}
            />
          </div>
        </div>
      </div>
    </>
  );
}
