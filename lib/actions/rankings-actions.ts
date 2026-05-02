'use server'

import {
  getRankings,
  getDivisionById,
  getFighterById,
  getAllFighters,
  matchFighterName,
  OctagonRankings,
  OctagonDivision,
  OctagonFighter,
} from '@/lib/octagon-api'

export async function getAllRankings(): Promise<OctagonRankings[]> {
  return getRankings()
}

export async function getDivision(divisionId: string): Promise<OctagonDivision | null> {
  return getDivisionById(divisionId)
}

export async function getFighterFromOctagon(fighterId: string): Promise<OctagonFighter | null> {
  return getFighterById(fighterId)
}

export async function getAllOctagonFighters(): Promise<Record<string, OctagonFighter>> {
  return getAllFighters()
}

export interface DivisionWithFighters extends OctagonDivision {
  fighterDetails: OctagonFighter[]
  championDetails?: OctagonFighter
}

export async function getDivisionWithFighterDetails(
  divisionId: string
): Promise<DivisionWithFighters | null> {
  const division = await getDivisionById(divisionId)
  if (!division) return null

  const allFighters = await getAllFighters()

  const fighterDetails = division.fighters
    .map((f) => allFighters[f.id])
    .filter(Boolean)

  return {
    ...division,
    fighterDetails,
    championDetails: allFighters[division.champion.id],
  }
}

export interface RankingWithChampionDetails extends OctagonRankings {
  championDetails?: OctagonFighter
}

export async function getRankingsWithChampionDetails(): Promise<RankingWithChampionDetails[]> {
  const [rankings, allFighters] = await Promise.all([
    getRankings(),
    getAllFighters(),
  ])

  return rankings.map((ranking) => ({
    ...ranking,
    championDetails: allFighters[ranking.champion.id],
  }))
}

// Formatted fighter for display in the UI
export interface FormattedFighter {
  id: string
  name: string
  nickname: string
  imageUrl: string
  division: string
  record: string
  stance: string
  reach: string
  wins: string
  losses: string
  draws: string
  status: string
}

function formatOctagonFighter(id: string, fighter: OctagonFighter): FormattedFighter {
  return {
    id,
    name: fighter.name,
    nickname: fighter.nickname,
    imageUrl: fighter.imgUrl,
    division: fighter.category,
    record: `${fighter.wins}-${fighter.losses}${fighter.draws !== '0' ? `-${fighter.draws}` : ''}`,
    stance: fighter.fightingStyle || 'Unknown',
    reach: fighter.reach ? `${fighter.reach}"` : '',
    wins: fighter.wins,
    losses: fighter.losses,
    draws: fighter.draws,
    status: fighter.status,
  }
}

export async function getAllOctagonFightersFormatted(): Promise<FormattedFighter[]> {
  const allFighters = await getAllFighters()

  return Object.entries(allFighters).map(([id, fighter]) =>
    formatOctagonFighter(id, fighter)
  ).sort((a, b) => a.name.localeCompare(b.name))
}

export async function searchOctagonFighters(query: string): Promise<FormattedFighter[]> {
  const allFighters = await getAllFighters()
  const searchTerm = query.toLowerCase()

  return Object.entries(allFighters)
    .filter(([, fighter]) =>
      fighter.name.toLowerCase().includes(searchTerm) ||
      fighter.nickname?.toLowerCase().includes(searchTerm) ||
      fighter.category?.toLowerCase().includes(searchTerm)
    )
    .map(([id, fighter]) => formatOctagonFighter(id, fighter))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Get all rankings and create a map of fighter IDs to their rankings
export async function getFighterRankingsMap(): Promise<Map<string, { division: string; rank: number }>> {
  const rankings = await getRankings()
  const rankingMap = new Map<string, { division: string; rank: number }>()

  for (const division of rankings) {
    // Champion has rank 0
    rankingMap.set(division.champion.id, { division: division.categoryName, rank: 0 })

    // Ranked fighters (index + 1 since index 0 would be #1 ranked contender)
    division.fighters.forEach((fighter, index) => {
      if (!rankingMap.has(fighter.id)) {
        rankingMap.set(fighter.id, { division: division.categoryName, rank: index + 1 })
      }
    })
  }

  return rankingMap
}

// Get formatted fighters with rankings
export interface FormattedFighterWithRanking extends FormattedFighter {
  ranking?: { division: string; rank: number }
}

export async function getAllOctagonFightersWithRankings(): Promise<FormattedFighterWithRanking[]> {
  const [fighters, rankingMap] = await Promise.all([
    getAllOctagonFightersFormatted(),
    getFighterRankingsMap(),
  ])

  return fighters.map((fighter) => ({
    ...fighter,
    ranking: rankingMap.get(fighter.id),
  }))
}

// Get a single fighter with ranking
export async function getFighterWithRanking(fighterId: string): Promise<{
  fighter: OctagonFighter | null
  ranking?: { division: string; rank: number; divisionId: string }
}> {
  const [fighter, rankings] = await Promise.all([
    getFighterById(fighterId),
    getRankings(),
  ])

  if (!fighter) return { fighter: null }

  // Find fighter in rankings
  for (const division of rankings) {
    // Check if champion
    if (division.champion.id === fighterId) {
      return {
        fighter,
        ranking: { division: division.categoryName, rank: 0, divisionId: division.id },
      }
    }

    // Check in ranked fighters
    const rankIndex = division.fighters.findIndex((f) => f.id === fighterId)
    if (rankIndex !== -1) {
      return {
        fighter,
        ranking: { division: division.categoryName, rank: rankIndex + 1, divisionId: division.id },
      }
    }
  }

  return { fighter }
}

// Get two fighters for a face-off with full Octagon data and rankings
export async function getFightFightersWithDetails(
  fighter1Id: string,
  fighter1Name: string,
  fighter2Id: string,
  fighter2Name: string
): Promise<{
  fighter1: {
    id: string
    name: string
    octagonData: OctagonFighter | null
    ranking?: { division: string; rank: number; divisionId: string }
  }
  fighter2: {
    id: string
    name: string
    octagonData: OctagonFighter | null
    ranking?: { division: string; rank: number; divisionId: string }
  }
}> {
  const [allFighters, rankings] = await Promise.all([
    getAllFighters(),
    getRankings(),
  ])

  // Find fighters by name matching
  let fighter1Octagon: OctagonFighter | null = null
  let fighter2Octagon: OctagonFighter | null = null
  let fighter1OctagonId: string | null = null
  let fighter2OctagonId: string | null = null

  for (const [octagonId, fighter] of Object.entries(allFighters)) {
    if (matchFighterName(fighter1Name, fighter.name)) {
      fighter1Octagon = fighter
      fighter1OctagonId = octagonId
    }
    if (matchFighterName(fighter2Name, fighter.name)) {
      fighter2Octagon = fighter
      fighter2OctagonId = octagonId
    }
  }

  // Find rankings
  let fighter1Ranking: { division: string; rank: number; divisionId: string } | undefined
  let fighter2Ranking: { division: string; rank: number; divisionId: string } | undefined

  for (const division of rankings) {
    // Check champion
    if (division.champion.id === fighter1OctagonId) {
      fighter1Ranking = { division: division.categoryName, rank: 0, divisionId: division.id }
    }
    if (division.champion.id === fighter2OctagonId) {
      fighter2Ranking = { division: division.categoryName, rank: 0, divisionId: division.id }
    }

    // Check ranked fighters
    const f1Rank = division.fighters.findIndex((f) => f.id === fighter1OctagonId)
    const f2Rank = division.fighters.findIndex((f) => f.id === fighter2OctagonId)

    if (f1Rank !== -1 && !fighter1Ranking) {
      fighter1Ranking = { division: division.categoryName, rank: f1Rank + 1, divisionId: division.id }
    }
    if (f2Rank !== -1 && !fighter2Ranking) {
      fighter2Ranking = { division: division.categoryName, rank: f2Rank + 1, divisionId: division.id }
    }
  }

  return {
    fighter1: {
      id: fighter1Id,
      name: fighter1Name,
      octagonData: fighter1Octagon,
      ranking: fighter1Ranking,
    },
    fighter2: {
      id: fighter2Id,
      name: fighter2Name,
      octagonData: fighter2Octagon,
      ranking: fighter2Ranking,
    },
  }
}
