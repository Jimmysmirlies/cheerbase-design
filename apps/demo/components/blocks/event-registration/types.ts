export type TeamOption = {
  id: string
  name: string
  division?: string
  size?: number
}

export type RegistrationMember = {
  name: string
  type: string
  dob?: string
  email?: string
  phone?: string
}

export type RegistrationEntry = {
  id: string
  division: string
  mode: 'existing' | 'upload'
  teamId?: string
  teamName?: string
  teamSize?: number
  fileName?: string
  members?: RegistrationMember[]
}

export const DEFAULT_ROLE = 'Athlete'
export const ROLE_OPTIONS = [DEFAULT_ROLE, 'Coach', 'Reservist', 'Chaperone'] as const
