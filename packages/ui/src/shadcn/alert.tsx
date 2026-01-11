import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";

import { type VariantProps, cva } from "class-variance-authority";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
        muted: "bg-muted text-muted-foreground [&>svg]:text-muted-foreground",
        "cadet-gray":
          "bg-cadet-gray-100 border-cadet-gray-200 text-cadet-gray-text [&>svg]:text-cadet-gray-text *:data-[slot=alert-description]:text-cadet-gray-text/80",
        olivine:
          "bg-olivine-100 border-olivine-200 text-olivine-text [&>svg]:text-olivine-text *:data-[slot=alert-description]:text-olivine-text/80",
        lilac:
          "bg-lilac-100 border-lilac-200 text-lilac-text [&>svg]:text-lilac-text *:data-[slot=alert-description]:text-lilac-text/80",
        "light-coral":
          "bg-light-coral-100 border-light-coral-200 text-light-coral-text [&>svg]:text-light-coral-text *:data-[slot=alert-description]:text-light-coral-text/80",
        mustard:
          "bg-mustard-100 border-mustard-200 text-mustard-text [&>svg]:text-mustard-text *:data-[slot=alert-description]:text-mustard-text/80",
        charcoal:
          "bg-charcoal-100 border-charcoal-200 text-charcoal-text [&>svg]:text-charcoal-text *:data-[slot=alert-description]:text-charcoal-text/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
