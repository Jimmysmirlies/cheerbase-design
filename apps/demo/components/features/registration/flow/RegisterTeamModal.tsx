import { useEffect, useState } from 'react'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/shadcn/button'
import { Input } from '@workspace/ui/shadcn/input'
import { Label } from '@workspace/ui/shadcn/label'
import { RadioGroup, RadioGroupItem } from '@workspace/ui/shadcn/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/shadcn/select'

import { UploadIcon } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@workspace/ui/shadcn/dialog'

import type { RegistrationEntry, TeamOption } from './types'

const ROSTER_TEMPLATE_PATH = '/templates/team-roster-template.xlsx'

type RegisterTeamModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  divisions: string[]
  teams: TeamOption[]
  onSubmit: (entry: RegistrationEntry) => void
}

export function RegisterTeamModal({ open, onOpenChange, divisions, teams, onSubmit }: RegisterTeamModalProps) {
  const [source, setSource] = useState<'existing' | 'upload'>('existing')
  const [division, setDivision] = useState<string>(divisions[0] ?? '')
  const [teamId, setTeamId] = useState<string>('')
  const [uploadTeamName, setUploadTeamName] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (open) {
      setSource('existing')
      setDivision(divisions[0] ?? '')
      setTeamId('')
      setUploadTeamName('')
      setFile(null)
    }
  }, [open, divisions])

  const filteredTeams = division ? teams.filter(team => !team.division || team.division === division) : teams
  const canSubmit = Boolean(division && (source === 'existing' ? teamId : file))

  const handleSubmit = () => {
    if (!canSubmit) return

    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `entry-${Date.now()}`

    if (source === 'existing') {
      const team = teams.find(t => t.id === teamId)
      if (!team) return
      onSubmit({
        id,
        division,
        mode: 'existing',
        teamId: team.id,
        teamName: team.name,
        teamSize: team.size,
      })
    } else {
      onSubmit({
        id,
        division,
        mode: 'upload',
        teamName: uploadTeamName || file?.name || 'Imported roster',
        fileName: file?.name,
      })
    }

    onOpenChange(false)
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(ROSTER_TEMPLATE_PATH)
      if (!response.ok) {
        throw new Error('Failed to load roster template')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'team-roster-template.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl gap-0">
        <DialogHeader className="mb-4">
          <DialogTitle>Register a team</DialogTitle>
          <DialogDescription>
            Select the team source, assign a division, and confirm to add it to the queue.
          </DialogDescription>
        </DialogHeader>

        <section className="mb-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">Team source</Label>
            <RadioGroup
              value={source}
              onValueChange={value => setSource(value as 'existing' | 'upload')}
              className="grid gap-2"
            >
              <SourceCard
                value="existing"
                selected={source === 'existing'}
                title="Select existing team"
                description="Use a roster already stored in your club workspace."
              />
              <SourceCard
                value="upload"
                selected={source === 'upload'}
                title="Upload roster file"
                description="Import a CSV or Excel roster using the template."
              />
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">Division</Label>
            <Select value={division} onValueChange={setDivision}>
              <SelectTrigger className="w-full justify-between">
                <SelectValue placeholder="Select division" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map(value => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {source === 'existing' ? (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">Team</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger className="w-full justify-between">
                  <SelectValue placeholder="Choose a team" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {filteredTeams.length ? (
                    filteredTeams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="text-muted-foreground px-3 py-2 text-sm">
                      There are no teams in this division.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">Team name</Label>
                <Input
                  value={uploadTeamName}
                  onChange={event => setUploadTeamName(event.target.value)}
                  placeholder="Enter team name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">Roster file</Label>
                <label className="border-border/70 text-muted-foreground hover:border-primary/60 flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-6 text-center text-sm transition">
                  <UploadIcon className="text-primary size-5" />
                  <span>{file?.name ?? 'Drop a CSV or Excel file, or browse'}</span>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="sr-only"
                    onChange={event => {
                      const nextFile = event.target.files?.[0] ?? null
                      setFile(nextFile)
                    }}
                  />
                </label>
                <Button type="button" variant="outline" size="sm" onClick={() => void handleDownloadTemplate()}>
                  Download roster template
                </Button>
              </div>
            </div>
          )}
        </section>

        <DialogFooter className="flex flex-col gap-2 pb-0 sm:flex-row sm:justify-between sm:pb-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
            Add team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SourceCard({
  value,
  selected,
  title,
  description,
}: {
  value: 'existing' | 'upload'
  selected: boolean
  title: string
  description: string
}) {
  return (
    <Label
      htmlFor={`source-${value}`}
      className={cn(
        'focus-visible:outline-primary cursor-pointer rounded-2xl border p-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        selected ? 'border-primary shadow-primary/10 shadow-md' : 'border-border/60 hover:border-primary/40'
      )}
    >
      <div className="flex items-start gap-3">
        <RadioGroupItem id={`source-${value}`} value={value} className="mt-1" />
        <div className="space-y-1">
          <p className="text-foreground text-sm font-medium">{title}</p>
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>
      </div>
    </Label>
  )
}
