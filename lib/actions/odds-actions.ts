'use server'

import { enhancedOddsApi } from '@/lib/api/odds-api-enhanced'
import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

export async function syncOddsData() {
  try {
    const result = await enhancedOddsApi.syncOddsToDatabase()
    revalidatePath('/')
    revalidatePath('/events')
    revalidatePath('/fighters')
    return result
  } catch (error) {
    console.error('Failed to sync odds:', error)
    return {
      success: false,
      eventsSynced: 0,
      fightsSynced: 0,
      oddsSynced: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

export async function getUpcomingFights(limit: number = 10) {
  try {
    const fights = await prisma.fight.findMany({
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
        { createdAt: 'asc' }, // Use creation date as fallback for position
      ],
      take: limit,
    })

    return fights
  } catch (error) {
    console.error('Failed to get upcoming fights:', error)
    return []
  }
}

export async function getMainCardFights(limit: number = 10) {
  try {
    // Get fights ordered by importance (main event, title fights, then by event)
    const mainCardFights = await prisma.fight.findMany({
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

    // If no main card fights exist, fallback to regular upcoming fights with better ordering
    if (mainCardFights.length === 0) {
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
          { event: { isPpv: 'desc' } }, // PPV events first
        ],
        take: limit,
      })
      return regularFights
    }

    return mainCardFights
  } catch (error) {
    console.error('Failed to get main card fights:', error)
    return []
  }
}

export async function getEvents() {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'upcoming' },
      include: {
        fights: {
          include: {
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
          },
          orderBy: [
            { isMainEvent: 'desc' },
            { isTitleFight: 'desc' },
            { createdAt: 'asc' }
          ]
        },
      },
      orderBy: [
        { date: 'asc' } // Most upcoming event first (chronological order)
      ],
    })

    return events
  } catch (error) {
    console.error('Failed to get events:', error)
    return []
  }
}

export async function getEventById(id: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        fights: {
          include: {
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
            { isMainEvent: 'desc' },
            { isTitleFight: 'desc' },
            { createdAt: 'asc' }
          ]
        },
      },
    })

    return event
  } catch (error) {
    console.error('Failed to get event:', error)
    return null
  }
}

export async function getUfcEvents() {
  try {
    // Get UFC events with proper fight ordering
    const ufcEvents = await prisma.event.findMany({
      where: { 
        status: 'upcoming',
        promotion: 'UFC'
      },
      include: {
        fights: {
          include: {
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
            { isMainEvent: 'desc' },
            { isTitleFight: 'desc' },
            { createdAt: 'asc' }
          ]
        },
      },
      orderBy: [
        { isPpv: 'desc' },
        { date: 'asc' }
      ],
    })

    return ufcEvents
  } catch (error) {
    console.error('Failed to get UFC events:', error)
    return []
  }
}

export async function getFeaturedFights(limit: number = 5) {
  try {
    // Get actual main events and important fights
    const featuredFights = await prisma.fight.findMany({
      where: { 
        status: 'upcoming',
        OR: [
          { isMainEvent: true },
          { isTitleFight: true },
          { event: { isPpv: true } }
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
        { createdAt: 'asc' },
        { isMainEvent: 'desc' },
        { isTitleFight: 'desc' },
        { event: { isPpv: 'desc' } },
        { event: { date: 'asc' } }
      ],
      take: limit,
    })

    return featuredFights
  } catch (error) {
    console.error('Failed to get featured fights:', error)
    return []
  }
}

export async function getFighters() {
  try {
    const fighters = await prisma.fighterCache.findMany({
      orderBy: { name: 'asc' },
    })

    return fighters
  } catch (error) {
    console.error('Failed to get fighters:', error)
    return []
  }
}

export async function getFighterById(id: string) {
  try {
    const fighter = await prisma.fighterCache.findUnique({
      where: { id },
      include: {
        fightsAsFighter1: {
          include: {
            event: true,
            fighter2: true,
          },
        },
        fightsAsFighter2: {
          include: {
            event: true,
            fighter1: true,
          },
        },
        wonFights: true,
      },
    })

    return fighter
  } catch (error) {
    console.error('Failed to get fighter:', error)
    return null
  }
}

export async function getFightById(id: string) {
  try {
    const fight = await prisma.fight.findUnique({
      where: { id },
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
        },
      },
    })

    return fight
  } catch (error) {
    console.error('Failed to get fight:', error)
    return null
  }
}

export async function getBestOddsForFight(fightId: string) {
  try {
    return await enhancedOddsApi.getBestOdds(fightId)
  } catch (error) {
    console.error('Failed to get best odds:', error)
    return null
  }
}
