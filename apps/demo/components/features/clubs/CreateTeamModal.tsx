'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@workspace/ui/shadcn/button'
import { Input } from '@workspace/ui/shadcn/input'
import { Label } from '@workspace/ui/shadcn/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/shadcn/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/shadcn/dialog'
import { divisionCatalog } from '@/data/divisions'

export type CreateTeamData = {
  id: string
  name: string
  division: string
}

type CreateTeamModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (team: CreateTeamData) => void
}

export function CreateTeamModal({ open, onOpenChange, onSubmit }: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState('')
  const [category, setCategory] = useState('')
  const [tier, setTier] = useState('')
  const [level, setLevel] = useState('')

  useEffect(() => {
    if (open) {
      setTeamName('')
      setCategory(divisionCatalog[0]?.name ?? '')
      setTier('')
      setLevel('')
    }
  }, [open])

  const selectedCategory = useMemo(
    () => divisionCatalog.find(cat => cat.name === category),
    [category]
  )

  const selectedTier = useMemo(
    () => selectedCategory?.tiers.find(t => t.name === tier),
    [selectedCategory, tier]
  )

  useEffect(() => {
    if (category && selectedCategory) {
      setTier(selectedCategory.tiers[0]?.name ?? '')
    }
  }, [category, selectedCategory])

  useEffect(() => {
    if (tier && selectedTier) {
      setLevel(selectedTier.levels[0] ?? '')
    }
  }, [tier, selectedTier])

  const division = useMemo(() => {
    if (!category || !tier || !level) return ''
    return `${category} - ${tier} - ${level}`
  }, [category, tier, level])

  const canSubmit = Boolean(teamName.trim() && category && tier && level)

  const handleSubmit = () => {
    if (!canSubmit) return

    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `team-${Date.now()}`

    onSubmit({
      id,
      name: teamName.trim(),
      division,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Create a team</DialogTitle>
          <DialogDescription>
            Add a new team to your club. You&apos;ll be able to add members after creation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              placeholder="e.g., U16 Thunder"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && canSubmit) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {divisionCatalog.map(cat => (
                  <SelectItem key={cat.name} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && selectedTier && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tier">Tier</Label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger id="tier" className="w-full">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory.tiers.map(t => (
                      <SelectItem key={t.name} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger id="level" className="w-full">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTier.levels.map(lvl => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Create Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
