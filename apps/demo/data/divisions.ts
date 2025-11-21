export type DivisionTier = {
  name: string
  levels: string[]
}

export type DivisionCategory = {
  name: string
  tiers: DivisionTier[]
}

// Shared ticket/entry divisions used across demo events, mapped to canonical divisionFullNames values.
export const eventDivisionNames = {
  worlds: 'All Star Cheer - Open - 4',
  chaperone: 'All Star Cheer - Paracheer (adapted or specialized) - 1',
  stuntIndyDuo: 'Specialty - Stunt - All Divisions - All Levels',
  prepNovice: 'Initiation/Prep Cheer - U12 Prep - 1',
  allStarScholastic: 'Scolaire Cheer - Secondaire Juvenile - 3',
  adaptive: 'ICU Cheer - Adaptive Abilities - Advanced',
} as const

export const divisionPricingDefaults: Record<
  (typeof eventDivisionNames)[keyof typeof eventDivisionNames],
  { label: string; before: number | null; after: number | null }
> = {
  [eventDivisionNames.worlds]: { label: 'Worlds (2 Performances)', before: 120, after: 140 },
  [eventDivisionNames.chaperone]: { label: 'Accompanist / Chaperone', before: 40, after: 40 },
  [eventDivisionNames.stuntIndyDuo]: { label: 'Stunt / Individual / Duo', before: 45, after: 45 },
  [eventDivisionNames.prepNovice]: { label: 'Initiation / Prep / Novice', before: 40, after: 60 },
  [eventDivisionNames.allStarScholastic]: { label: 'Scholastic', before: 40, after: 60 },
  [eventDivisionNames.adaptive]: { label: 'Adaptive / Cheer Abilities', before: 0, after: 0 },
}

export const divisionCatalog: DivisionCategory[] = [
  {
    name: 'All Star Cheer',
    tiers: [
      { name: 'Maitres/Masters', levels: ['2ST'] },
      { name: 'Open', levels: ['2ST', '3', '3ST', '4', '4.2', '4ST', '5ST'] },
      { name: 'Open AG', levels: ['5', '6', '6ST', '7', '7ST'] },
      { name: 'Open Coed', levels: ['6ST', '7ST'] },
      { name: 'Open Large Coed (5-16 Males)', levels: ['5', '6', '7'] },
      { name: 'Open Small Coed (1-4 Males)', levels: ['5', '6', '7'] },
      { name: 'Paracheer (adapted or specialized)', levels: ['1', '2'] },
      {
        name: 'U12',
        levels: ['1', '1 Restricted', '2', '2ST', '3', '3ST', '4', '4ST'],
      },
      {
        name: 'U16',
        levels: ['1', '1 Restricted', '2', '2ST', '3', '3ST', '4', '4ST', '5', '5ST'],
      },
      {
        name: 'U18',
        levels: [
          '1',
          '1 Restricted',
          '2',
          '2ST',
          '3',
          '3ST',
          '4',
          '4.2',
          '4ST',
          '5ST',
          '6',
        ],
      },
      { name: 'U18 AG', levels: ['5', '6ST'] },
      { name: 'U18 Coed', levels: ['6ST'] },
      { name: 'U18 Small Coed (1-4 Males)', levels: ['5'] },
      { name: 'U6', levels: ['1 Restricted'] },
      { name: 'U8', levels: ['1', '1 Restricted'] },
    ],
  },
  {
    name: 'ICU Cheer',
    tiers: [
      { name: 'AG Junior', levels: ['Advanced', 'Elite'] },
      { name: 'AG Senior', levels: ['Elite', 'Premier'] },
      { name: 'AG Youth', levels: ['Advanced', 'Intermediate'] },
      { name: 'Adaptive Abilities', levels: ['Advanced'] },
      { name: 'Coed Junior', levels: ['Advanced', 'Elite'] },
      { name: 'Coed Senior', levels: ['Elite', 'Premier'] },
      { name: 'Coed Youth', levels: ['Advanced', 'Intermediate'] },
      { name: 'Special Olympics', levels: ['Intermediate'] },
    ],
  },
  {
    name: 'Initiation/Prep Cheer',
    tiers: [
      { name: 'U12 Prep', levels: ['1', '2'] },
      { name: 'U16 Prep', levels: ['1', '2', '2ST'] },
      { name: 'U18 Prep', levels: ['1', '2', '2ST'] },
      { name: 'U6 Prep', levels: ['1'] },
      { name: 'U8 Prep', levels: ['1'] },
    ],
  },
  {
    name: 'Novice Cheer',
    tiers: [
      { name: 'U12 Novice', levels: ['Novice'] },
      { name: 'U16 Novice', levels: ['Novice'] },
      { name: 'U6 Novice', levels: ['Novice'] },
      { name: 'U8 Novice', levels: ['Novice'] },
    ],
  },
  {
    name: 'Scolaire Cheer',
    tiers: [
      { name: 'Collegial', levels: ['4'] },
      { name: 'Collegial Game Day', levels: ['1'] },
      { name: 'Primaire Game Day', levels: ['1'] },
      { name: 'Primaire Ouvert initiation', levels: ['1'] },
      { name: 'Primaire Ouvert recreatif', levels: ['1'] },
      { name: 'Primaire Paracheer', levels: ['1'] },
      { name: 'Primaire moustique', levels: ['1', '2'] },
      { name: 'Primaire novice', levels: ['1'] },
      { name: 'Primaire ouvert', levels: ['1'] },
      { name: 'Secondaire Benjamin', levels: ['1', '2'] },
      { name: 'Secondaire Cadet', levels: ['2', '3'] },
      { name: 'Secondaire Game Day', levels: ['1'] },
      { name: 'Secondaire Juvenile', levels: ['3', '4'] },
      { name: 'Secondaire Ouvert', levels: ['1', '2', '2ST', '3', '3ST'] },
      { name: 'Secondaire Ouvert initiation', levels: ['1'] },
      { name: 'Secondaire Ouvert recreatif', levels: ['1'] },
      { name: 'Secondaire Paracheer', levels: ['1'] },
      { name: 'Universitaire Fille', levels: ['7'] },
      { name: 'Universitaire Mixte', levels: ['4', '7'] },
      { name: 'Universitaire Game Day', levels: ['1'] },
    ],
  },
  {
    name: 'Specialty',
    tiers: [
      { name: 'Duo', levels: ['All Divisions - All Levels'] },
      { name: 'Individual', levels: ['All Divisions - All Levels'] },
      { name: 'Stunt', levels: ['All Divisions - All Levels'] },
    ],
  },
]

export const divisionIndex = divisionCatalog.reduce<Record<string, string[]>>((acc, category) => {
  category.tiers.forEach(tier => {
    const key = `${category.name} - ${tier.name}`
    acc[key] = tier.levels
  })
  return acc
}, {})

// Flat list of fully qualified divisions, e.g. "All Star Cheer - U18 - 1".
export const divisionFullNames: string[] = divisionCatalog.flatMap(category =>
  category.tiers.flatMap(tier => tier.levels.map(level => `${category.name} - ${tier.name} - ${level}`))
)
