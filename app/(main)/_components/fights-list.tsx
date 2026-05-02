'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Trophy, Flame, Target } from 'lucide-react'

interface Fight {
  id: string
  weightClass: string
  isTitleFight: boolean
  isMainEvent: boolean
  fighter1: {
    id: string
    name: string
  }
  fighter2: {
    id: string
    name: string
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
}

interface FightsListProps {
  fights: Fight[]
}

export function FightsList({ fights }: FightsListProps) {
  if (fights.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 bg-card border border-border rounded-sm">
        <p className="text-muted-foreground mb-4">No upcoming fights found</p>
        <p className="text-muted-foreground/70 text-sm">Check back soon for upcoming events</p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {fights.map((fight, index) => (
        <Link
          key={fight.id}
          href={`/fight/${fight.id}`}
          className="group relative bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 rounded-sm overflow-hidden"
          style={{ transitionDelay: `${Math.min(index * 50, 200)}ms` }}
        >
          {/* Fight Status Badges */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-between">
            {fight.isTitleFight && (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-primary/10 px-2 py-1">
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs font-bold tracking-widest text-primary">TITLE</span>
              </div>
            )}
            {fight.isMainEvent && (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-secondary px-2 py-1">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs font-bold tracking-widest text-primary">MAIN EVENT</span>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 pt-12 sm:pt-14">
            {/* Event Information */}
            <div className="text-center mb-3 sm:mb-4">
              <div className="text-xs font-bold tracking-widest text-primary mb-1 truncate uppercase">
                {fight.event.name}
              </div>
              <div className="text-muted-foreground text-xs font-medium">
                {format(new Date(fight.event.date), 'EEEE, MMMM d')}
              </div>
            </div>

            {/* Fighters */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center flex-1 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-secondary to-muted border-2 border-border group-hover:border-primary/30 rounded-full mb-2 sm:mb-3 mx-auto flex items-center justify-center transition-colors duration-300">
                  <span className="text-xl sm:text-2xl font-black text-foreground">
                    {fight.fighter1.name.charAt(0)}
                  </span>
                </div>
                <div className="font-black text-xs sm:text-sm tracking-tight truncate group-hover:text-primary transition-colors">{fight.fighter1.name}</div>
              </div>
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary flex items-center justify-center">
                  <span className="text-sm sm:text-base font-black text-primary-foreground">VS</span>
                </div>
              </div>
              <div className="text-center flex-1 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-secondary to-muted border-2 border-border group-hover:border-primary/30 rounded-full mb-2 sm:mb-3 mx-auto flex items-center justify-center transition-colors duration-300">
                  <span className="text-xl sm:text-2xl font-black text-foreground">
                    {fight.fighter2.name.charAt(0)}
                  </span>
                </div>
                <div className="font-black text-xs sm:text-sm tracking-tight truncate group-hover:text-primary transition-colors">{fight.fighter2.name}</div>
              </div>
            </div>

            {/* Odds Display */}
            {fight.oddsSnapshots[0] && (
              <div className="bg-gradient-to-r from-secondary via-muted to-secondary rounded-sm p-3 sm:p-4 mb-3 sm:mb-4 border border-border">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                  <span className="text-xs font-bold tracking-widest text-muted-foreground">LIVE ODDS</span>
                </div>
                <div className="flex items-center justify-between text-sm sm:text-base">
                  <div className="text-center flex-1 min-w-0">
                    <div className="text-muted-foreground text-xs mb-1 truncate font-medium">
                      {fight.fighter1.name.split(' ').pop()}
                    </div>
                    <div className="text-primary font-black text-lg sm:text-xl">
                      {fight.oddsSnapshots[0].fighter1Odds > 0 ? '+' : ''}
                      {fight.oddsSnapshots[0].fighter1Odds}
                    </div>
                  </div>
                  <div className="text-muted-foreground/30 text-xs font-bold mx-2 sm:mx-3">VS</div>
                  <div className="text-center flex-1 min-w-0">
                    <div className="text-muted-foreground text-xs mb-1 truncate font-medium">
                      {fight.fighter2.name.split(' ').pop()}
                    </div>
                    <div className="text-primary font-black text-lg sm:text-xl">
                      {fight.oddsSnapshots[0].fighter2Odds > 0 ? '+' : ''}
                      {fight.oddsSnapshots[0].fighter2Odds}
                    </div>
                  </div>
                </div>
                {fight.oddsSnapshots[0].bookmakerName && (
                  <div className="text-muted-foreground/60 text-xs text-center mt-2 sm:mt-3 truncate font-medium">
                    Best odds via {fight.oddsSnapshots[0].bookmakerName}
                  </div>
                )}
              </div>
            )}

            {/* Fight Details */}
            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 bg-primary flex-shrink-0"></div>
                <div className="text-muted-foreground text-xs font-bold tracking-wider uppercase truncate">
                  {fight.weightClass}
                </div>
              </div>
              <div className="text-muted-foreground/70 text-xs font-medium flex-shrink-0">
                {format(new Date(fight.event.date), 'MMM d, yyyy')}
              </div>
            </div>
          </div>

          {/* Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
      ))}
    </div>
  )
}
