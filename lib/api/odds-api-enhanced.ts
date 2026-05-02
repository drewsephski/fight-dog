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

// UFC Event Fight Order Configuration
interface UFCEventConfig {
  name: string
  date: Date
  mainEvent: string[]
  coMainEvent?: string[]
  mainCard: string[]
  prelims: string[]
  earlyPrelims?: string[]
  isPpv: boolean
}

// Known UFC event configurations for proper fight ordering
const UFC_EVENT_CONFIGS: UFCEventConfig[] = [
  {
    name: "UFC Fight Night: Della Maddalena vs Prates",
    date: new Date("2026-05-02T07:00:00Z"),
    mainEvent: ["Jack Della Maddalena", "Carlos Prates"],
    coMainEvent: ["Beneil Dariush", "Quillan Salkilld"],
    mainCard: ["Tim Elliott", "Steve Erceg", "Jacob Malkoun", "Gerald Meerschaert", "Tai Tuivasa", "Sean Sharaf"],
    prelims: ["Junior Tafa", "Kevin Christian", "Kody Steele", "Dom Mar Fan"],
    isPpv: false
  },
  {
    name: "UFC 328: Chimaev vs Strickland",
    date: new Date("2026-05-09T21:00:00Z"),
    mainEvent: ["Khamzat Chimaev", "Sean Strickland"],
    coMainEvent: ["Joshua Van", "Tatsuro Taira"],
    mainCard: ["Alexander Volkov", "Waldo Cortes-Acosta", "Sean Brady", "Joaquin Buckley", "King Green", "Jeremy Stephens"],
    prelims: ["Jan Blachowicz", "Bogdan Guskov", "Ateba Gautier", "Ozzy Diaz", "Roman Kopylov", "Marco Tulio", "Clayton Carpenter", "Jose Ochoa", "Baisangur Susurkaev", "Djorden Santos"],
    isPpv: true
  },
  {
    name: "UFC Fight Night: Allen vs Costa",
    date: new Date("2026-05-16T20:00:00Z"),
    mainEvent: ["Arnold Allen", "Melquizael Costa"],
    coMainEvent: ["Ketlen Vieira", "Jacqueline Cavalcanti"],
    mainCard: ["Modestas Bukauskas", "Rodolfo Bellato", "Tuco Tokkos", "Ivan Erslan", "Timmy Cuamba", "Benardo Sopaj"],
    prelims: ["Alice Ardelean", "Polyana Viana", "Daniel Barez", "Luis Gurule"],
    isPpv: false
  },
  {
    name: "UFC Fight Night: Song vs Figueiredo",
    date: new Date("2026-05-30T07:00:00Z"),
    mainEvent: ["Song Yadong", "Deiveson Figueiredo"],
    coMainEvent: ["Zhang Mingyang", "Alonzo Menifield"],
    mainCard: ["Sergei Pavlovich", "Tallison Teixeira", "Alex Perez", "Sumudaerji", "Kai Asakura", "Cameron Smotherman", "Muslim Salikhov", "Jake Matthews", "Angela Hill", "Jingnan Xiong"],
    prelims: [],
    isPpv: false
  },
  {
    name: "UFC Fight Night: Muhammad vs Bonfim",
    date: new Date("2026-06-06T18:00:00Z"),
    mainEvent: ["Belal Muhammad", "Gabriel Bonfim"],
    coMainEvent: ["Iwo Baraniewski", "Billy Elekana"],
    mainCard: ["Imanol Rodriguez", "Matt Schnell", "Bruno Silva", "Edgar Chairez", "Jeisla Chaves", "Yuneisy Duben"],
    prelims: [],
    isPpv: false
  },
  {
    name: "UFC Freedom 250: Topuria vs Gaethje",
    date: new Date("2026-06-14T20:00:00Z"),
    mainEvent: ["Ilia Topuria", "Justin Gaethje"],
    coMainEvent: ["Alex Pereira", "Ciryl Gane"],
    mainCard: ["Sean O'Malley", "Aiemann Zahabi", "Mauricio Ruffy", "Michael Chandler", "Bo Nickal", "Kyle Daukaus", "Diego Lopes", "Steve Garcia"],
    prelims: [],
    isPpv: true
  }
]

class EnhancedOddsApiClient {
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
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`Odds API error: ${response.status} ${response.statusText}`)
    }

    const events = await response.json()
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
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`Odds API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private findUFCEventConfig(eventDate: Date, fights: OddsEvent[]): UFCEventConfig | null {
    // Find matching UFC event config by date
    const matchingConfig = UFC_EVENT_CONFIGS.find(config => {
      const configDate = new Date(config.date)
      const eventDateStart = new Date(eventDate)
      eventDateStart.setHours(0, 0, 0, 0)
      eventDateStart.setDate(eventDateStart.getDate() - 1) // Allow for previous day due to time zones
      
      const eventDateEnd = new Date(eventDate)
      eventDateEnd.setHours(23, 59, 59, 999)
      eventDateEnd.setDate(eventDateEnd.getDate() + 1) // Allow for next day due to time zones
      
      return configDate >= eventDateStart && configDate <= eventDateEnd
    })

    if (matchingConfig) {
      return matchingConfig
    }

    // Fallback: try to match by fighter names
    const fighterNames = fights.flatMap(f => [f.home_team, f.away_team])
    
    for (const config of UFC_EVENT_CONFIGS) {
      const configFighters = [
        ...config.mainEvent,
        ...(config.coMainEvent || []),
        ...config.mainCard,
        ...config.prelims,
        ...(config.earlyPrelims || [])
      ]
      
      const matchCount = configFighters.filter(fighter => 
        fighterNames.some(name => name.toLowerCase().includes(fighter.toLowerCase()) || 
                           fighter.toLowerCase().includes(name.toLowerCase()))
      ).length
      
      // If we have a significant overlap, consider this a match
      if (matchCount >= Math.min(3, configFighters.length * 0.5)) {
        return config
      }
    }

    return null
  }

  private orderFightsByUFCStructure(fights: OddsEvent[], config: UFCEventConfig): OddsEvent[] {
    const orderedFights: OddsEvent[] = []
    const usedIndices = new Set<number>()

    // Helper function to find fight by fighter names
    const findFightByFighters = (fighter1: string, fighter2: string): OddsEvent | null => {
      for (let i = 0; i < fights.length; i++) {
        if (usedIndices.has(i)) continue
        
        const fight = fights[i]
        const homeMatch = this.fighterNamesMatch(fight.home_team, fighter1) && this.fighterNamesMatch(fight.away_team, fighter2)
        const awayMatch = this.fighterNamesMatch(fight.home_team, fighter2) && this.fighterNamesMatch(fight.away_team, fighter1)
        
        if (homeMatch || awayMatch) {
          usedIndices.add(i)
          return fight
        }
      }
      return null
    }

    // Add main event
    const mainEvent = findFightByFighters(config.mainEvent[0], config.mainEvent[1])
    if (mainEvent) orderedFights.push(mainEvent)

    // Add co-main event
    if (config.coMainEvent) {
      const coMainEvent = findFightByFighters(config.coMainEvent[0], config.coMainEvent[1])
      if (coMainEvent) orderedFights.push(coMainEvent)
    }

    // Add main card fights
    for (let i = 0; i < config.mainCard.length; i += 2) {
      if (i + 1 < config.mainCard.length) {
        const fight = findFightByFighters(config.mainCard[i], config.mainCard[i + 1])
        if (fight) orderedFights.push(fight)
      }
    }

    // Add prelims
    for (let i = 0; i < config.prelims.length; i += 2) {
      if (i + 1 < config.prelims.length) {
        const fight = findFightByFighters(config.prelims[i], config.prelims[i + 1])
        if (fight) orderedFights.push(fight)
      }
    }

    // Add early prelims
    if (config.earlyPrelims) {
      for (let i = 0; i < config.earlyPrelims.length; i += 2) {
        if (i + 1 < config.earlyPrelims.length) {
          const fight = findFightByFighters(config.earlyPrelims[i], config.earlyPrelims[i + 1])
          if (fight) orderedFights.push(fight)
        }
      }
    }

    // Add any remaining fights that weren't matched
    for (let i = 0; i < fights.length; i++) {
      if (!usedIndices.has(i)) {
        orderedFights.push(fights[i])
      }
    }

    return orderedFights
  }

  private fighterNamesMatch(apiName: string, configName: string): boolean {
    const apiLower = apiName.toLowerCase()
    const configLower = configName.toLowerCase()
    
    // Exact match
    if (apiLower === configLower) return true
    
    // Contains match
    if (apiLower.includes(configLower) || configLower.includes(apiLower)) return true
    
    // Split by common separators and check parts
    const apiParts = apiLower.split(/[\s\-\.]/)
    const configParts = configLower.split(/[\s\-\.]/)
    
    return apiParts.some(apiPart => 
      configParts.some(configPart => 
        apiPart.includes(configPart) || configPart.includes(apiPart)
      )
    )
  }

  private analyzeFightImportance(event: OddsEvent, position: number, totalFights: number, config: UFCEventConfig): {
    isMainEvent: boolean
    isTitleFight: boolean
  } {
    const fighterNames = [event.home_team, event.away_team]
    
    // Check if this is a title fight
    const isTitleFight = this.detectTitleFight(event.home_team, event.away_team) ||
                       config.name.toLowerCase().includes('title') ||
                       !!(config.coMainEvent && 
                        ((config.coMainEvent[0] === event.home_team && config.coMainEvent[1] === event.away_team) ||
                         (config.coMainEvent[0] === event.away_team && config.coMainEvent[1] === event.home_team)))

    // Check if this is the main event
    const isMainEvent = config.mainEvent[0] === event.home_team && config.mainEvent[1] === event.away_team ||
                       config.mainEvent[0] === event.away_team && config.mainEvent[1] === event.home_team ||
                       position === 0 // First position in ordered array

    return { isMainEvent, isTitleFight }
  }

  private detectTitleFight(fighter1: string, fighter2: string): boolean {
    const titleIndicators = ['vs.', 'champion', 'title', 'belt', 'interim', 'unification']
    const combinedName = `${fighter1} ${fighter2}`.toLowerCase()
    return titleIndicators.some(indicator => combinedName.includes(indicator))
  }

  private extractWeightClass(event: OddsEvent): string {
    const fighterNames = [event.home_team, event.away_team]
    
    const weightClasses = [
      'Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight',
      'Welterweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight',
      "Women's Flyweight", "Women's Bantamweight", "Women's Featherweight", "Women's Strawweight"
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

  private extractTotalLine(market: Market): string {
    if (market.outcomes.length > 0) {
      const outcome = market.outcomes[0]
      if ('point' in outcome && typeof outcome.point === 'number') {
        return outcome.point.toString()
      }
    }
    return '2.5' // Default for MMA rounds
  }

  async syncOddsToDatabase(): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      eventsSynced: 0,
      fightsSynced: 0,
      oddsSynced: 0,
      errors: [],
    }

    if (!this.apiKey) {
      result.errors.push('ODDS_API_KEY not configured - skipping sync')
      return result
    }

    try {
      console.log('🥊 Starting Enhanced UFC Odds Sync with Proper Fight Ordering...')

      // Get both events and odds
      const [eventsData, oddsData] = await Promise.all([
        this.getMmaEvents(),
        this.getMmaOdds()
      ])
      
      // Merge events with odds data
      const mergedEvents = this.mergeEventsWithOdds(eventsData, oddsData)
      
      // Group fights by date
      const eventGroups = this.groupFightsByDate(mergedEvents)
      
      for (const [dateKey, fights] of Object.entries(eventGroups)) {
        const eventDate = new Date(fights[0].commence_time)
        
        // Find UFC event configuration for proper ordering
        const config = this.findUFCEventConfig(eventDate, fights)
        
        if (!config) {
          console.log(`⚠️  No UFC configuration found for ${dateKey}, using default ordering`)
          result.errors.push(`No UFC configuration found for ${dateKey}`)
          continue
        }

        console.log(`📅 Processing ${config.name} with ${fights.length} fights`)
        
        // Order fights according to UFC structure
        const orderedFights = this.orderFightsByUFCStructure(fights, config)
        
        try {
          // Create or update event
          const dbEvent = await prisma.event.upsert({
            where: { externalId: config.name },
            update: {
              name: config.name,
              date: config.date,
              isPpv: config.isPpv,
              location: this.extractLocationFromEventName(config.name),
              venue: this.extractVenueFromEventName(config.name),
              updatedAt: new Date(),
            },
            create: {
              externalId: config.name,
              name: config.name,
              date: config.date,
              status: 'upcoming',
              promotion: 'UFC',
              isPpv: config.isPpv,
              location: this.extractLocationFromEventName(config.name),
              venue: this.extractVenueFromEventName(config.name),
            },
          })
          result.eventsSynced++

          console.log(`   ✓ Created/updated event: ${config.name}`)

          // Process each fight with proper UFC ordering
          for (let i = 0; i < orderedFights.length; i++) {
            const event = orderedFights[i]
            
            // Create or update fighters
            const fighter1 = await this.upsertFighter(event.home_team)
            const fighter2 = await this.upsertFighter(event.away_team)

            // Determine fight importance using UFC configuration
            const fightImportance = this.analyzeFightImportance(event, i, orderedFights.length, config)

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
            await this.syncFightOdds(fight, event, config.date, result)
          }

          console.log(`   ✓ Processed ${orderedFights.length} fights with proper UFC ordering`)
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          result.errors.push(`Event ${config.name}: ${errorMsg}`)
          console.error(`   ❌ Error processing ${config.name}: ${errorMsg}`)
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

      console.log(`✅ Enhanced UFC Odds Sync completed!`)
      console.log(`📊 Results: ${result.eventsSynced} events, ${result.fightsSynced} fights, ${result.oddsSynced} odds`)
      
      result.success = true
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      result.errors.push(`Sync failed: ${errorMsg}`)
      console.error(`❌ Enhanced sync failed: ${errorMsg}`)
      
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

  private groupFightsByDate(events: OddsEvent[]): Record<string, OddsEvent[]> {
    const grouped: Record<string, OddsEvent[]> = {}
    
    for (const event of events) {
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

  private extractLocationFromEventName(eventName: string): string {
    // Extract location from event name patterns
    if (eventName.includes('Perth')) return 'Perth, Western Australia, Australia'
    if (eventName.includes('Newark')) return 'Newark, New Jersey, United States'
    if (eventName.includes('Macau')) return 'Macau, China'
    if (eventName.includes('Las Vegas') && !eventName.includes('White House')) return 'Las Vegas, Nevada, United States'
    if (eventName.includes('White House') || eventName.includes('Freedom')) return 'Washington, D.C., United States'
    
    return 'TBD'
  }

  private extractVenueFromEventName(eventName: string): string {
    // Extract venue from event name patterns
    if (eventName.includes('Perth')) return 'RAC Arena'
    if (eventName.includes('Newark')) return 'Prudential Center'
    if (eventName.includes('Macau')) return 'Galaxy Arena'
    if (eventName.includes('Las Vegas') && !eventName.includes('White House')) return 'UFC APEX'
    if (eventName.includes('White House') || eventName.includes('Freedom')) return 'The White House'
    
    return 'TBD'
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

export const enhancedOddsApi = new EnhancedOddsApiClient()
