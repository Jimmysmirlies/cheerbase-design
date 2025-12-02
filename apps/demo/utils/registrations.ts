import type { Registration, TeamRoster } from '@/types/club'

export type RegistrationSnapshotMeta = {
  snapshotSourceTeamId?: string
  snapshotTakenAt?: string
  snapshotHash?: string
}

export type RegistrationLockMeta = {
  status?: Registration['status']
  paymentDeadline?: string
  registrationDeadline?: string
  paidAt?: string
}

export function buildSnapshotHash(roster?: TeamRoster): string | undefined {
  if (!roster) return undefined
  const members = [
    ...(roster.coaches ?? []),
    ...(roster.athletes ?? []),
    ...(roster.reservists ?? []),
    ...(roster.chaperones ?? []),
  ]
  if (!members.length) return undefined
  const payload = members
    .map(member => [member.firstName, member.lastName, member.dob, member.email, member.phone].join('|'))
    .sort()
    .join('||')
  return simpleHash(payload)
}

function simpleHash(input: string): string {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }
  return `${hash}`
}

export function isRegistrationLocked(meta: RegistrationLockMeta, referenceDate: Date = new Date()): boolean {
  if (meta.paidAt) return true
  const deadlineString = meta.registrationDeadline ?? meta.paymentDeadline
  if (!deadlineString) return false
  const deadline = new Date(deadlineString)
  if (Number.isNaN(deadline.getTime())) return false
  return referenceDate > deadline
}

export function isSnapshotOutOfDate(snapshotTakenAt?: string, rosterUpdatedAt?: string): boolean {
  if (!snapshotTakenAt || !rosterUpdatedAt) return false
  const snapshotDate = new Date(snapshotTakenAt)
  const rosterDate = new Date(rosterUpdatedAt)
  if (Number.isNaN(snapshotDate.getTime()) || Number.isNaN(rosterDate.getTime())) return false
  return rosterDate > snapshotDate
}
