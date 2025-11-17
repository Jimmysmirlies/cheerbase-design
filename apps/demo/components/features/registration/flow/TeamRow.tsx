"use client"

/**
 * TeamRow Component
 *
 * Purpose:
 * - Collapsible team card displaying team name, member avatars, and roster details
 * - Used in registration flows to show registered teams within divisions
 *
 * Structure:
 * - Team Header (collapsed): Team name, avatar cluster, lock status
 * - Action Bar: Edit Team button, Expand/Collapse toggle
 * - Roster Details (expanded): Full member table with DOB, email, phone, role
 * - Roster Editor Dialog: Opens for editing team members
 *
 * Design Nicknames:
 * - "Team Header" = Collapsed state showing team name + avatars (lines 95-117)
 * - "Action Bar" = Edit/Expand buttons row (lines 118-144)
 * - "Roster Table" = Expandable member details table (lines 145-178)
 * - "Avatar Cluster" = Member preview bubbles (lines 107-114)
 */

import { useCallback, useMemo, useState } from 'react'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/shadcn/button'

import { ChevronDownIcon, PenSquareIcon } from 'lucide-react'

import type { RegistrationEntry, RegistrationMember, EntryStatusMeta } from './types'
import { formatFriendlyDate, formatPhoneNumber } from '@/utils/format'
import { RosterEditorDialog } from './RosterEditorDialog'
import { AvatarCluster } from '@/components/ui/avatars/AvatarCluster'

// Design Token: Role-based avatar color palette
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

type TeamRowProps = {
  entry: RegistrationEntry
  onRemove: () => void
  onUpdateMembers: (members: RegistrationMember[]) => void
  status: EntryStatusMeta
  readOnly: boolean
}

export function TeamRow({ entry, onRemove, onUpdateMembers, status, readOnly }: TeamRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const { isLocked, lockMessage } = status
  const actionsDisabled = readOnly || isLocked

  const toggleExpanded = useCallback(() => setExpanded(prev => !prev), [])
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleExpanded()
    }
  }

  const members = useMemo(() => entry.members ?? [], [entry.members])
  const prioritizedMembers = useMemo(() => {
    if (!members.length) return []
    const coaches = members.filter(member => member.type?.toLowerCase() === 'coach')
    const others = members.filter(member => member.type?.toLowerCase() !== 'coach')
    return [...coaches, ...others]
  }, [members])
  const displayMembers = useMemo(() => prioritizedMembers.slice(0, 5), [prioritizedMembers])
  const handleSaveRoster = useCallback(
    (updatedMembers: RegistrationMember[]) => {
      onUpdateMembers(updatedMembers)
      setEditorOpen(false)
    },
    [onUpdateMembers]
  )
  const memberCount = members.length ? members.length : entry.teamSize ?? 0
  const additionalCount = Math.max(memberCount - displayMembers.length, 0)
  const fallbackInitials = useMemo(() => getInitials(entry.teamName ?? entry.fileName ?? 'Team'), [
    entry.teamName,
    entry.fileName,
  ])
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

  return (
    <div className="flex items-start gap-2">
      {/* Main Team Card - Glass-style container with shadow */}
      <div className="border-border/70 bg-background/80 rounded-lg border flex-1 shadow-sm">

        {/* Team Header - Clickable area for expansion/collapse */}
        <div
          role="button"
          tabIndex={0}
          onClick={toggleExpanded}
          onKeyDown={handleKeyDown}
          className="focus-visible:ring-primary/40 flex w-full cursor-pointer items-center justify-between gap-3 px-6 py-4 text-left focus:outline-none focus-visible:ring-2"
        >
          {/* Left Side: Team name + Avatar Cluster */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              {/* Team Name */}
              <p className="text-foreground truncate heading-4">
                {entry.teamName ?? entry.fileName ?? 'Team'}
              </p>
              {/* Avatar Cluster - Member preview bubbles */}
              {showMemberPreview ? (
                <AvatarCluster
                  items={avatarItems}
                  fallbackLabel={fallbackInitials}
                  remainingCount={additionalCount}
                  getRolePalette={getAvatarPalette}
                />
              ) : null}
          </div>
          {/* Right Side: Lock status message (if applicable) */}
          {lockMessage ? <p className="text-muted-foreground body-small">{lockMessage}</p> : null}
        </div>

        {/* Action Bar - Edit and expand/collapse buttons */}
        <div className="flex items-center gap-2">
          {/* Edit Team Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={event => {
              event.stopPropagation()
              if (!actionsDisabled) setEditorOpen(true)
            }}
            aria-label="Edit roster"
            disabled={actionsDisabled}
          >
            <PenSquareIcon className="mr-2 size-4" aria-hidden="true" />
            Edit Team
          </Button>
          {/* Expand/Collapse Toggle */}
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

        {/* Roster Table - Expandable section with member details */}
        {expanded && (
          <div className="border-border/60 text-muted-foreground border-t body-small">
            {members.length ? (
              <div className="overflow-x-auto">
                {/* Member Details Table */}
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
                      <tr key={`${entry.id}-member-${index}`} className="border-t">
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
            ) : entry.mode === 'existing' ? (
              // Empty State: Existing team mode
              <div className="p-4">Roster details will be pulled from your workspace once registration is submitted.</div>
            ) : (
              // Empty State: File upload mode
              <div className="p-4">Roster file: {entry.fileName ?? 'Pending upload'}</div>
            )}
          </div>
        )}
      </div>

      {/* Roster Editor Dialog - Modal for editing team members */}
      <RosterEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        members={members}
        teamName={entry.teamName ?? entry.fileName ?? 'Team'}
        onSave={handleSaveRoster}
        onDeleteTeam={() => {
          if (!actionsDisabled) {
            onRemove()
          }
          setEditorOpen(false)
        }}
      />
    </div>
  )
}
