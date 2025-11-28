'use client'

import { useCallback, useMemo, useState } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/shadcn/button'
import { Badge } from '@workspace/ui/shadcn/badge'
import { ChevronDownIcon, PenSquareIcon } from 'lucide-react'
import { RosterEditorDialog } from '@/components/features/registration/flow/RosterEditorDialog'
import { AvatarCluster } from '@/components/ui/avatars/AvatarCluster'
import { formatFriendlyDate, formatPhoneNumber } from '@/utils/format'
import type { RegistrationMember } from '@/components/features/registration/flow/types'

const ROLE_AVATAR_COLORS: Record<string, { background: string; foreground: string }> = {
  coach: { background: '#fde4d5', foreground: '#5f280d' },
  athlete: { background: '#e3f2ff', foreground: '#0b3659' },
  chaperone: { background: '#dff7e8', foreground: '#123d23' },
  reservist: { background: '#fff4d0', foreground: '#5a4000' },
}

function getAvatarPalette(role?: string) {
  if (!role) return undefined
  const normalizedRole = role.trim().toLowerCase()
  return ROLE_AVATAR_COLORS[normalizedRole]
}

function getInitials(name?: string) {
  if (!name) return '?'
  const chunks = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
  if (!chunks.length) return '?'
  return chunks.map(chunk => chunk[0]?.toUpperCase() ?? '').join('') || '?'
}

export type TeamData = {
  id: string
  name: string
  division: string
  members?: RegistrationMember[]
}

type TeamRowCardProps = {
  team: TeamData
  onUpdateMembers: (teamId: string, members: RegistrationMember[]) => void
  onDelete: (teamId: string) => void
}

export function TeamRowCard({ team, onUpdateMembers, onDelete }: TeamRowCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)

  const toggleExpanded = useCallback(() => setExpanded(prev => !prev), [])
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleExpanded()
    }
  }

  const members = useMemo(() => team.members ?? [], [team.members])
  const prioritizedMembers = useMemo(() => {
    if (!members.length) return []
    const coaches = members.filter(member => member.type?.toLowerCase() === 'coach')
    const others = members.filter(member => member.type?.toLowerCase() !== 'coach')
    return [...coaches, ...others]
  }, [members])
  const displayMembers = useMemo(() => prioritizedMembers.slice(0, 5), [prioritizedMembers])

  const handleSaveRoster = useCallback(
    (updatedMembers: RegistrationMember[]) => {
      onUpdateMembers(team.id, updatedMembers)
      setEditorOpen(false)
    },
    [onUpdateMembers, team.id]
  )

  const handleDeleteTeam = useCallback(() => {
    onDelete(team.id)
    setEditorOpen(false)
  }, [onDelete, team.id])

  const memberCount = members.length
  const additionalCount = Math.max(memberCount - displayMembers.length, 0)
  const fallbackInitials = useMemo(() => getInitials(team.name), [team.name])
  const showMemberPreview = memberCount > 0
  const avatarItems = useMemo(
    () =>
      displayMembers.map(member => ({
        label: getInitials(member.name),
        role: member.type,
        title: member.name ?? 'Participant',
      })),
    [displayMembers]
  )

  const hasMembers = members.length > 0

  return (
    <>
      <div className="border-border/70 bg-background/80 rounded-lg border">
        <div
          role="button"
          tabIndex={0}
          onClick={toggleExpanded}
          onKeyDown={handleKeyDown}
          className="focus-visible:ring-primary/40 flex w-full cursor-pointer items-center justify-between gap-3 px-6 py-4 text-left focus:outline-none focus-visible:ring-2"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-foreground truncate heading-4">{team.name}</p>
              <Badge variant="secondary" className="body-small">
                {team.division}
              </Badge>
              {showMemberPreview ? (
                <AvatarCluster
                  items={avatarItems}
                  fallbackLabel={fallbackInitials}
                  remainingCount={additionalCount}
                  getRolePalette={getAvatarPalette}
                />
              ) : (
                <span className="text-muted-foreground body-small">No members</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={event => {
                event.stopPropagation()
                setEditorOpen(true)
              }}
              aria-label={hasMembers ? 'Edit members' : 'Add members'}
            >
              <PenSquareIcon className="mr-2 size-4" aria-hidden="true" />
              {hasMembers ? 'Edit' : 'Add Members'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={event => {
                event.stopPropagation()
                toggleExpanded()
              }}
              aria-label={expanded ? 'Collapse team details' : 'Expand team details'}
            >
              <ChevronDownIcon className={cn('size-4 transition-transform', expanded && 'rotate-180')} />
            </Button>
          </div>
        </div>
        {expanded && (
          <div className="border-border/60 text-muted-foreground border-t body-small">
            {members.length ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-left body-small">
                  <thead className="bg-muted/40 text-muted-foreground body-small">
                    <tr>
                      <th className="px-3 py-3 font-medium sm:px-4">Name</th>
                      <th className="px-3 py-3 font-medium sm:px-4">DOB</th>
                      <th className="px-3 py-3 font-medium sm:px-5">Email</th>
                      <th className="px-3 py-3 font-medium sm:px-5">Phone</th>
                      <th className="px-3 py-3 text-right font-medium sm:px-4">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, index) => (
                      <tr key={`${team.id}-member-${index}`} className="border-t">
                        <td className="text-foreground px-3 py-3 sm:px-4">{member.name}</td>
                        <td className="px-3 py-3 sm:px-4">{formatFriendlyDate(member.dob)}</td>
                        <td className="px-3 py-3 sm:px-5">{member.email ?? '—'}</td>
                        <td className="px-3 py-3 sm:px-5">{formatPhoneNumber(member.phone)}</td>
                        <td className="text-muted-foreground px-3 py-3 text-right sm:px-4">{member.type ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center">No members added yet. Click &quot;Add Members&quot; to get started.</div>
            )}
          </div>
        )}
      </div>

      <RosterEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        members={members}
        teamName={team.name}
        onSave={handleSaveRoster}
        onDeleteTeam={handleDeleteTeam}
      />
    </>
  )
}
