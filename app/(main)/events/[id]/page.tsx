import { getEventById, getBestOddsForFight } from '@/lib/actions/odds-actions'
import { getFighterRankingsMap } from '@/lib/actions/rankings-actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, MapPin, Trophy, Crown } from 'lucide-react'
import { FighterImage } from '@/components/fighter-image'

interface EventPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params
  const event = await getEventById(id)

  if (!event) {
    notFound()
  }

  // Get rankings for all fighters
  const rankingsMap = await getFighterRankingsMap()

  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 sm:mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        {/* Event Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
            {event.isPpv && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 tracking-wider rounded-sm">
                PAY-PER-VIEW
              </span>
            )}
            <span className="text-primary text-sm font-bold tracking-widest">
              {format(new Date(event.date), 'EEEE, MMMM d, yyyy').toUpperCase()}
            </span>
          </div>
          <h1 className="font-black text-3xl sm:text-4xl lg:text-6xl tracking-tighter mb-4">
            {event.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-muted-foreground">
            {event.location && (
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {event.location}
              </span>
            )}
            {event.venue && (
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {event.venue}
              </span>
            )}
          </div>
        </div>

        {/* Fight Card */}
        <div>
          <h2 className="font-black text-xl sm:text-2xl tracking-tight mb-4 sm:mb-6 flex items-center gap-3">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            FIGHT CARD
          </h2>

          {event.fights.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {event.fights.map((fight) => (
                <FightCard
                  key={fight.id}
                  fight={fight}
                  fighter1Ranking={rankingsMap.get(fight.fighter1.id)}
                  fighter2Ranking={rankingsMap.get(fight.fighter2.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 bg-card border border-border rounded-sm">
              <p className="text-muted-foreground">Fight card not yet announced</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface FightCardProps {
  fight: any
  fighter1Ranking?: { division: string; rank: number }
  fighter2Ranking?: { division: string; rank: number }
}

async function FightCard({ fight, fighter1Ranking, fighter2Ranking }: FightCardProps) {
  const bestOdds = await getBestOddsForFight(fight.id)

  return (
    <Link
      href={`/fight/${fight.id}`}
      className="group block bg-card border border-border hover:border-primary/50 transition-all duration-300 rounded-sm overflow-hidden"
    >
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6">
          {/* Fighters */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
              {fight.isTitleFight && (
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 tracking-wider rounded-sm">
                  TITLE
                </span>
              )}
              {fight.isMainEvent && (
                <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 tracking-wider rounded-sm">
                  MAIN EVENT
                </span>
              )}
              <span className="text-muted-foreground text-xs sm:text-sm">{fight.weightClass}</span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 lg:gap-8">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    <FighterImage
                      fighterId={fight.fighter1.id}
                      name={fight.fighter1.name}
                      imageUrl={fight.fighter1.imageUrl}
                      size="md"
                      className="flex-shrink-0"
                    />
                    {fighter1Ranking && (
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        fighter1Ranking.rank === 0
                          ? 'bg-yellow-500 text-black'
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        {fighter1Ranking.rank === 0 ? <Crown className="w-3 h-3" /> : fighter1Ranking.rank}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg sm:text-xl lg:text-2xl group-hover:text-primary transition-colors truncate">
                        {fight.fighter1.name}
                      </h3>
                      {fighter1Ranking && (
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {fighter1Ranking.rank === 0 ? 'Champion' : `#${fighter1Ranking.rank}`}
                        </span>
                      )}
                    </div>
                    {bestOdds && (
                      <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                        Odds: <span className="text-primary font-bold">
                          {bestOdds.fighter1Best.odds > 0 ? '+' : ''}{bestOdds.fighter1Best.odds}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-xl sm:text-2xl font-black text-muted-foreground/30 flex-shrink-0">VS</div>

              <div className="flex-1 min-w-0 text-right">
                <div className="flex items-center gap-3 justify-end mb-2">
                  <div className="min-w-0 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {fighter2Ranking && (
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {fighter2Ranking.rank === 0 ? 'Champion' : `#${fighter2Ranking.rank}`}
                        </span>
                      )}
                      <h3 className="font-black text-lg sm:text-xl lg:text-2xl group-hover:text-primary transition-colors truncate">
                        {fight.fighter2.name}
                      </h3>
                    </div>
                    {bestOdds && (
                      <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                        Odds: <span className="text-primary font-bold">
                          {bestOdds.fighter2Best.odds > 0 ? '+' : ''}{bestOdds.fighter2Best.odds}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <FighterImage
                      fighterId={fight.fighter2.id}
                      name={fight.fighter2.name}
                      imageUrl={fight.fighter2.imageUrl}
                      size="md"
                      className="flex-shrink-0"
                    />
                    {fighter2Ranking && (
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        fighter2Ranking.rank === 0
                          ? 'bg-yellow-500 text-black'
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        {fighter2Ranking.rank === 0 ? <Crown className="w-3 h-3" /> : fighter2Ranking.rank}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Odds */}
          {bestOdds && (
            <div className="lg:border-l lg:border-border lg:pl-6 sm:lg:pl-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
              <p className="text-xs text-muted-foreground tracking-widest mb-2">BEST ODDS</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground truncate">{fight.fighter1.name.split(' ').pop()}:</span>
                  <span className="font-bold text-primary">
                    {bestOdds.fighter1Best.odds > 0 ? '+' : ''}{bestOdds.fighter1Best.odds}
                  </span>
                  <span className="text-muted-foreground/70 text-xs">{bestOdds.fighter1Best.bookmaker}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground truncate">{fight.fighter2.name.split(' ').pop()}:</span>
                  <span className="font-bold text-primary">
                    {bestOdds.fighter2Best.odds > 0 ? '+' : ''}{bestOdds.fighter2Best.odds}
                  </span>
                  <span className="text-muted-foreground/70 text-xs">{bestOdds.fighter2Best.bookmaker}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
    </Link>
  )
}
