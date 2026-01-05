'use client'

import { useCallback, useMemo } from 'react'
import { Input } from '@workspace/ui/shadcn/input'
import { Label } from '@workspace/ui/shadcn/label'
import { Button } from '@workspace/ui/shadcn/button'
import { GlassSelect, type GlassSelectOption } from '@workspace/ui/components/glass-select'
import { XIcon, PlusIcon } from 'lucide-react'
import { eventDivisionNames } from '@/data/divisions'
import type { Event, DivisionPricing } from '@/types/events'

type PricingSectionProps = {
  eventData: Partial<Event>
  onUpdate: (updates: Partial<Event>) => void
}

export function PricingSection({ eventData, onUpdate }: PricingSectionProps) {
  const divisions = eventData.availableDivisions || []

  const divisionOptions: GlassSelectOption[] = useMemo(() => 
    Object.values(eventDivisionNames).map((name) => ({
      value: name,
      label: name,
    })),
    []
  )

  const addDivision = useCallback(() => {
    const newDivision: DivisionPricing = {
      name: eventDivisionNames.worlds,
      regular: { price: 0 },
    }
    onUpdate({ availableDivisions: [...divisions, newDivision] })
  }, [divisions, onUpdate])

  const updateDivision = useCallback((index: number, updates: Partial<DivisionPricing>) => {
    const updated = divisions.map((div, i) => 
      i === index ? { ...div, ...updates } : div
    )
    onUpdate({ availableDivisions: updated })
  }, [divisions, onUpdate])

  const removeDivision = useCallback((index: number) => {
    const updated = divisions.filter((_, i) => i !== index)
    onUpdate({ availableDivisions: updated })
  }, [divisions, onUpdate])

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex items-center justify-between">
        <p className="body-text text-muted-foreground">Set pricing per participant for each division</p>
        <Button type="button" variant="outline" size="sm" onClick={addDivision}>
          <PlusIcon className="mr-2 size-4" />
          Add Division
        </Button>
      </div>

      {divisions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
          <p className="text-sm">No divisions added yet</p>
        </div>
      )}

      {divisions.map((division, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <GlassSelect
                    label="Division Name"
                    value={division.name}
                    onValueChange={(value) => updateDivision(index, { name: value })}
                    options={divisionOptions}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Early Bird Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={division.earlyBird?.price || ''}
                      onChange={(e) => {
                        const price = parseFloat(e.target.value) || 0
                        updateDivision(index, {
                          earlyBird: price > 0 ? { price } : undefined,
                        })
                      }}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Regular Price *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={division.regular.price || ''}
                      onChange={(e) => {
                        const price = parseFloat(e.target.value) || 0
                        updateDivision(index, {
                          regular: { price },
                        })
                      }}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDivision(index)}
                className="ml-4"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          </div>
        ))}
    </div>
  )
}

