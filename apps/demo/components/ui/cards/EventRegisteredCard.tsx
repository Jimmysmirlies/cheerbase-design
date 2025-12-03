"use client"

import type { CSSProperties } from "react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/shadcn/button"
import { Card, CardContent, CardFooter } from "@workspace/ui/shadcn/card"

import Link from "next/link"

type StatusVariant = "PAID" | "UNPAID" | "OVERDUE"

const statusColorMap: Record<StatusVariant, string> = {
  PAID: "text-emerald-600",
  UNPAID: "text-amber-500",
  OVERDUE: "text-red-600",
}

const fallbackHeroStyle: CSSProperties = {
  backgroundColor: "hsla(0,0%,100%,1)",
  backgroundImage: [
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5 0.5' numOctaves='3' stitchTiles='stitch' seed='4313'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.28'/%3E%3C/svg%3E\")",
    "linear-gradient(160deg, #8E69D0 0%, #576AE6 50.22%, #3B9BDF 100%)",
  ].join(","),
  backgroundRepeat: "repeat, no-repeat",
  backgroundSize: "auto, auto",
  backgroundBlendMode: "soft-light, normal",
}

export type EventRegisteredCardProps = {
  image?: string
  title: string
  date: string
  location: string
  participants: number | string
  statusLabel: StatusVariant
  actionHref: string
  actionLabel?: string
  disabled?: boolean
}

export function EventRegisteredCard({
  image,
  title,
  date,
  location,
  participants,
  statusLabel,
  actionHref,
  actionLabel = "View",
  disabled = false,
}: EventRegisteredCardProps) {
  const heroStyle = image ? { backgroundImage: `url(${image})` } : fallbackHeroStyle
  const statusColorClass = statusColorMap[statusLabel] ?? "text-foreground"

  return (
    <Card className="flex h-full min-w-[320px] flex-col overflow-hidden p-0 shadow-md !rounded-sm gap-0">
      <div className={cn("relative h-40 bg-cover bg-center", !image && "bg-muted")} style={heroStyle} />
      <CardContent className="flex flex-1 flex-col gap-6 p-6">
        <div className="space-y-1.5">
          <h3 className="heading-4 font-semibold text-foreground">{title}</h3>
        </div>
        <div className="space-y-3 text-sm text-foreground">
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{date}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium text-right">{location}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Participants</span>
            <span className="font-medium">{participants}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-border/70 flex items-center justify-between border-t !p-6">
        <div className="text-sm">
          <span className="text-muted-foreground block text-xs uppercase tracking-wide">Status</span>
          <span className={cn("font-semibold", statusColorClass)}>{statusLabel}</span>
        </div>
        <div className="flex justify-end">
          <Button asChild disabled={disabled} variant="outline">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
