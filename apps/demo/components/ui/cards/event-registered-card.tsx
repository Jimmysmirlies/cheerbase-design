"use client"

import type { ComponentProps } from "react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/shadcn/button"
import { Badge } from "@workspace/ui/shadcn/badge"
import { CardContent, CardFooter } from "@workspace/ui/shadcn/card"

import { CalendarIcon, MapPinIcon, UserRoundIcon, UsersIcon } from "lucide-react"
import Link from "next/link"

import { GlassCard } from "@/components/ui/glass/glass-card"

type BadgeVariant = ComponentProps<typeof Badge>["variant"]

export type EventRegisteredCardProps = {
  image?: string
  title: string
  subtitle?: string
  teamName: string
  date: string
  location: string
  participants: number | string
  invoice: string
  statusLabel: string
  statusSubtext?: string
  statusVariant?: BadgeVariant
  actionHref: string
  actionLabel?: string
  disabled?: boolean
}

export function EventRegisteredCard({
  image,
  title,
  subtitle,
  teamName,
  date,
  location,
  participants,
  invoice,
  statusLabel,
  statusSubtext,
  statusVariant = "amber",
  actionHref,
  actionLabel = "View",
  disabled = false,
}: EventRegisteredCardProps) {
  const heroStyle = image ? { backgroundImage: `url(${image})` } : undefined

  return (
    <GlassCard className="flex h-full flex-col overflow-hidden p-0 shadow-md">
      <div className={cn("relative h-40 bg-cover bg-center", !image && "bg-muted")} style={heroStyle}>
        <Badge variant={statusVariant} className="absolute left-4 top-4">
          {statusLabel}
        </Badge>
      </div>
      <CardContent className="flex flex-1 flex-col gap-4 px-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {subtitle ? <p className="text-muted-foreground text-sm">{subtitle}</p> : null}
        </div>
        <div className="text-muted-foreground space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <CalendarIcon className="text-primary/70 size-4" />
            {date}
          </p>
          <p className="flex items-center gap-2">
            <MapPinIcon className="text-primary/70 size-4" />
            {location}
          </p>
          <p className="flex items-center gap-2">
            <UserRoundIcon className="text-primary/70 size-4" />
            {teamName}
          </p>
          <p className="flex items-center gap-2">
            <UsersIcon className="text-primary/70 size-4" />
            {participants} participants
          </p>
        </div>
        {statusSubtext ? <p className="text-xs text-muted-foreground">{statusSubtext}</p> : null}
      </CardContent>
      <CardFooter className="border-border/60 flex items-center justify-between border-t px-6 py-4">
        <div className="text-sm">
          <span className="text-muted-foreground block text-xs uppercase tracking-wide">Invoice</span>
          <span className="text-foreground font-semibold">{invoice}</span>
        </div>
        <Button asChild disabled={disabled} variant="outline">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </CardFooter>
    </GlassCard>
  )
}
