import { getFighterWithRanking } from '@/lib/actions/rankings-actions'
import { getFighterById } from '@/lib/actions/odds-actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  User,
  Swords,
  Trophy,
  Ruler,
  Crown,
  TrendingUp,
  Calendar,
  MapPin,
  Target,
  Medal,
} from 'lucide-react'
import { FighterImage } from '@/components/fighter-image'

interface FighterPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function FighterPage({ params }: FighterPageProps) {
  const { id } = await params

  // Get fighter from Octagon API with ranking
  const { fighter, ranking } = await getFighterWithRanking(id)

  // Fallback to database if Octagon API doesn't have this fighter
  const dbFighter = !fighter ? await getFighterById(id) : null

  if (!fighter && !dbFighter) {
    notFound()
  }

  // Use Octagon data if available, otherwise DB data
  const fighterData = fighter || dbFighter!
  const isOctagonData = !!fighter

  // Get fights from DB fighter if available
  const allFights = dbFighter
    ? [...dbFighter.fightsAsFighter1, ...dbFighter.fightsAsFighter2].sort(
        (a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime()
      )
    : []

  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href="/fighters"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 sm:mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Fighters
        </Link>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-sm p-6 sm:p-8">
              {/* Ranking Badge */}
              {ranking && (
                <div className="mb-6 text-center">
                  <Link
                    href={`/rankings/${ranking.divisionId}`}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm font-bold tracking-wider transition-colors ${
                      ranking.rank === 0
                        ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30'
                        : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                    }`}
                  >
                    {ranking.rank === 0 ? (
                      <>
                        <Crown className="w-4 h-4" />
                        CHAMPION
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        #{ranking.rank} IN {ranking.division.toUpperCase()}
                      </>
                    )}
                  </Link>
                </div>
              )}

              <div className="mx-auto mb-6 flex items-center justify-center relative">
                <FighterImage
                  fighterId={id}
                  name={fighterData.name}
                  imageUrl={isOctagonData ? fighter!.imgUrl : dbFighter?.imageUrl}
                  size="lg"
                  className="w-40 h-40 sm:w-48 sm:h-48"
                />
              </div>

              <h1 className="font-black text-2xl sm:text-3xl text-center mb-2">
                {fighterData.name}
              </h1>

              {(isOctagonData ? fighter!.nickname : dbFighter?.nickname) && (
                <p className="text-muted-foreground text-center italic mb-4">
                  &ldquo;{isOctagonData ? fighter!.nickname : dbFighter?.nickname}&rdquo;
                </p>
              )}

              <div className="text-center mb-6">
                <span className="text-muted-foreground text-sm">
                  {isOctagonData ? fighter!.category : dbFighter?.division || 'Unknown Division'}
                </span>
              </div>

              {/* Record */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <span className="text-3xl sm:text-4xl font-black text-green-500">
                      {isOctagonData ? fighter!.wins : dbFighter?.wins}
                    </span>
                    <p className="text-muted-foreground text-xs tracking-wider">WINS</p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl sm:text-4xl font-black text-red-500">
                      {isOctagonData ? fighter!.losses : dbFighter?.losses}
                    </span>
                    <p className="text-muted-foreground text-xs tracking-wider">LOSSES</p>
                  </div>
                  {(isOctagonData ? fighter!.draws : dbFighter?.draws) !== '0' && (
                    <div className="text-center">
                      <span className="text-3xl sm:text-4xl font-black text-yellow-500">
                        {isOctagonData ? fighter!.draws : dbFighter?.draws}
                      </span>
                      <p className="text-muted-foreground text-xs tracking-wider">DRAWS</p>
                    </div>
                  )}
                </div>
              </div>

              {isOctagonData && fighter!.status && (
                <div className="text-center">
                  <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-sm">
                    {fighter!.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Physical Stats - Only show if Octagon data available */}
            {isOctagonData && (
              <div className="bg-card border border-border rounded-sm p-6">
                <h2 className="font-black text-lg tracking-tight mb-6 flex items-center gap-3">
                  <Ruler className="w-5 h-5 text-primary" />
                  PHYSICAL STATS
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <StatCard label="Age" value={fighter!.age} suffix="years" />
                  <StatCard label="Height" value={fighter!.height} suffix="in" />
                  <StatCard label="Weight" value={fighter!.weight} suffix="lbs" />
                  <StatCard label="Reach" value={fighter!.reach} suffix="in" />
                  <StatCard label="Leg Reach" value={fighter!.legReach} suffix="in" />
                </div>
              </div>
            )}

            {/* DB Stats (if no Octagon data) */}
            {!isOctagonData && dbFighter && (
              <div className="bg-card border border-border rounded-sm p-6">
                <h2 className="font-black text-lg tracking-tight mb-6 flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-primary" />
                  FIGHTER STATS
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Stance" value={dbFighter.stance || 'Unknown'} />
                  <StatCard label="Reach" value={dbFighter.reach || 'Unknown'} />
                  <StatCard label="Height" value={dbFighter.height || 'Unknown'} />
                  <StatCard label="Weight" value={dbFighter.weight || 'Unknown'} />
                  <StatCard label="Age" value={dbFighter.age?.toString() || 'Unknown'} />
                  <StatCard label="Nationality" value={dbFighter.nationality || 'Unknown'} />
                  <StatCard label="Wins" value={dbFighter.wins.toString()} />
                  <StatCard label="Losses" value={dbFighter.losses.toString()} />
                </div>
              </div>
            )}

            {/* Background - Octagon only */}
            {isOctagonData && (
              <div className="bg-card border border-border rounded-sm p-6">
                <h2 className="font-black text-lg tracking-tight mb-6 flex items-center gap-3">
                  <User className="w-5 h-5 text-primary" />
                  BACKGROUND
                </h2>
                <div className="space-y-4">
                  {fighter!.placeOfBirth && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-sm">Place of Birth</p>
                        <p className="font-medium">{fighter!.placeOfBirth}</p>
                      </div>
                    </div>
                  )}
                  {fighter!.trainsAt && (
                    <div className="flex items-start gap-3">
                      <Swords className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-sm">Trains At</p>
                        <p className="font-medium">{fighter!.trainsAt}</p>
                      </div>
                    </div>
                  )}
                  {fighter!.fightingStyle && (
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-sm">Fighting Style</p>
                        <p className="font-medium">{fighter!.fightingStyle}</p>
                      </div>
                    </div>
                  )}
                  {fighter!.octagonDebut && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-muted-foreground text-sm">Octagon Debut</p>
                        <p className="font-medium">{fighter!.octagonDebut}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fight History - from DB */}
            {allFights.length > 0 && (
              <div className="bg-card border border-border rounded-sm p-6">
                <h2 className="font-black text-lg tracking-tight mb-6 flex items-center gap-3">
                  <Medal className="w-5 h-5 text-primary" />
                  FIGHTS
                </h2>
                <div className="space-y-3">
                  {allFights.map((fight) => {
                    const opponent =
                      fight.fighter1Id === dbFighter!.id
                        ? (fight as { fighter2: { name: string } }).fighter2
                        : (fight as { fighter1: { name: string } }).fighter1
                    const isWinner = fight.winnerId === dbFighter!.id

                    return (
                      <Link
                        key={fight.id}
                        href={`/fight/${fight.id}`}
                        className="group flex items-center gap-4 bg-muted/50 border border-border hover:border-primary/50 p-4 rounded-sm transition-all duration-300"
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            isWinner
                              ? 'bg-green-500/20 text-green-500'
                              : fight.winnerId
                                ? 'bg-red-500/20 text-red-500'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {isWinner ? 'W' : fight.winnerId ? 'L' : 'TBD'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold group-hover:text-primary transition-colors">
                            vs {opponent.name}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {fight.event.name} • {fight.weightClass}
                          </p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-muted-foreground text-sm">
                            {new Date(fight.event.date).toLocaleDateString()}
                          </p>
                          {fight.method && (
                            <p className="text-muted-foreground text-xs">{fight.method}</p>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string
  value: string
  suffix?: string
}) {
  if (!value || value === '0') {
    return (
      <div className="bg-muted p-4 rounded-sm">
        <p className="text-muted-foreground text-xs tracking-wider mb-1">{label}</p>
        <p className="font-bold text-foreground">Unknown</p>
      </div>
    )
  }

  return (
    <div className="bg-muted p-4 rounded-sm">
      <p className="text-muted-foreground text-xs tracking-wider mb-1">{label}</p>
      <p className="font-bold text-foreground">
        {value}
        {suffix && (
          <span className="text-muted-foreground text-sm font-normal ml-1">{suffix}</span>
        )}
      </p>
    </div>
  )
}
