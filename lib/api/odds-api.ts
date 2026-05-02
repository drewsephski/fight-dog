import { prisma } from '@/lib/db/prisma'

const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4'
const API_KEY = process.env.ODDS_API_KEY

export interface OddsEvent {
  id: string
  sport_key: string
  sport_title: string
  commence_time: string
  home_team: string
  away_team: string
  home_team_nickname?: string
  away_team_nickname?: string
  completed: boolean
  scores?: {
    home_team: number
    away_team: number
  }
  last_update?: string
  bookmakers: Bookmaker[]
}

export interface Bookmaker {
  key: string
  title: string
  last_update: string
  markets: Market[]
}

export interface Market {
  key: string
  last_update: string
  outcomes: Outcome[]
}

export interface Outcome {
  name: string
  price: number
  point?: number
  description?: string
}

export interface EventGroup {
  eventDate: Date
  eventName: string
  fights: OddsEvent[]
  isPpv: boolean
  estimatedEventNumber: number
}

export interface SyncResult {
  success: boolean
  eventsSynced: number
  fightsSynced: number
  oddsSynced: number
  errors: string[]
}

class OddsApiClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = API_KEY || ''
    this.baseUrl = ODDS_API_BASE_URL
  }

  private ensureApiKey(): void {
    if (!this.apiKey) {
      throw new Error('ODDS_API_KEY environment variable is required')
    }
  }

  async getMmaEvents(
    dateFormat: string = 'iso',
    commenceTimeFrom?: string,
    commenceTimeTo?: string
  ): Promise<OddsEvent[]> {
    this.ensureApiKey()
    const url = new URL(`${this.baseUrl}/sports/mma_mixed_martial_arts/events`)
    url.searchParams.append('apiKey', this.apiKey)
    url.searchParams.append('dateFormat', dateFormat)
    
    if (commenceTimeFrom) {
      url.searchParams.append('commenceTimeFrom', commenceTimeFrom)
    }
    if (commenceTimeTo) {
      url.searchParams.append('commenceTimeTo', commenceTimeTo)
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Odds API error: ${response.status} ${response.statusText}`)
    }

    const events = await response.json()
    // Return empty array for events without odds
    return events.map((event: OddsEvent) => ({ ...event, bookmakers: [] }))
  }

  async getMmaOdds(
    regions: string = 'us,uk,eu',
    markets: string = 'h2h,totals',
    oddsFormat: string = 'american',
    commenceTimeFrom?: string,
    commenceTimeTo?: string
  ): Promise<OddsEvent[]> {
    this.ensureApiKey()
    const url = new URL(`${this.baseUrl}/sports/mma_mixed_martial_arts/odds`)
    url.searchParams.append('apiKey', this.apiKey)
    url.searchParams.append('regions', regions)
    url.searchParams.append('markets', markets)
    url.searchParams.append('oddsFormat', oddsFormat)
    
    if (commenceTimeFrom) {
      url.searchParams.append('commenceTimeFrom', commenceTimeFrom)
    }
    if (commenceTimeTo) {
      url.searchParams.append('commenceTimeTo', commenceTimeTo)
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Odds API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getMmaEventOdds(eventId: string): Promise<OddsEvent> {
    this.ensureApiKey()
    const url = new URL(`${this.baseUrl}/sports/mma_mixed_martial_arts/events/${eventId}/odds`)
    url.searchParams.append('apiKey', this.apiKey)
    url.searchParams.append('regions', 'us,uk,eu')
    url.searchParams.append('markets', 'h2h,totals')
    url.searchParams.append('oddsFormat', 'american')

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Odds API error: ${response.status} ${response.statusText}`)
    }

    const events = await response.json()
    return events[0] // Single event response
  }

  async syncOddsToDatabase(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      eventsSynced: 0,
      fightsSynced: 0,
      oddsSynced: 0,
      errors: [],
    }

    // Skip sync if API key is not configured
    if (!this.apiKey) {
      result.errors.push('ODDS_API_KEY not configured - skipping sync')
      return result
    }

    try {
      // Get both events and odds for comprehensive data
      const [eventsData, oddsData] = await Promise.all([
        this.getMmaEvents(),
        this.getMmaOdds()
      ])
      
      // Merge events with odds data
      const mergedEvents = this.mergeEventsWithOdds(eventsData, oddsData)
      
      // Group fights by UFC events using intelligent detection
      const eventGroups = this.groupFightsByUfcEvents(mergedEvents)
      
      for (const eventGroup of eventGroups) {
        try {
          // Create or update event
          const dbEvent = await prisma.event.upsert({
            where: { externalId: eventGroup.eventName },
            update: {
              name: eventGroup.eventName,
              date: eventGroup.eventDate,
              isPpv: eventGroup.isPpv,
              updatedAt: new Date(),
            },
            create: {
              externalId: eventGroup.eventName,
              name: eventGroup.eventName,
              date: eventGroup.eventDate,
              status: 'upcoming',
              promotion: 'UFC',
              isPpv: eventGroup.isPpv,
            },
          })
          result.eventsSynced++

          // Process each fight with intelligent ordering
          const orderedFights = this.orderFightCard(eventGroup.fights)
          
          for (let i = 0; i < orderedFights.length; i++) {
            const event = orderedFights[i]
            
            // Create or update fighters
            const fighter1 = await this.upsertFighter(event.home_team)
            const fighter2 = await this.upsertFighter(event.away_team)

            // Determine fight importance using intelligent analysis
            const fightImportance = this.analyzeFightImportance(event, i, orderedFights.length)

            // Create or update fight
            const fight = await prisma.fight.upsert({
              where: { externalId: event.id },
              update: {
                eventId: dbEvent.id,
                fighter1Id: fighter1.id,
                fighter2Id: fighter2.id,
                weightClass: this.extractWeightClass(event),
                isMainEvent: fightImportance.isMainEvent,
                isTitleFight: fightImportance.isTitleFight,
                updatedAt: new Date(),
              },
              create: {
                externalId: event.id,
                eventId: dbEvent.id,
                fighter1Id: fighter1.id,
                fighter2Id: fighter2.id,
                weightClass: this.extractWeightClass(event),
                isMainEvent: fightImportance.isMainEvent,
                isTitleFight: fightImportance.isTitleFight,
                status: 'upcoming',
              },
            })
            result.fightsSynced++

            // Sync odds from bookmakers
            await this.syncFightOdds(fight, event, eventGroup.eventDate, result)
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          result.errors.push(`Event ${eventGroup.eventName}: ${errorMsg}`)
        }
      }

      // Log sync results
      await prisma.syncLog.create({
        data: {
          type: 'odds',
          status: result.errors.length > 0 ? 'partial' : 'success',
          details: result.errors.join('; '),
          itemsSynced: result.fightsSynced,
        },
      })

      result.success = true
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      result.errors.push(`Sync failed: ${errorMsg}`)
      
      await prisma.syncLog.create({
        data: {
          type: 'odds',
          status: 'error',
          details: errorMsg,
          itemsSynced: 0,
        },
      })
    }

    return result
  }

  // New intelligent methods for proper UFC event detection and fight ordering

  private mergeEventsWithOdds(eventsData: OddsEvent[], oddsData: OddsEvent[]): OddsEvent[] {
    const mergedMap = new Map<string, OddsEvent>()
    
    // Add all events first
    eventsData.forEach(event => {
      mergedMap.set(event.id, event)
    })
    
    // Merge odds data
    oddsData.forEach(event => {
      const existing = mergedMap.get(event.id)
      if (existing) {
        mergedMap.set(event.id, { ...existing, bookmakers: event.bookmakers })
      } else {
        mergedMap.set(event.id, event)
      }
    })
    
    return Array.from(mergedMap.values())
  }

  private groupFightsByUfcEvents(events: OddsEvent[]): EventGroup[] {
    const groups = new Map<string, OddsEvent[]>()
    
    // Group by date and time proximity (within 6 hours = same UFC event)
    events.forEach(event => {
      const eventDate = new Date(event.commence_time)
      const dateKey = eventDate.toDateString()
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey)!.push(event)
    })
    
    // Convert to EventGroup objects with intelligent naming
    const eventGroups: EventGroup[] = []
    let ufcEventCounter = this.getNextUfcEventNumber()
    
    for (const [, fights] of groups) {
      const eventDate = new Date(fights[0].commence_time)
      const eventName = this.generateIntelligentEventName(eventDate, ufcEventCounter)
      const isPpv = this.intelligentPpvDetection(eventDate, fights)
      
      eventGroups.push({
        eventDate,
        eventName,
        fights,
        isPpv,
        estimatedEventNumber: ufcEventCounter
      })
      
      ufcEventCounter++
    }
    
    return eventGroups.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
  }

  private generateIntelligentEventName(date: Date, eventNumber: number): string {
    const month = date.toLocaleString('en-US', { month: 'long' })
    const day = date.getDate()
    const year = date.getFullYear()
    
    // Check if it's a known major event
    const knownEvents = this.getKnownUfcEvents(date)
    if (knownEvents.length > 0) {
      return knownEvents[0] // Use known event name if available
    }
    
    return `UFC ${eventNumber}: ${month} ${day}, ${year}`
  }

  private getKnownUfcEvents(date: Date): string[] {
    // Database of known UFC events for accurate naming
    const knownEvents: Record<string, string[]> = {
      // Add known major events here - this could be expanded or made dynamic
    }
    
    const dateKey = date.toDateString()
    return knownEvents[dateKey] || []
  }

  private getNextUfcEventNumber(): number {
    // Calculate next UFC event number based on current date
    const baseDate = new Date('2024-01-01')
    const currentDate = new Date()
    const weeksSinceBase = Math.floor((currentDate.getTime() - baseDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
    return 298 + weeksSinceBase // UFC 298 was around Jan 2024
  }

  private intelligentPpvDetection(date: Date, fights: OddsEvent[]): boolean {
    // PPV events are typically on Saturdays with 10+ fights
    const dayOfWeek = date.getDay()
    const isSaturday = dayOfWeek === 6
    const hasEnoughFights = fights.length >= 10
    
    // Additional heuristics for PPV detection
    const hasTitleFight = fights.some(fight => this.detectTitleFight(fight.home_team, fight.away_team))
    const eveningTime = date.getHours() >= 20 // Events after 8 PM are likely PPV
    
    return isSaturday && (hasEnoughFights || hasTitleFight || eveningTime)
  }

  private orderFightCard(fights: OddsEvent[]): OddsEvent[] {
    // Sort fights by importance and time for proper card ordering
    return fights.sort((a, b) => {
      // First by commence time (earlier fights first)
      const timeDiff = new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime()
      if (timeDiff !== 0) return timeDiff
      
      // Then by fight importance
      const aImportance = this.calculateFightScore(a)
      const bImportance = this.calculateFightScore(b)
      return bImportance - aImportance // Higher importance = later in card
    })
  }

  private calculateFightScore(event: OddsEvent): number {
    let score = 0
    const fighterNames = [event.home_team, event.away_team].join(' ').toLowerCase()
    
    // Title fights get highest score
    if (this.detectTitleFight(event.home_team, event.away_team)) {
      score += 100
    }
    
    // Known champions and top fighters
    const topFighters = [
      'islam makhachev', 'jon jones', 'alex pereira', 'sean omalley',
      'ilia topuria', 'leon edwards', 'belal muhammad', 'tom aspinall',
      'zhang weili', 'raquel pennington'
    ]
    
    topFighters.forEach(fighter => {
      if (fighterNames.includes(fighter)) {
        score += 50
      }
    })
    
    // Weight class importance (heavier classes often main event)
    const weightClass = this.extractWeightClass(event)
    const importantClasses = ['Heavyweight', 'Light Heavyweight', 'Middleweight', 'Welterweight', 'Lightweight']
    if (importantClasses.includes(weightClass)) {
      score += 25
    }
    
    // Championship indicators in names
    if (fighterNames.includes('champion') || fighterNames.includes('title')) {
      score += 75
    }
    
    return score
  }

  private analyzeFightImportance(event: OddsEvent, position: number, totalFights: number): {
    isMainEvent: boolean
    isTitleFight: boolean
  } {
    const isTitleFight = this.detectTitleFight(event.home_team, event.away_team)
    const fightScore = this.calculateFightScore(event)
    
    // Main event is typically the highest scoring fight or last position
    const isMainEvent = position === totalFights - 1 || 
                       (fightScore >= 75 && position >= totalFights - 2)
    
    return { isMainEvent, isTitleFight }
  }

  private async syncFightOdds(
    fight: { id: string }, 
    event: OddsEvent, 
    eventDate: Date, 
    result: SyncResult
  ): Promise<void> {
    for (const bookmaker of event.bookmakers) {
      for (const market of bookmaker.markets) {
        if (market.key === 'h2h' && market.outcomes.length >= 2) {
          const fighter1Odds = market.outcomes.find(o => o.name === event.home_team)?.price || 0
          const fighter2Odds = market.outcomes.find(o => o.name === event.away_team)?.price || 0

          await prisma.oddsSnapshot.upsert({
            where: {
              fightId_bookmakerKey_marketKey: {
                fightId: fight.id,
                bookmakerKey: bookmaker.key,
                marketKey: market.key,
              },
            },
            update: {
              fighter1Odds,
              fighter2Odds,
              lastUpdate: new Date(bookmaker.last_update),
            },
            create: {
              fightId: fight.id,
              bookmakerKey: bookmaker.key,
              bookmakerName: bookmaker.title,
              marketKey: market.key,
              fighter1Odds,
              fighter2Odds,
              fighter1Name: event.home_team,
              fighter2Name: event.away_team,
              lastUpdate: new Date(bookmaker.last_update),
              commenceTime: eventDate,
            },
          })
          result.oddsSynced++
        }
        
        // Handle totals (over/under rounds)
        if (market.key === 'totals' && market.outcomes.length >= 2) {
          const totalLine = this.extractTotalLine(market)
          
          for (const outcome of market.outcomes) {
            await prisma.oddsSnapshot.upsert({
              where: {
                fightId_bookmakerKey_marketKey: {
                  fightId: fight.id,
                  bookmakerKey: bookmaker.key,
                  marketKey: `${market.key}_${outcome.name.toLowerCase()}`,
                },
              },
              update: {
                fighter1Odds: outcome.price,
                lastUpdate: new Date(bookmaker.last_update),
              },
              create: {
                fightId: fight.id,
                bookmakerKey: bookmaker.key,
                bookmakerName: bookmaker.title,
                marketKey: `${market.key}_${outcome.name.toLowerCase()}`,
                fighter1Odds: outcome.price,
                fighter2Odds: 0,
                fighter1Name: outcome.name,
                fighter2Name: `Total: ${totalLine}`,
                lastUpdate: new Date(bookmaker.last_update),
                commenceTime: eventDate,
              },
            })
            result.oddsSynced++
          }
        }
      }
    }
  }

  private async upsertFighter(name: string) {
    return prisma.fighterCache.upsert({
      where: { name },
      update: { updatedAt: new Date() },
      create: {
        name,
        externalId: null,
      },
    })
  }

  private generateEventName(fighter1: string, fighter2: string, date: Date): string {
    const month = date.toLocaleString('en-US', { month: 'short' })
    const day = date.getDate()
    return `UFC: ${fighter1} vs ${fighter2} - ${month} ${day}`
  }

  // Legacy methods kept for compatibility - will be deprecated
  private groupFightsByEventDate(oddsData: OddsEvent[]): Record<string, OddsEvent[]> {
    const grouped: Record<string, OddsEvent[]> = {}
    
    for (const event of oddsData) {
      const eventDate = new Date(event.commence_time).toDateString()
      if (!grouped[eventDate]) {
        grouped[eventDate] = []
      }
      grouped[eventDate].push(event)
    }
    
    // Sort fights within each event by commence time
    for (const date in grouped) {
      grouped[date].sort((a, b) => 
        new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime()
      )
    }
    
    return grouped
  }

  private generateUfcEventName(date: Date): string {
    const month = date.toLocaleString('en-US', { month: 'long' })
    const day = date.getDate()
    const year = date.getFullYear()
    
    // Generate UFC event number based on date (simplified logic)
    const eventNumber = Math.floor((date.getTime() - new Date('2024-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000)) + 300
    
    return `UFC ${eventNumber}: ${month} ${day}, ${year}`
  }

  private isPpvEvent(date: Date, fightCount: number): boolean {
    // PPV events are typically on Saturdays with more fights
    const dayOfWeek = date.getDay()
    return dayOfWeek === 6 && fightCount >= 8 // Saturday with 8+ fights
  }

  private identifyMainEvent(event: OddsEvent, index: number, totalFights: number): boolean {
    // Legacy method - replaced by analyzeFightImportance
    const fightImportance = this.analyzeFightImportance(event, index, totalFights)
    return fightImportance.isMainEvent
  }

  private detectTitleFight(fighter1: string, fighter2: string): boolean {
    // Simple heuristic - title fights often have champion indicators or specific naming patterns
    const titleIndicators = ['vs.', 'champion', 'title', 'belt']
    const combinedName = `${fighter1} ${fighter2}`.toLowerCase()
    return titleIndicators.some(indicator => combinedName.includes(indicator))
  }

  private extractWeightClass(event: OddsEvent): string {
    // Try to extract weight class from fighter names or use defaults
    const fighterNames = [event.home_team, event.away_team]
    
    // Common weight classes in MMA
    const weightClasses = [
      'Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight',
      'Welterweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight',
      "Women's Flyweight", "Women's Bantamweight", "Women's Featherweight"
    ]
    
    for (const fighterName of fighterNames) {
      for (const weightClass of weightClasses) {
        if (fighterName.toLowerCase().includes(weightClass.toLowerCase())) {
          return weightClass
        }
      }
    }
    
    return 'Unknown'
  }

  private extractTotalLine(market: Market): string {
    // Extract the total line from market outcomes
    if (market.outcomes.length > 0) {
      const outcome = market.outcomes[0]
      // Look for point property in outcomes
      if ('point' in outcome && typeof outcome.point === 'number') {
        return outcome.point.toString()
      }
    }
    return '2.5' // Default for MMA rounds
  }

  // Get upcoming fights with odds
  async getUpcomingFightsWithOdds(limit: number = 10) {
    const fights = await prisma.fight.findMany({
      where: { status: 'upcoming' },
      include: {
        event: true,
        fighter1: true,
        fighter2: true,
        oddsSnapshots: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        event: { date: 'asc' },
      },
      take: limit,
    })

    return fights
  }

  // Get best odds for a fight
  async getBestOdds(fightId: string) {
    const odds = await prisma.oddsSnapshot.findMany({
      where: { fightId },
      orderBy: { lastUpdate: 'desc' },
    })

    if (odds.length === 0) return null

    // Find best odds for each fighter
    const fighter1Best = odds.reduce((best: typeof odds[0], current: typeof odds[0]) => 
      current.fighter1Odds > best.fighter1Odds ? current : best
    )
    const fighter2Best = odds.reduce((best: typeof odds[0], current: typeof odds[0]) => 
      current.fighter2Odds > best.fighter2Odds ? current : best
    )

    return {
      fighter1Best: {
        bookmaker: fighter1Best.bookmakerName,
        odds: fighter1Best.fighter1Odds,
      },
      fighter2Best: {
        bookmaker: fighter2Best.bookmakerName,
        odds: fighter2Best.fighter2Odds,
      },
      lastUpdate: odds[0].lastUpdate,
    }
  }
}

export const oddsApi = new OddsApiClient()
