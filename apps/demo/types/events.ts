import type { BrandGradient } from '@/lib/gradients'

export type Organizer = {
  id: string
  name: string
  visibility: string
  region: string
  gradient: BrandGradient
  // Profile
  email?: string
  supportEmail?: string
  logo?: string
  // Stats
  followers: number
  eventsCount: number
  hostingYears: number
}

export type EventVenue = {
  name?: string
  streetAddress: string
  aptSuite?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
}

export type EventDocument = {
  name: string
  description: string
  href: string
}

export type Event = {
  id: string
  name: string
  organizer: string
  type: 'Championship' | 'Friendly Competition'
  date: string
  /** @deprecated Use venue instead */
  location: string
  venue?: EventVenue
  teams: string
  image: string
  slots: {
    filled: number
    capacity: number
    statusLabel?: string
  }
  description: string
  tags?: string[]
  gallery?: string[]
  documents?: EventDocument[]
  availableDivisions?: DivisionPricing[]
  /** ISO date string for registration deadline. If not provided, defaults to day before event. */
  registrationDeadline?: string
  /** ISO date string for early bird pricing deadline. */
  earlyBirdDeadline?: string
  /** Event status: draft (not visible publicly) or published (visible) */
  status?: 'draft' | 'published'
  /** ISO date string for when event was last updated */
  updatedAt?: string
}

export type EventCategory = {
  title: string
  subtitle: string
  events: Event[]
}

export type DivisionPricing = {
  name: string
  earlyBird?: {
    price: number
    deadline?: string // ISO date (YYYY-MM-DD)
  }
  regular: {
    price: number
  }
}
