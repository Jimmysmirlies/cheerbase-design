'use client'

import { useMemo, useState, type KeyboardEvent } from 'react'
import { ChevronDownIcon } from 'lucide-react'

import { cn } from '@workspace/ui/lib/utils'
import { formatFriendlyDate, formatPhoneNumber } from '@/utils/format'
import { Button } from '@workspace/ui/shadcn/button'

export type RegisteredTeamMember = {
  id?: string | null
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
  dob?: string | null
  role?: string | null
}

type RegisteredTeamCardProps = {
  card: {
    id: string
    name: string
    division: string
    members?: RegisteredTeamMember[]
    detailId: string
  }
}

export function RegisteredTeamCard({ card }: RegisteredTeamCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { divisionLabel, levelLabel } = useMemo(() => parseDivision(card.division), [card.division])
  const roster = useMemo(() => card.members ?? [], [card.members])
  const memberCount = roster.length
  const memberLabel = memberCount === 1 ? 'member' : 'members'
  const prioritizedRoster = useMemo(() => {
    if (!roster.length) return []
    const coaches = roster.filter(member => member.role?.toLowerCase() === 'coach')
    const others = roster.filter(member => member.role?.toLowerCase() !== 'coach')
    return [...coaches, ...others]
  }, [roster])

  const toggleExpanded = () => setExpanded(prev => !prev)
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleExpanded()
    }
  }

  return (
    <div className="w-full overflow-hidden rounded-sm border border-border/70 bg-background/80 shadow-sm">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={toggleExpanded}
        onKeyDown={handleKeyDown}
        className="flex cursor-pointer items-center gap-4 px-5 py-4 focus:outline-none"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="heading-4 truncate text-foreground">{card.name}</h3>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Division:</span> {divisionLabel}
            {levelLabel !== '—' ? ` · Level ${levelLabel}` : ''}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-sm text-muted-foreground"
          onClick={event => {
            event.stopPropagation()
            toggleExpanded()
          }}
        >
          <span className="text-foreground font-medium">{memberCount}</span>
          <span>{memberLabel}</span>
          <ChevronDownIcon className={cn('size-4 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
        </Button>
      </div>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div
          aria-hidden={!expanded}
          className={cn(
            'overflow-hidden border-t bg-muted/20 transition-[opacity,transform,border-color] duration-300 ease-out',
            expanded
              ? 'border-border/70 opacity-100 translate-y-0'
              : 'pointer-events-none border-transparent opacity-0 -translate-y-2'
          )}
        >
          {prioritizedRoster.length ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3 font-medium sm:px-4">Name</th>
                    <th className="px-3 py-3 font-medium sm:px-4">DOB</th>
                    <th className="px-3 py-3 font-medium sm:px-5">Email</th>
                    <th className="px-3 py-3 font-medium sm:px-5">Phone</th>
                    <th className="px-3 py-3 text-right font-medium sm:px-4">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {prioritizedRoster.map((member, index) => (
                    <tr
                      key={member.id ?? `${card.id}-member-${index}`}
                      className={cn('border-t', expanded && 'dropdown-fade-in')}
                      style={expanded ? { animationDelay: `${index * 60}ms` } : undefined}
                    >
                      <td className="text-foreground px-3 py-3 sm:px-4">{formatMemberName(member)}</td>
                      <td className="px-3 py-3 sm:px-4">{formatFriendlyDate(member.dob ?? undefined)}</td>
                      <td className="px-3 py-3 sm:px-5">{member.email ?? '—'}</td>
                      <td className="px-3 py-3 sm:px-5">{formatPhoneNumber(member.phone ?? undefined)}</td>
                      <td className="px-3 py-3 text-right sm:px-4">{formatRole(member.role)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Roster details will appear once this team is synced.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function parseDivision(division: string) {
  const parts = division
    .split('-')
    .map(part => part.trim())
    .filter(Boolean)
  if (!parts.length) {
    return { divisionLabel: '—', levelLabel: '—' }
  }
  if (parts.length === 1) {
    return { divisionLabel: parts[0] ?? '—', levelLabel: '—' }
  }
  const level = parts.pop() ?? '—'
  const divisionLabel = parts.length ? parts.join(' - ') : '—'
  return { divisionLabel, levelLabel: level }
}

function formatMemberName(member: RegisteredTeamMember) {
  if (member.name?.trim()) return member.name.trim()
  const name = [member.firstName, member.lastName].filter(Boolean).join(' ').trim()
  return name || 'Team member'
}

function formatRole(role?: string | null) {
  if (!role) return '—'
  const normalized = role.trim()
  if (!normalized) return '—'
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}
