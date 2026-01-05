'use client'

import { useCallback, useMemo } from 'react'
import { Input } from '@workspace/ui/shadcn/input'
import { Label } from '@workspace/ui/shadcn/label'
import { DatePicker } from '@workspace/ui/shadcn/date-picker'
import { GlassSelect, type GlassSelectOption } from '@workspace/ui/components/glass-select'
import type { Event, EventVenue } from '@/types/events'

const US_STATES: GlassSelectOption[] = [
  { value: 'Alabama', label: 'Alabama' },
  { value: 'Alaska', label: 'Alaska' },
  { value: 'Arizona', label: 'Arizona' },
  { value: 'Arkansas', label: 'Arkansas' },
  { value: 'California', label: 'California' },
  { value: 'Colorado', label: 'Colorado' },
  { value: 'Connecticut', label: 'Connecticut' },
  { value: 'Delaware', label: 'Delaware' },
  { value: 'Florida', label: 'Florida' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Hawaii', label: 'Hawaii' },
  { value: 'Idaho', label: 'Idaho' },
  { value: 'Illinois', label: 'Illinois' },
  { value: 'Indiana', label: 'Indiana' },
  { value: 'Iowa', label: 'Iowa' },
  { value: 'Kansas', label: 'Kansas' },
  { value: 'Kentucky', label: 'Kentucky' },
  { value: 'Louisiana', label: 'Louisiana' },
  { value: 'Maine', label: 'Maine' },
  { value: 'Maryland', label: 'Maryland' },
  { value: 'Massachusetts', label: 'Massachusetts' },
  { value: 'Michigan', label: 'Michigan' },
  { value: 'Minnesota', label: 'Minnesota' },
  { value: 'Mississippi', label: 'Mississippi' },
  { value: 'Missouri', label: 'Missouri' },
  { value: 'Montana', label: 'Montana' },
  { value: 'Nebraska', label: 'Nebraska' },
  { value: 'Nevada', label: 'Nevada' },
  { value: 'New Hampshire', label: 'New Hampshire' },
  { value: 'New Jersey', label: 'New Jersey' },
  { value: 'New Mexico', label: 'New Mexico' },
  { value: 'New York', label: 'New York' },
  { value: 'North Carolina', label: 'North Carolina' },
  { value: 'North Dakota', label: 'North Dakota' },
  { value: 'Ohio', label: 'Ohio' },
  { value: 'Oklahoma', label: 'Oklahoma' },
  { value: 'Oregon', label: 'Oregon' },
  { value: 'Pennsylvania', label: 'Pennsylvania' },
  { value: 'Rhode Island', label: 'Rhode Island' },
  { value: 'South Carolina', label: 'South Carolina' },
  { value: 'South Dakota', label: 'South Dakota' },
  { value: 'Tennessee', label: 'Tennessee' },
  { value: 'Texas', label: 'Texas' },
  { value: 'Utah', label: 'Utah' },
  { value: 'Vermont', label: 'Vermont' },
  { value: 'Virginia', label: 'Virginia' },
  { value: 'Washington', label: 'Washington' },
  { value: 'West Virginia', label: 'West Virginia' },
  { value: 'Wisconsin', label: 'Wisconsin' },
  { value: 'Wyoming', label: 'Wyoming' },
]

const COUNTRIES: GlassSelectOption[] = [
  { value: 'United States', label: 'United States' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Mexico', label: 'Mexico' },
]

type DateLocationSectionProps = {
  eventData: Partial<Event>
  onUpdate: (updates: Partial<Event>) => void
}

export function DateLocationSection({ eventData, onUpdate }: DateLocationSectionProps) {
  const eventDate = eventData.date ? new Date(eventData.date) : undefined
  const validEventDate = eventDate && !Number.isNaN(eventDate.getTime()) ? eventDate : undefined

  const venue = eventData.venue || {
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  }

  const formatDateForStorage = (date: Date | undefined): string => {
    if (!date) return ''
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const updateVenue = useCallback((updates: Partial<EventVenue>) => {
    const newVenue = { ...venue, ...updates }
    // Also update the legacy location field for backwards compatibility
    const locationString = [
      newVenue.name,
      newVenue.streetAddress,
      newVenue.city,
      newVenue.state,
      newVenue.zipCode,
      newVenue.country,
    ].filter(Boolean).join(', ')
    
    onUpdate({ 
      venue: newVenue,
      location: locationString,
    })
  }, [venue, onUpdate])

  return (
    <div className="flex flex-col gap-4 pt-2">
      {/* Event Date */}
      <div className="space-y-2">
        <Label htmlFor="event-date">Event Date *</Label>
        <DatePicker
          date={validEventDate}
          onDateChange={(date) => {
            onUpdate({ date: formatDateForStorage(date) })
          }}
          placeholder="Select event date"
          className="w-full"
        />
      </div>

      {/* Venue Name */}
      <div className="space-y-2">
        <Label htmlFor="venue-name">Venue Name</Label>
        <Input
          id="venue-name"
          value={venue.name || ''}
          onChange={(e) => updateVenue({ name: e.target.value })}
          placeholder="e.g., Madison Square Garden"
          className="w-full"
        />
      </div>

      {/* Street Address */}
      <div className="space-y-2">
        <Label htmlFor="street-address">Street Address *</Label>
        <Input
          id="street-address"
          value={venue.streetAddress || ''}
          onChange={(e) => updateVenue({ streetAddress: e.target.value })}
          placeholder="Street address"
          className="w-full"
        />
      </div>

      {/* Apt/Suite */}
      <div className="space-y-2">
        <Label htmlFor="apt-suite">Apt/Suite</Label>
        <Input
          id="apt-suite"
          value={venue.aptSuite || ''}
          onChange={(e) => updateVenue({ aptSuite: e.target.value })}
          placeholder="Apt, Suite, Unit, etc."
          className="w-full"
        />
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label htmlFor="city">City *</Label>
        <Input
          id="city"
          value={venue.city || ''}
          onChange={(e) => updateVenue({ city: e.target.value })}
          placeholder="City"
          className="w-full"
        />
      </div>

      {/* State & Zip */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <GlassSelect
            label="State *"
            value={venue.state || ''}
            onValueChange={(value) => updateVenue({ state: value })}
            options={US_STATES}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip-code">Zip Code *</Label>
          <Input
            id="zip-code"
            value={venue.zipCode || ''}
            onChange={(e) => updateVenue({ zipCode: e.target.value })}
            placeholder="Zip code"
            className="w-full"
          />
        </div>
      </div>

      {/* Country */}
      <div className="space-y-2">
        <GlassSelect
          label="Country *"
          value={venue.country || 'United States'}
          onValueChange={(value) => updateVenue({ country: value })}
          options={COUNTRIES}
          className="w-full"
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="venue-phone">Phone</Label>
        <Input
          id="venue-phone"
          type="tel"
          value={venue.phone || ''}
          onChange={(e) => updateVenue({ phone: e.target.value })}
          placeholder="(555) 123-4567"
          className="w-full"
        />
      </div>
    </div>
  )
}

