"use client"

import { useMemo, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"
import { ScrollArea } from "@workspace/ui/shadcn/scroll-area"

import { EventRegisteredCard, type EventRegisteredCardProps } from "@/components/ui/cards/EventRegisteredCard"
import { useClubData } from "@/hooks/useClubData"
import { findEventById } from "@/data/events"
import { formatCurrency, formatFriendlyDate } from "@/utils/format"
import { resolveDivisionPricing } from "@/utils/pricing"
import type { ClubData } from "@/lib/club-data"
import type { TeamRoster } from "@/types/club"

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
] as const

type RegistrationRow = EventRegisteredCardProps & { id: string }

export default function RegistrationsSection() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("upcoming")
  const { data, loading, error } = useClubData()
  const categorized = useMemo(() => categorizeRegistrations(data ?? undefined), [data])
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

      {loading ? (
        <div className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">Loading registrations...</div>
      ) : error ? (
        <div className="text-destructive rounded-2xl border border-dashed p-6 text-center text-sm">
          Failed to load registrations.
        </div>
      ) : null}

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

function categorizeRegistrations(data?: ClubData) {
  if (!data) return { upcoming: [] as RegistrationRow[], past: [] as RegistrationRow[] }

  const { registrations, registeredTeams, teams, rosters } = data
  const registeredTeamMap = new Map(registeredTeams.map(rt => [rt.id, rt]))
  const rosterByTeam = new Map(rosters.map(r => [r.teamId, r]))
  const now = new Date()
  const upcoming: RegistrationRow[] = []
  const past: RegistrationRow[] = []

  registrations.forEach(reg => {
    const registeredTeam = reg.registeredTeam ?? registeredTeamMap.get(reg.registeredTeamId)
    const sourceTeam = registeredTeam?.sourceTeamId ? teams.find(item => item.id === registeredTeam.sourceTeamId) : null
    const roster = registeredTeam?.sourceTeamId ? rosterByTeam.get(registeredTeam.sourceTeamId) : null
    const participants =
      registeredTeam?.members?.length ?? (roster ? countRosterParticipants(roster) : reg.athletes ?? registeredTeam?.size ?? 0)
    const event = findEventById(reg.eventId)
    const divisionPricing = event?.availableDivisions?.find(option => option.name === reg.division)
    const invoiceTotalNumber =
      divisionPricing && participants ? participants * resolveDivisionPricing(divisionPricing).price : reg.invoiceTotal
    const invoiceTotal = formatCurrency(invoiceTotalNumber)
    const isPaid = reg.status === "paid" || Boolean(reg.paidAt)
    const statusLabel = isPaid ? "Paid" : "Unpaid"
    const statusSubtext = isPaid
      ? `Paid on ${formatFriendlyDate(reg.paidAt ?? undefined)}`
      : `Auto-pay on ${formatFriendlyDate(reg.paymentDeadline ?? undefined)}`
    const eventDate = new Date(reg.eventDate)
    const bucket: "upcoming" | "past" = Number.isNaN(eventDate.getTime()) ? "upcoming" : eventDate < now ? "past" : "upcoming"

    const card: RegistrationRow = {
      id: reg.id,
      image: event?.image,
      title: reg.eventName,
      subtitle: event?.organizer ?? event?.type,
      teamName: registeredTeam?.name ?? sourceTeam?.name ?? registeredTeam?.sourceTeamId ?? reg.registeredTeamId,
      date: formatFriendlyDate(reg.eventDate),
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
