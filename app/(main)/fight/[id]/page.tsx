import { getFightById, getBestOddsForFight } from '@/lib/actions/odds-actions'
import { getFightPrediction } from '@/lib/actions/prediction-actions'
import { getFightFightersWithDetails } from '@/lib/actions/rankings-actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, Trophy, TrendingUp, Crown, Swords } from 'lucide-react'
import { PredictionFormWrapper } from '../_components/prediction-form-wrapper'
import { FighterImage } from '@/components/fighter-image'

interface FightPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function FightPage({ params }: FightPageProps) {
  const { id } = await params
  const fight = await getFightById(id)

  if (!fight) {
    notFound()
  }

  const [bestOdds, predictionResult, fighterDetails] = await Promise.all([
    getBestOddsForFight(id),
    getFightPrediction(id),
    getFightFightersWithDetails(
      fight.fighter1.id,
      fight.fighter1.name,
      fight.fighter2.id,
      fight.fighter2.name
    ),
  ])

  const f1 = fighterDetails.fighter1
  const f2 = fighterDetails.fighter2

  // Use Octagon data for display if available
  const fighter1Display = {
    id: f1.id,
    name: f1.name,
    imageUrl: f1.octagonData?.imgUrl || fight.fighter1.imageUrl,
    division: f1.octagonData?.category || fight.fighter1.division,
    record: f1.octagonData
      ? `${f1.octagonData.wins}-${f1.octagonData.losses}${f1.octagonData.draws !== '0' ? `-${f1.octagonData.draws}` : ''}`
      : fight.fighter1.record,
    stance: f1.octagonData?.fightingStyle,
    reach: f1.octagonData?.reach,
    nickname: f1.octagonData?.nickname,
    age: f1.octagonData?.age,
    height: f1.octagonData?.height,
    weight: f1.octagonData?.weight,
    placeOfBirth: f1.octagonData?.placeOfBirth,
    trainsAt: f1.octagonData?.trainsAt,
    status: f1.octagonData?.status,
    ranking: f1.ranking,
  }

  const fighter2Display = {
    id: f2.id,
    name: f2.name,
    imageUrl: f2.octagonData?.imgUrl || fight.fighter2.imageUrl,
    division: f2.octagonData?.category || fight.fighter2.division,
    record: f2.octagonData
      ? `${f2.octagonData.wins}-${f2.octagonData.losses}${f2.octagonData.draws !== '0' ? `-${f2.octagonData.draws}` : ''}`
      : fight.fighter2.record,
    stance: f2.octagonData?.fightingStyle,
    reach: f2.octagonData?.reach,
    nickname: f2.octagonData?.nickname,
    age: f2.octagonData?.age,
    height: f2.octagonData?.height,
    weight: f2.octagonData?.weight,
    placeOfBirth: f2.octagonData?.placeOfBirth,
    trainsAt: f2.octagonData?.trainsAt,
    status: f2.octagonData?.status,
    ranking: f2.ranking,
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href={`/events/${fight.eventId}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 sm:mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event
        </Link>

        {/* Fight Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
            {fight.isTitleFight && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 tracking-wider rounded-sm">
                TITLE FIGHT
              </span>
            )}
            {fight.isMainEvent && (
              <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 tracking-wider rounded-sm">
                MAIN EVENT
              </span>
            )}
            {fight.weightClass && (
              <span className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 tracking-wider rounded-sm">
                {fight.weightClass.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-muted-foreground flex items-center justify-center gap-2 flex-wrap mb-6">
            <Calendar className="w-5 h-5 flex-shrink-0" />
            <span>{format(new Date(fight.event.date), 'EEEE, MMMM d, yyyy')} • {fight.event.name}</span>
          </p>
        </div>

        {/* FACE-OFF SECTION */}
        <div className="relative mb-12 sm:mb-16">
          {/* VS Badge - Center */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <span className="font-black text-xl sm:text-2xl text-primary-foreground">VS</span>
            </div>
          </div>

          {/* Fighter Cards */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
            {/* Fighter 1 */}
            <FighterFaceOffCard fighter={fighter1Display} odds={bestOdds?.fighter1Best} isLeft />
            {/* Fighter 2 */}
            <FighterFaceOffCard fighter={fighter2Display} odds={bestOdds?.fighter2Best} isLeft={false} />
          </div>
        </div>

        {/* Tale of the Tape */}
        {(fighter1Display.octagonData || fighter2Display.octagonData) && (
          <div className="bg-card border border-border rounded-sm p-6 sm:p-8 mb-8 sm:mb-12">
            <h2 className="font-black text-xl sm:text-2xl tracking-tight mb-6 sm:mb-8 text-center">
              TALE OF THE TAPE
            </h2>
            <TaleOfTheTape f1={fighter1Display} f2={fighter2Display} />
          </div>
        )}

        {/* Odds Comparison */}
        {fight.oddsSnapshots.length > 0 && (
          <div className="bg-card border border-border p-4 sm:p-8 mb-6 sm:mb-8">
            <h2 className="font-black text-lg sm:text-xl tracking-tight mb-4 sm:mb-6 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
              LIVE ODDS COMPARISON
            </h2>

            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full min-w-[500px] sm:min-w-0">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 sm:px-4 text-muted-foreground font-medium text-sm">BOOKMAKER</th>
                    <th className="text-center py-3 px-2 sm:px-4 text-muted-foreground font-medium text-sm">
                      {fight.fighter1.name.split(' ').pop()}
                    </th>
                    <th className="text-center py-3 px-2 sm:px-4 text-muted-foreground font-medium text-sm">
                      {fight.fighter2.name.split(' ').pop()}
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 text-muted-foreground font-medium text-sm">UPDATED</th>
                  </tr>
                </thead>
                <tbody>
                  {fight.oddsSnapshots.slice(0, 5).map((odds) => (
                    <tr key={odds.id} className="border-b border-border/50 hover:bg-accent transition-colors">
                      <td className="py-3 px-2 sm:px-4 font-medium">{odds.bookmakerName}</td>
                      <td className="text-center py-3 px-2 sm:px-4">
                        <span className={`font-bold ${odds.fighter1Odds === Math.max(...fight.oddsSnapshots.map(o => o.fighter1Odds)) ? 'text-primary' : 'text-foreground'}`}>
                          {odds.fighter1Odds > 0 ? '+' : ''}{odds.fighter1Odds}
                        </span>
                      </td>
                      <td className="text-center py-3 px-2 sm:px-4">
                        <span className={`font-bold ${odds.fighter2Odds === Math.max(...fight.oddsSnapshots.map(o => o.fighter2Odds)) ? 'text-primary' : 'text-foreground'}`}>
                          {odds.fighter2Odds > 0 ? '+' : ''}{odds.fighter2Odds}
                        </span>
                      </td>
                      <td className="text-right py-3 px-2 sm:px-4 text-muted-foreground text-sm">
                        {format(new Date(odds.lastUpdate), 'MMM d, h:mm a')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Prediction Section */}
        {fight.status === 'upcoming' && (
          <div className="bg-card border border-border p-4 sm:p-8 mb-6 sm:mb-8">
            <h2 className="font-black text-xl sm:text-2xl mb-2 flex items-center gap-3">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
              MAKE YOUR PREDICTION
            </h2>
            <p className="text-muted-foreground mb-4 sm:mb-6">
              Who do you think will win? Select your pick, confidence level, and optional method/round.
            </p>
            <PredictionFormWrapper
              fightId={fight.id}
              fighter1={fight.fighter1}
              fighter2={fight.fighter2}
              existingPrediction={predictionResult.prediction ? {
                id: predictionResult.prediction.id,
                predictedWinnerId: predictionResult.prediction.predictedWinnerId,
                confidence: predictionResult.prediction.confidence,
                predictedMethod: (predictionResult.prediction as unknown as { predictedMethod?: string | null }).predictedMethod ?? null,
                predictedRound: (predictionResult.prediction as unknown as { predictedRound?: number | null }).predictedRound ?? null,
              } : null}
            />
          </div>
        )}

        {/* Show Prediction Result for Completed Fights */}
        {fight.status !== 'upcoming' && predictionResult.prediction && (
          <div className={`p-6 sm:p-8 text-center ${
            (predictionResult.prediction as unknown as { result?: string | null }).result === 'win'
              ? 'bg-green-500/10 border border-green-500/30'
              : 'bg-primary/10 border border-primary/30'
          }`}>
            <Trophy className={`w-12 h-12 mx-auto mb-4 ${
              (predictionResult.prediction as unknown as { result?: string | null }).result === 'win' ? 'text-green-500' : 'text-primary'
            }`} />
            <h2 className="font-black text-xl sm:text-2xl mb-2">
              {(predictionResult.prediction as unknown as { result?: string | null }).result === 'win' ? 'CORRECT PREDICTION!' : 'INCORRECT PREDICTION'}
            </h2>
            <p className="text-muted-foreground">
              You picked {(predictionResult.prediction as unknown as { predictedWinner?: { name: string } | null }).predictedWinner?.name}
              {(predictionResult.prediction as unknown as { result?: string | null }).result === 'win'
                ? ` and won ${(predictionResult.prediction as unknown as { points?: number }).points} points!`
                : ' but they lost.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface FighterDisplay {
  id: string
  name: string
  imageUrl?: string | null
  division?: string | null
  record?: string | null
  stance?: string | null
  reach?: string | null
  nickname?: string | null
  age?: string | null
  height?: string | null
  weight?: string | null
  placeOfBirth?: string | null
  trainsAt?: string | null
  status?: string | null
  ranking?: { division: string; rank: number; divisionId: string }
}

function FighterFaceOffCard({
  fighter,
  odds,
  isLeft,
}: {
  fighter: FighterDisplay
  odds?: { odds: number; bookmaker: string } | null
  isLeft: boolean
}) {
  return (
    <Link
      href={`/fighters/${fighter.id}`}
      className={`group relative bg-card border-2 ${isLeft ? 'border-r-primary/50' : 'border-l-primary/50'} border-border hover:border-primary transition-all duration-300 block overflow-hidden rounded-sm`}
    >
      {/* Ranking Badge */}
      {fighter.ranking && (
        <div className={`absolute top-4 ${isLeft ? 'left-4' : 'right-4'} z-10`}>
          <div className={`px-3 py-1.5 rounded-sm font-bold text-sm ${
            fighter.ranking.rank === 0
              ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
              : 'bg-primary/10 text-primary border border-primary/20'
          }`}>
            {fighter.ranking.rank === 0 ? (
              <span className="flex items-center gap-1">
                <Crown className="w-3 h-3" />
                CHAMP
              </span>
            ) : (
              <span>#{fighter.ranking.rank}</span>
            )}
          </div>
        </div>
      )}

      <div className="p-6 sm:p-8">
        {/* Fighter Image - Centered Large */}
        <div className={`flex ${isLeft ? 'justify-start' : 'justify-end'} mb-6`}>
          <div className="relative">
            <FighterImage
              fighterId={fighter.id}
              name={fighter.name}
              imageUrl={fighter.imageUrl}
              size="lg"
              className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48"
            />
            {/* Status Badge */}
            {fighter.status && (
              <div className={`absolute -bottom-2 ${isLeft ? '-right-2' : '-left-2'} bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-sm`}>
                {fighter.status}
              </div>
            )}
          </div>
        </div>

        {/* Name & Nickname */}
        <div className={`text-${isLeft ? 'left' : 'right'}`}>
          <h3 className={`font-black text-2xl sm:text-3xl lg:text-4xl group-hover:text-primary transition-colors ${isLeft ? '' : 'text-right'}`}>
            {fighter.name}
          </h3>
          {fighter.nickname && fighter.nickname !== 'null' && (
            <p className={`text-muted-foreground italic mt-1 ${isLeft ? '' : 'text-right'}`}>
              &ldquo;{fighter.nickname}&rdquo;
            </p>
          )}
        </div>

        {/* Division */}
        <p className={`text-muted-foreground text-sm mt-2 ${isLeft ? '' : 'text-right'}`}>
          {fighter.division || 'Unknown Division'}
        </p>

        {/* Record - Big */}
        {fighter.record && (
          <div className={`mt-6 ${isLeft ? '' : 'text-right'}`}>
            <p className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary">{fighter.record}</p>
            <p className="text-muted-foreground text-xs tracking-widest mt-1">PRO RECORD</p>
          </div>
        )}

        {/* Odds */}
        {odds && (
          <div className={`mt-6 ${isLeft ? '' : 'text-right'}`}>
            <div className={`inline-block bg-secondary p-4 rounded-sm ${isLeft ? '' : 'text-left'}`}>
              <p className="text-muted-foreground text-xs tracking-widest mb-1">BEST ODDS</p>
              <p className="font-black text-2xl sm:text-3xl">
                {odds.odds > 0 ? '+' : ''}{odds.odds}
              </p>
              <p className="text-muted-foreground text-sm">{odds.bookmaker}</p>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className={`mt-6 grid grid-cols-2 gap-3 ${isLeft ? '' : 'text-right'}`}>
          <StatBox label="STANCE" value={fighter.stance || 'Unknown'} />
          <StatBox label="REACH" value={fighter.reach ? `${fighter.reach}"` : 'Unknown'} />
        </div>

        {/* View Profile Link */}
        <div className={`mt-6 ${isLeft ? '' : 'text-right'}`}>
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground group-hover:text-primary transition-colors">
            View Full Profile
            <Swords className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 p-3 rounded-sm">
      <p className="text-muted-foreground text-xs tracking-wider">{label}</p>
      <p className="font-bold text-sm sm:text-base">{value}</p>
    </div>
  )
}

function TaleOfTheTape({ f1, f2 }: { f1: FighterDisplay; f2: FighterDisplay }) {
  const stats = [
    { label: 'Age', f1: f1.age ? `${f1.age} yrs` : '-', f2: f2.age ? `${f2.age} yrs` : '-' },
    { label: 'Height', f1: f1.height ? `${f1.height}"` : '-', f2: f2.height ? `${f2.height}"` : '-' },
    { label: 'Weight', f1: f1.weight ? `${f1.weight} lbs` : '-', f2: f2.weight ? `${f2.weight} lbs` : '-' },
    { label: 'Reach', f1: f1.reach ? `${f1.reach}"` : '-', f2: f2.reach ? `${f2.reach}"` : '-' },
    { label: 'Stance', f1: f1.stance || '-', f2: f2.stance || '-' },
    { label: 'Origin', f1: f1.placeOfBirth || '-', f2: f2.placeOfBirth || '-' },
  ]

  return (
    <div className="space-y-2">
      {stats.map((stat) => (
        <div key={stat.label} className="grid grid-cols-3 items-center gap-4 py-3 border-b border-border/50 last:border-0">
          <div className="text-right">
            <p className="font-bold text-lg sm:text-xl">{stat.f1}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-xs sm:text-sm tracking-wider">{stat.label}</p>
          </div>
          <div className="text-left">
            <p className="font-bold text-lg sm:text-xl">{stat.f2}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
