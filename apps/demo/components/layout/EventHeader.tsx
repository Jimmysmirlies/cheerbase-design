import { Button } from "@workspace/ui/shadcn/button";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

type EventHeaderProps = {
  title: string;
  location: string;
  date: string;
  organizer?: string;
  backHref: string;
  listingHref?: string;
  invoiceHref?: string;
};

export function EventHeader({ title, location, date, organizer, backHref, listingHref, invoiceHref }: EventHeaderProps) {
  return (
    <div className="space-y-4">
      <div>
        <Button asChild variant="ghost" size="icon" className="-ml-2 h-10 w-10">
          <Link href={backHref} aria-label="Back">
            <ArrowLeftIcon className="size-5" />
          </Link>
        </Button>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="heading-2 text-foreground">{title}</div>
        <div className="flex items-center gap-2">
          {listingHref ? (
            <Button asChild variant="outline" size="sm">
              <Link href={listingHref}>View Event Listing</Link>
            </Button>
          ) : null}
          {invoiceHref ? (
            <Button asChild variant="default" size="sm">
              <Link href={invoiceHref}>View Invoice</Link>
            </Button>
          ) : null}
        </div>
      </div>
      <div className="h-px w-full bg-border" />
      <div className="grid gap-6 pb-2 text-sm text-foreground sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium text-right">{location}</span>
          </div>
          <div className="h-px w-full bg-border/80" />
        </div>
        <div className="flex flex-col gap-2 sm:px-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Event Date</span>
            <span className="font-medium text-right">{date}</span>
          </div>
          <div className="h-px w-full bg-border/80" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Organizer</span>
            <span className="font-medium text-right">{organizer ?? "—"}</span>
          </div>
          <div className="h-px w-full bg-border/80" />
        </div>
      </div>
    </div>
  );
}
