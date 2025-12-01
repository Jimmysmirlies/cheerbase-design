"use client"

import type { ComponentProps } from "react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/shadcn/button"
import { Badge } from "@workspace/ui/shadcn/badge"
import { Card, CardContent, CardFooter } from "@workspace/ui/shadcn/card"

import Link from "next/link"

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
  statusVariant = "amber",
  actionHref,
  actionLabel = "View",
  disabled = false,
}: EventRegisteredCardProps) {
  const heroStyle = image ? { backgroundImage: `url(${image})` } : undefined

  return (
    <Card className="flex h-full flex-col overflow-hidden p-0 shadow-md !rounded-sm gap-0">
      <div className={cn("relative h-40 bg-cover bg-center", !image && "bg-muted")} style={heroStyle}>
        <Badge variant={statusVariant} className="absolute left-4 top-4">
          {statusLabel}
        </Badge>
      </div>
      <CardContent className="flex flex-1 flex-col gap-6 p-6">
        <div className="space-y-2">
          <h3 className="heading-4 font-semibold text-foreground">{title}</h3>
        </div>
        <div className="space-y-3 text-sm text-foreground">
          {subtitle ? (
            <div className="flex items-center justify-between border-b border-border/70 pb-2">
              <span className="text-muted-foreground">Organizer</span>
              <span className="font-medium text-right">{subtitle}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{date}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium text-right">{location}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <span className="text-muted-foreground">Team</span>
            <span className="font-medium text-right">{teamName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Participants</span>
            <span className="font-medium">{participants}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-border/70 flex items-center justify-between border-t !p-6">
        <div className="text-sm">
          <span className="text-muted-foreground block text-xs uppercase tracking-wide">Invoice</span>
          <span className="text-foreground font-semibold">{invoice}</span>
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
