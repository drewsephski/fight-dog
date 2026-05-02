// Octagon API client for UFC fighter data
const OCTAGON_API_BASE = 'https://api.octagon-api.com'

export interface OctagonFighter {
  category: string
  draws: string
  imgUrl: string
  losses: string
  name: string
  nickname: string
  wins: string
  status: string
  placeOfBirth: string
  trainsAt: string
  fightingStyle: string
  age: string
  height: string
  weight: string
  octagonDebut: string
  reach: string
  legReach: string
}

export interface OctagonRankings {
  id: string
  categoryName: string
  champion: {
    id: string
    championName: string
  }
  fighters: Array<{
    id: string
    name: string
  }>
}

export interface OctagonDivision {
  id: string
  categoryName: string
  champion: {
    id: string
    championName: string
  }
  fighters: Array<{
    id: string
    name: string
  }>
}

// API Functions
export async function getAllFighters(): Promise<Record<string, OctagonFighter>> {
  try {
    const response = await fetch(`${OCTAGON_API_BASE}/fighters`)
    if (!response.ok) {
      throw new Error(`Failed to fetch fighters: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching fighters from Octagon API:', error)
    return {}
  }
}

export async function getFighterById(fighterId: string): Promise<OctagonFighter | null> {
  try {
    const response = await fetch(`${OCTAGON_API_BASE}/fighter/${fighterId}`)
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch fighter: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching fighter ${fighterId} from Octagon API:`, error)
    return null
  }
}

export async function getRankings(): Promise<OctagonRankings[]> {
  try {
    const response = await fetch(`${OCTAGON_API_BASE}/rankings`)
    if (!response.ok) {
      throw new Error(`Failed to fetch rankings: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching rankings from Octagon API:', error)
    return []
  }
}

export async function getDivisionById(divisionId: string): Promise<OctagonDivision | null> {
  try {
    const response = await fetch(`${OCTAGON_API_BASE}/division/${divisionId}`)
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch division: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching division ${divisionId} from Octagon API:`, error)
    return null
  }
}

// Helper function to create fighter ID from name (for API lookup)
export function createFighterId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

// Helper function to match fighter names (fuzzy matching)
export function matchFighterName(name: string, apiName: string): boolean {
  const normalize = (str: string) => 
    str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  
  const name1 = normalize(name)
  const name2 = normalize(apiName)
  
  // Exact match
  if (name1 === name2) return true
  
  // Check if one contains the other (handles cases like "Jon Jones" vs "Jon 'Bones' Jones")
  if (name1.includes(name2) || name2.includes(name1)) return true
  
  // Check if last names match
  const name1Parts = name1.split(' ')
  const name2Parts = name2.split(' ')
  
  if (name1Parts.length > 1 && name2Parts.length > 1) {
    return name1Parts[name1Parts.length - 1] === name2Parts[name2Parts.length - 1]
  }
  
  return false
}

// Cache for API responses
const fighterCache = new Map<string, OctagonFighter>()
const allFightersCache = new Map<string, Record<string, OctagonFighter>>()

export async function getCachedFighter(fighterId: string): Promise<OctagonFighter | null> {
  // Check individual cache first
  if (fighterCache.has(fighterId)) {
    return fighterCache.get(fighterId)!
  }

  // Try to get from API
  const fighter = await getFighterById(fighterId)
  if (fighter) {
    fighterCache.set(fighterId, fighter)
    return fighter
  }

  return null
}

export async function getCachedAllFighters(): Promise<Record<string, OctagonFighter>> {
  if (allFightersCache.size > 0) {
    const cached = Array.from(allFightersCache.values())[0]
    if (Object.keys(cached).length > 0) {
      return cached
    }
  }

  const fighters = await getAllFighters()
  if (Object.keys(fighters).length > 0) {
    allFightersCache.set('all', fighters)
  }
  
  return fighters
}

// Function to find fighter by name matching
export async function findFighterByName(name: string): Promise<OctagonFighter | null> {
  const allFighters = await getCachedAllFighters()
  
  for (const [fighterId, fighter] of Object.entries(allFighters)) {
    if (matchFighterName(name, fighter.name)) {
      return fighter
    }
  }
  
  return null
}
