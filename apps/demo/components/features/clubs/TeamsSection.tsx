'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@workspace/ui/shadcn/button'
import { Input } from '@workspace/ui/shadcn/input'
import { SearchIcon, UserPlusIcon } from 'lucide-react'
import { CreateTeamModal, type CreateTeamData } from './CreateTeamModal'
import { TeamRowCard, type TeamData } from './TeamRowCard'
import type { RegistrationMember } from '@/components/features/registration/flow/types'
import { toast } from '@workspace/ui/shadcn/sonner'
import UploadRosterDialog from './UploadRosterDialog'
import { useClubData } from '@/hooks/useClubData'
import { useAuth } from '@/components/providers/AuthProvider'
import type { TeamRoster } from '@/types/club'

export default function TeamsSection() {
  const { user } = useAuth()
  const { data, loading, error } = useClubData(user?.id)
  const [teams, setTeams] = useState<TeamData[]>([])
  const [hasHydrated, setHasHydrated] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    if (!data || hasHydrated) return
    const rosterMap = new Map<string, TeamRoster>(data.rosters.map(roster => [roster.teamId, roster]))
    const hydrated = data.teams.map(team => ({
      id: team.id,
      name: team.name,
      division: team.division,
      members: rosterToMembers(rosterMap.get(team.id)),
    }))
    setTeams(hydrated)
    setHasHydrated(true)
  }, [data, hasHydrated])

  const handleCreateTeam = (teamData: CreateTeamData) => {
    const newTeam: TeamData = {
      ...teamData,
      members: [],
    }
    setTeams(prev => [...prev, newTeam])
    toast.success(`${teamData.name} created successfully`)
  }

  const handleUpdateMembers = (teamId: string, members: RegistrationMember[]) => {
    setTeams(prev =>
      prev.map(team => (team.id === teamId ? { ...team, members } : team))
    )
    toast.success('Team roster updated')
  }

  const handleDeleteTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId)
    setTeams(prev => prev.filter(t => t.id !== teamId))
    toast.success(`${team?.name ?? 'Team'} removed`)
  }

  const sanitizedSearch = searchTerm.trim().toLowerCase()
  const filteredTeams = useMemo(
    () =>
      sanitizedSearch
        ? teams.filter(
            team =>
              team.name.toLowerCase().includes(sanitizedSearch) ||
              team.division.toLowerCase().includes(sanitizedSearch)
          )
        : teams,
    [sanitizedSearch, teams]
  )

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="Search teams or divisions"
            className="w-full pl-9"
          />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            size="sm"
            variant="gradient"
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={loading}
          >
            <UserPlusIcon className="mr-2 size-4" />
            Create Team
          </Button>
          <UploadRosterDialog />
        </div>
      </div>

      {loading ? (
        <div className="text-muted-foreground rounded-xl border border-dashed border-border/60 p-8 text-center">
          Loading teams...
        </div>
      ) : error ? (
        <div className="text-destructive rounded-xl border border-dashed border-border/60 p-8 text-center">
          Failed to load teams.
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="space-y-3">
          {filteredTeams.length > 0 ? (
            filteredTeams.map(team => (
              <TeamRowCard
                key={team.id}
                team={team}
                onUpdateMembers={handleUpdateMembers}
                onDelete={handleDeleteTeam}
              />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
              <p className="text-muted-foreground body-small">
                {searchTerm ? 'No teams found matching your search' : 'No teams yet. Create your first team to get started.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateTeamModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateTeam}
      />
    </section>
  )
}

function rosterToMembers(roster?: TeamRoster): RegistrationMember[] {
  if (!roster) return []
  const toMember = (person: { firstName: string; lastName: string; dob?: string; email?: string; phone?: string }, type: string): RegistrationMember => ({
    name: `${person.firstName} ${person.lastName}`,
    type,
    dob: person.dob,
    email: person.email,
    phone: person.phone,
  })
  return [
    ...roster.coaches.map(person => toMember(person, 'Coach')),
    ...roster.athletes.map(person => toMember(person, 'Athlete')),
    ...roster.reservists.map(person => toMember(person, 'Reservist')),
    ...roster.chaperones.map(person => toMember(person, 'Chaperone')),
  ]
}
