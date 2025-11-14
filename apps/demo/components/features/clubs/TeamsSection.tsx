'use client'

import { useState } from 'react'
import { Button } from '@workspace/ui/shadcn/button'
import { Input } from '@workspace/ui/shadcn/input'
import { SearchIcon, UserPlusIcon, UploadIcon } from 'lucide-react'
import { CreateTeamModal, type CreateTeamData } from './CreateTeamModal'
import { TeamRowCard, type TeamData } from './TeamRowCard'
import type { RegistrationMember } from '@/components/features/registration/flow/types'
import { toast } from '@workspace/ui/shadcn/sonner'
import UploadRosterDialog from './UploadRosterDialog'

// Mock initial teams - in production this would come from the database
const INITIAL_TEAMS: TeamData[] = [
  {
    id: '1',
    name: 'U16 Thunder',
    division: 'All Star Cheer - U16 - 4',
    members: [],
  },
  {
    id: '2',
    name: 'Senior Lightning',
    division: 'All Star Cheer - Senior - 6',
    members: [],
  },
]

export default function TeamsSection() {
  const [teams, setTeams] = useState<TeamData[]>(INITIAL_TEAMS)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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
  const filteredTeams = sanitizedSearch
    ? teams.filter(
        team =>
          team.name.toLowerCase().includes(sanitizedSearch) ||
          team.division.toLowerCase().includes(sanitizedSearch)
      )
    : teams

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Teams</h2>
          <p className="text-sm text-muted-foreground">
            Create teams and manage rosters for your club
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" type="button" onClick={() => setIsCreateModalOpen(true)}>
            <UserPlusIcon className="mr-2 size-4" />
            Create Team
          </Button>
          <UploadRosterDialog />
        </div>
      </div>

      <div className="flex flex-col gap-4">
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
