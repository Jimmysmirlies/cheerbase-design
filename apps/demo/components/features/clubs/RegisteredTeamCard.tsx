'use client'

import { useMemo, useState, type KeyboardEvent } from 'react'
import { ChevronDownIcon, PencilIcon, UsersIcon } from 'lucide-react'

import { cn } from '@workspace/ui/lib/utils'
import { Skeleton } from '@workspace/ui/shadcn/skeleton'
import { formatFriendlyDate, formatPhoneNumber } from '@/utils/format'
import { Button } from '@workspace/ui/shadcn/button'
import { Badge } from '@workspace/ui/shadcn/badge'
import { GradientAvatar } from '@/components/ui/avatars/GradientAvatar'

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
  isEditMode?: boolean
  onEdit?: (teamId: string) => void
  /** Show loading skeleton instead of content */
  isLoading?: boolean
}

export function RegisteredTeamCard({ card, isEditMode = false, onEdit, isLoading = false }: RegisteredTeamCardProps) {
  const [expanded, setExpanded] = useState(false)
  const roster = useMemo(() => card.members ?? [], [card.members])
  const memberCount = roster.length
  const prioritizedRoster = useMemo(() => {
    if (!roster.length) return []
    const coaches = roster.filter(member => member.role?.toLowerCase() === 'coach')
    const others = roster.filter(member => member.role?.toLowerCase() !== 'coach')
    return [...coaches, ...others]
  }, [roster])

  // Loading skeleton - must be after all hooks
  if (isLoading) {
    return (
      <div className="w-full overflow-hidden rounded-md border border-border/70 bg-card/60">
        <div className="flex items-center gap-4 p-5">
          <Skeleton className="size-10 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-32 rounded" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="size-3.5 rounded-full" />
              <Skeleton className="h-3.5 w-24 rounded" />
            </div>
          </div>
          <Skeleton className="size-9 rounded-md" />
        </div>
      </div>
    )
  }

  const toggleExpanded = () => setExpanded(prev => !prev)
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleExpanded()
    }
  }

  return (
    <div className="w-full overflow-hidden rounded-md border border-border/70 bg-card/60 transition-all hover:border-primary/20">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={toggleExpanded}
        onKeyDown={handleKeyDown}
        className="flex cursor-pointer items-center gap-4 p-5 focus:outline-none"
      >
        <GradientAvatar name={card.name} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="heading-4 truncate text-foreground">{card.name}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <UsersIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
            <span className="body-small text-muted-foreground">
              {memberCount} {memberCount === 1 ? 'Participant' : 'Participants'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode && onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={event => {
                event.stopPropagation()
                onEdit(card.detailId)
              }}
            >
              <PencilIcon className="size-3.5" />
              Edit
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={event => {
              event.stopPropagation()
              toggleExpanded()
            }}
          >
            <ChevronDownIcon className={cn('size-5 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
          </Button>
        </div>
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
                    <th className="hidden px-3 py-3 font-medium md:table-cell md:px-5">Email</th>
                    <th className="hidden px-3 py-3 font-medium sm:table-cell sm:px-5">Phone</th>
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
                      <td className="hidden px-3 py-3 md:table-cell md:px-5">{member.email ?? '—'}</td>
                      <td className="hidden px-3 py-3 sm:table-cell sm:px-5">{formatPhoneNumber(member.phone ?? undefined)}</td>
                      <td className="px-3 py-3 text-right sm:px-4">
                        <RoleBadge role={member.role} />
                      </td>
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

function RoleBadge({ role }: { role?: string | null }) {
  const normalizedRole = role?.trim().toLowerCase()
  
  if (!normalizedRole) {
    return <span className="text-muted-foreground">—</span>
  }

  const roleConfig: Record<string, { label: string; className: string }> = {
    coach: {
      label: 'Coach',
      className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    },
    athlete: {
      label: 'Athlete',
      className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    },
    reservist: {
      label: 'Reservist',
      className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    },
    chaperone: {
      label: 'Chaperone',
      className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
    },
  }

  const config = roleConfig[normalizedRole] ?? {
    label: formatRole(role),
    className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-700',
  }

  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  )
}
