'use server'

import { prisma } from '@/lib/db/prisma'
import { findFighterByName, getCachedAllFighters } from '@/lib/octagon-api'

interface EnhancedFight {
  id: string
  weightClass: string
  isTitleFight: boolean
  isMainEvent: boolean
  fighter1: {
    id: string
    name: string
    imageUrl?: string | null
  }
  fighter2: {
    id: string
    name: string
    imageUrl?: string | null
  }
  event: {
    name: string
    date: Date
  }
  oddsSnapshots: Array<{
    fighter1Odds: number
    fighter2Odds: number
    bookmakerName?: string
    marketKey?: string
  }>
  userPrediction?: {
    predictedWinnerId: string
  } | null
}

export async function getEnhancedMainCardFights(limit: number = 10): Promise<EnhancedFight[]> {
  try {
    // Get fights from database
    const fights = await prisma.fight.findMany({
      where: { 
        status: 'upcoming',
        OR: [
          { isMainEvent: true },
          { isTitleFight: true }
        ]
      },
      include: {
        event: true,
        fighter1: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          }
        },
        fighter2: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          }
        },
        oddsSnapshots: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [
        { event: { date: 'asc' } },
        { isMainEvent: 'desc' },
        { isTitleFight: 'desc' }
      ],
      take: limit,
    })

    // If no main card fights exist, fallback to regular upcoming fights
    if (fights.length === 0) {
      const regularFights = await prisma.fight.findMany({
        where: { status: 'upcoming' },
        include: {
          event: true,
          fighter1: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            }
          },
          fighter2: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            }
          },
          oddsSnapshots: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: [
          { event: { date: 'asc' } },
          { event: { isPpv: 'desc' } },
        ],
        take: limit,
      })
      return await enhanceFightsWithOctagonData(regularFights)
    }

    return await enhanceFightsWithOctagonData(fights)
  } catch (error) {
    console.error('Failed to get enhanced main card fights:', error)
    return []
  }
}

async function enhanceFightsWithOctagonData(fights: any[]): Promise<EnhancedFight[]> {
  // Get all fighters from Octagon API
  const octagonFighters = await getCachedAllFighters()
  
  const enhancedFights = fights.map(fight => {
    // Find matching fighters in Octagon data
    const fighter1Octagon = findMatchingOctagonFighter(fight.fighter1.name, octagonFighters)
    const fighter2Octagon = findMatchingOctagonFighter(fight.fighter2.name, octagonFighters)

    return {
      id: fight.id,
      weightClass: fight.weightClass,
      isTitleFight: fight.isTitleFight,
      isMainEvent: fight.isMainEvent,
      fighter1: {
        id: fight.fighter1.id,
        name: fight.fighter1.name,
        imageUrl: fighter1Octagon?.imgUrl || fight.fighter1.imageUrl,
      },
      fighter2: {
        id: fight.fighter2.id,
        name: fight.fighter2.name,
        imageUrl: fighter2Octagon?.imgUrl || fight.fighter2.imageUrl,
      },
      event: {
        name: fight.event.name,
        date: fight.event.date,
      },
      oddsSnapshots: fight.oddsSnapshots,
      userPrediction: fight.userPrediction,
    }
  })

  return enhancedFights
}

function findMatchingOctagonFighter(fighterName: string, octagonFighters: Record<string, any>) {
  const normalize = (str: string) => 
    str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  
  const name1 = normalize(fighterName)

  for (const [fighterId, fighter] of Object.entries(octagonFighters)) {
    const name2 = normalize(fighter.name)
    
    // Exact match
    if (name1 === name2) return fighter
    
    // Check if one contains the other
    if (name1.includes(name2) || name2.includes(name1)) return fighter
    
    // Check if last names match
    const name1Parts = name1.split(' ')
    const name2Parts = name2.split(' ')
    
    if (name1Parts.length > 1 && name2Parts.length > 1) {
      if (name1Parts[name1Parts.length - 1] === name2Parts[name2Parts.length - 1]) {
        return fighter
      }
    }
  }
  
  return null
}
