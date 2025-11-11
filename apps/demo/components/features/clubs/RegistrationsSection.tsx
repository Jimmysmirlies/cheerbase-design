"use client"

import { useMemo, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"
import { ScrollArea } from "@workspace/ui/shadcn/scroll-area"

import { EventRegisteredCard, type EventRegisteredCardProps } from "@/components/ui/cards/EventRegisteredCard"
import { demoRegistrations } from "@/data/clubs/registrations"
import { demoRosters } from "@/data/clubs/members"
import { demoTeams } from "@/data/clubs/teams"
import { findEventById } from "@/data/events"
import { formatCurrency, formatFriendlyDate } from "@/utils/format"
import { resolveDivisionPricing } from "@/utils/pricing"
import type { TeamRoster } from "@/types/club"

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
] as const

type RegistrationRow = EventRegisteredCardProps & { id: string }

export default function RegistrationsSection() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("upcoming")
  const categorized = useMemo(() => categorizeRegistrations(demoRegistrations), [])
  const rows = activeTab === "upcoming" ? categorized.upcoming : categorized.past

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Registrations</h2>
          <p className="text-sm text-muted-foreground">Review invoice status and update rosters before payment deadlines.</p>
        </div>
        <div className="flex gap-2">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "rounded-full px-4 py-1 text-sm font-medium transition",
                activeTab === tab.key ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <ScrollArea className="w-full">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.length ? (
            rows.map(row => <EventRegisteredCard key={row.id} {...row} />)
          ) : (
            <div className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
              {activeTab === "upcoming" ? "No upcoming registrations yet." : "No past registrations to show."}
            </div>
          )}
        </div>
      </ScrollArea>
    </section>
  )
}

function categorizeRegistrations(registrations: typeof demoRegistrations) {
  const now = new Date()
  const upcoming: RegistrationRow[] = []
  const past: RegistrationRow[] = []

  registrations.forEach(reg => {
    const team = demoTeams.find(item => item.id === reg.teamId)
    const roster = demoRosters.find(item => item.teamId === reg.teamId)
    const participants = roster ? countRosterParticipants(roster) : reg.athletes
    const event = findEventById(reg.eventId)
    const divisionPricing = event?.availableDivisions?.find(option => option.name === reg.division)
    const invoiceTotal =
      divisionPricing && participants
        ? formatCurrency(participants * resolveDivisionPricing(divisionPricing).price)
        : reg.invoiceTotal
    const isPaid = reg.status === 'paid' || Boolean(reg.paidAt)
    const statusLabel = isPaid ? 'Paid' : 'Unpaid'
    const statusSubtext = isPaid
      ? `Paid on ${formatFriendlyDate(reg.paidAt)}`
      : `Auto-pay on ${formatFriendlyDate(reg.paymentDeadline)}`
    const eventDate = new Date(reg.eventDate)
    const bucket: "upcoming" | "past" = Number.isNaN(eventDate.getTime()) ? "upcoming" : eventDate < now ? "past" : "upcoming"

    const card: RegistrationRow = {
      id: reg.id,
      image: event?.image,
      title: reg.eventName,
      subtitle: event?.organizer ?? event?.type,
      teamName: team?.name ?? reg.teamId,
      date: reg.eventDate,
      location: event?.location ?? reg.location,
      participants,
      invoice: invoiceTotal,
      statusLabel,
      statusSubtext,
      statusVariant: isPaid ? "green" : "amber",
      actionHref: `/clubs/registrations/${reg.id}`,
    }

    if (bucket === "past") {
      past.push(card)
    } else {
      upcoming.push(card)
    }
  })

  return { upcoming, past }
}

function countRosterParticipants(roster: TeamRoster) {
  return (
    (roster.coaches?.length ?? 0) +
    (roster.athletes?.length ?? 0) +
    (roster.reservists?.length ?? 0) +
    (roster.chaperones?.length ?? 0)
  )
}
