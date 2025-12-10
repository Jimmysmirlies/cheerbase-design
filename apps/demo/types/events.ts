import type { BrandGradient } from '@/lib/gradients'

export type Organizer = {
  name: string
  visibility: string
  region: string
  gradient: BrandGradient
  // Stats
  followers: number
  eventsCount: number
  hostingYears: number
}

export type Event = {
  id: string
  name: string
  organizer: string
  type: 'Championship' | 'Friendly Competition'
  date: string
  location: string
  teams: string
  fee: string
  image: string
  slots: {
    filled: number
    capacity: number
    statusLabel?: string
  }
  registrationFeePercent?: number
  pricePerParticipant: string
  description: string
  tags?: string[]
  gallery?: string[]
  availableDivisions?: DivisionPricing[]
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
    deadline: string // ISO date (YYYY-MM-DD)
  }
  regular: {
    price: number
  }
}
