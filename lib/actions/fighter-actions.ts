'use server'

import { prisma } from '@/lib/db/prisma'
import { findFighterByName, createFighterId, OctagonFighter } from '@/lib/octagon-api'

// Enhanced fighter data with Octagon API integration
export interface EnhancedFighter {
  id: string
  name: string
  nickname?: string | null
  imageUrl?: string | null
  record?: string | null
  wins: number
  losses: number
  draws: number
  noContests: number
  height?: string | null
  weight?: string | null
  reach?: string | null
  stance?: string | null
  age?: number | null
  nationality?: string | null
  division?: string | null
  // Additional Octagon API fields
  octagonData?: OctagonFighter
}

// Get enhanced fighter data with Octagon API integration
export async function getEnhancedFighter(fighterId: string): Promise<EnhancedFighter | null> {
  try {
    // Get fighter from database
    const fighter = await prisma.fighterCache.findUnique({
      where: { id: fighterId }
    })

    if (!fighter) {
      return null
    }

    // Try to get additional data from Octagon API
    let octagonData: OctagonFighter | null = null
    
    // First try to find by exact name match
    octagonData = await findFighterByName(fighter.name)

    // If no match found, try with different variations
    if (!octagonData && fighter.nickname) {
      octagonData = await findFighterByName(`${fighter.name} ${fighter.nickname}`)
    }

    // If still no match, try creating fighter ID from name
    if (!octagonData) {
      const fighterIdFromName = createFighterId(fighter.name)
      const { getFighterById } = await import('@/lib/octagon-api')
      octagonData = await getFighterById(fighterIdFromName)
    }

    // Update database with Octagon data if found and missing
    if (octagonData && !fighter.imageUrl) {
      await prisma.fighterCache.update({
        where: { id: fighterId },
        data: {
          imageUrl: octagonData.imgUrl || fighter.imageUrl,
          nickname: octagonData.nickname || fighter.nickname,
          height: octagonData.height || fighter.height,
          weight: octagonData.weight || fighter.weight,
          reach: octagonData.reach || fighter.reach,
          nationality: octagonData.placeOfBirth || fighter.nationality,
          // Update record if not set
          record: fighter.record || `${octagonData.wins}-${octagonData.losses}-${octagonData.draws}`,
          // Update win/loss counts if different
          wins: fighter.wins || parseInt(octagonData.wins) || 0,
          losses: fighter.losses || parseInt(octagonData.losses) || 0,
          draws: fighter.draws || parseInt(octagonData.draws) || 0,
        }
      })
    }

    return {
      id: fighter.id,
      name: fighter.name,
      nickname: fighter.nickname,
      imageUrl: fighter.imageUrl || octagonData?.imgUrl,
      record: fighter.record,
      wins: fighter.wins,
      losses: fighter.losses,
      draws: fighter.draws,
      noContests: fighter.noContests,
      height: fighter.height,
      weight: fighter.weight,
      reach: fighter.reach,
      stance: fighter.stance,
      age: fighter.age,
      nationality: fighter.nationality,
      division: fighter.division,
      octagonData: octagonData || undefined
    }
  } catch (error) {
    console.error('Error getting enhanced fighter data:', error)
    return null
  }
}

// Get multiple enhanced fighters
export async function getEnhancedFighters(fighterIds: string[]): Promise<EnhancedFighter[]> {
  const fighters: EnhancedFighter[] = []

  for (const fighterId of fighterIds) {
    const fighter = await getEnhancedFighter(fighterId)
    if (fighter) {
      fighters.push(fighter)
    }
  }

  return fighters
}

// Update all fighters with Octagon API data (for admin/sync purposes)
export async function syncAllFightersWithOctagon(): Promise<{
  updated: number
  errors: string[]
}> {
  const errors: string[] = []
  let updated = 0

  try {
    // Get all fighters from database
    const allFighters = await prisma.fighterCache.findMany({
      select: { id: true, name: true, nickname: true }
    })

    // Get all fighters from Octagon API
    const { getCachedAllFighters } = await import('@/lib/octagon-api')
    const octagonFighters = await getCachedAllFighters()

    for (const dbFighter of allFighters) {
      try {
        let octagonData: OctagonFighter | null = null

        // Try to find matching fighter in Octagon data
        for (const [octagonId, octagonFighter] of Object.entries(octagonFighters)) {
          const { matchFighterName } = await import('@/lib/octagon-api')
          if (matchFighterName(dbFighter.name, octagonFighter.name)) {
            octagonData = octagonFighter
            break
          }
        }

        if (octagonData) {
          await prisma.fighterCache.update({
            where: { id: dbFighter.id },
            data: {
              imageUrl: octagonData.imgUrl,
              nickname: octagonData.nickname || dbFighter.nickname,
              height: octagonData.height,
              weight: octagonData.weight,
              reach: octagonData.reach,
              nationality: octagonData.placeOfBirth,
              division: octagonData.category,
              record: `${octagonData.wins}-${octagonData.losses}-${octagonData.draws}`,
              wins: parseInt(octagonData.wins) || 0,
              losses: parseInt(octagonData.losses) || 0,
              draws: parseInt(octagonData.draws) || 0,
            }
          })
          updated++
        }
      } catch (error) {
        errors.push(`Failed to sync fighter ${dbFighter.name}: ${error}`)
      }
    }
  } catch (error) {
    errors.push(`Failed to sync fighters: ${error}`)
  }

  return { updated, errors }
}

// Get fighter image URL with fallback
export async function getFighterImageUrl(fighterId: string): Promise<string> {
  const fighter = await getEnhancedFighter(fighterId)
  
  if (fighter?.imageUrl) {
    return fighter.imageUrl
  }

  // Fallback to placeholder or default image
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fighter?.name || 'Unknown')}&background=1f2937&color=fff&size=200&bold=true`
}

// Create fighter component data for UI
export async function getFighterComponentData(fighterId: string) {
  const fighter = await getEnhancedFighter(fighterId)
  
  if (!fighter) {
    return null
  }

  return {
    id: fighter.id,
    name: fighter.name,
    nickname: fighter.nickname,
    imageUrl: fighter.imageUrl || await getFighterImageUrl(fighterId),
    record: fighter.record,
    stats: {
      height: fighter.height || fighter.octagonData?.height,
      weight: fighter.weight || fighter.octagonData?.weight,
      reach: fighter.reach || fighter.octagonData?.reach,
      age: fighter.age || fighter.octagonData?.age,
      stance: fighter.stance,
      nationality: fighter.nationality || fighter.octagonData?.placeOfBirth,
      fightingStyle: fighter.octagonData?.fightingStyle,
      trainsAt: fighter.octagonData?.trainsAt,
      octagonDebut: fighter.octagonData?.octagonDebut,
      status: fighter.octagonData?.status,
    }
  }
}
