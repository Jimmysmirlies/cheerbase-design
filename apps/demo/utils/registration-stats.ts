import type { RegistrationEntry } from '@/components/features/registration/flow/types'

export function getEntryMemberCount(entry: RegistrationEntry) {
  return entry.members?.length ?? entry.teamSize ?? 0
}

export function groupEntriesByDivision(entries: RegistrationEntry[]): Record<string, RegistrationEntry[]> {
  return entries.reduce<Record<string, RegistrationEntry[]>>((acc, entry) => {
    const list = acc[entry.division] ?? []
    list.push(entry)
    acc[entry.division] = list
    return acc
  }, {})
}
