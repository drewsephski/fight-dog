import { getDivisionWithFighterDetails, DivisionWithFighters } from '@/lib/actions/rankings-actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Crown, TrendingUp, Swords, ArrowLeft } from 'lucide-react'
import { FighterImage } from '@/components/fighter-image'

interface DivisionPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function DivisionPage({ params }: DivisionPageProps) {
  const { id } = await params
  const division = await getDivisionWithFighterDetails(id)

  if (!division) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href="/rankings"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 sm:mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rankings
        </Link>

        {/* Division Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-4">
            {division.categoryName}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            {division.fighters.length} ranked fighters
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Champion Card */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-sm p-6 sm:p-8 sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="w-5 h-5 text-yellow-500" />
                <h2 className="font-black text-lg tracking-wider">CHAMPION</h2>
              </div>
              
              {division.championDetails ? (
                <Link
                  href={`/fighters/${division.champion.id}`}
                  className="group block text-center"
                >
                  <FighterImage
                    fighterId={division.champion.id}
                    name={division.champion.championName}
                    imageUrl={division.championDetails.imgUrl}
                    size="lg"
                    className="mx-auto mb-6 w-32 h-32 sm:w-40 sm:h-40"
                  />
                  <h3 className="font-black text-xl sm:text-2xl mb-2 group-hover:text-primary transition-colors">
                    {division.champion.championName}
                  </h3>
                  {division.championDetails.nickname && (
                    <p className="text-muted-foreground italic mb-4">
                      &ldquo;{division.championDetails.nickname}&rdquo;
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <StatBadge label="Record" value={`${division.championDetails.wins}-${division.championDetails.losses}`} />
                    <StatBadge label="Status" value={division.championDetails.status} />
                  </div>
                </Link>
              ) : (
                <div className="text-center py-8">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-xl">{division.champion.championName}</h3>
                </div>
              )}
            </div>
          </div>

          {/* Rankings List */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-black text-lg tracking-wider">RANKINGS</h2>
            </div>

            {division.fighterDetails.length > 0 ? (
              <div className="space-y-3">
                {division.fighterDetails.map((fighter, index) => (
                  <FighterRankCard
                    key={fighter.name}
                    fighter={fighter}
                    rank={index + 1}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-sm">
                <p className="text-muted-foreground">No fighter details available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted px-3 py-1.5 rounded-sm">
      <span className="text-muted-foreground text-xs block">{label}</span>
      <span className="font-bold text-sm">{value}</span>
    </div>
  )
}

function FighterRankCard({
  fighter,
  rank,
}: {
  fighter: DivisionWithFighters['fighterDetails'][0]
  rank: number
}) {
  // Generate a fighter ID from the name for the URL
  const fighterId = fighter.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  return (
    <Link
      href={`/fighters/${fighterId}`}
      className="group flex items-center gap-4 bg-card border border-border hover:border-primary/50 p-4 rounded-sm transition-all duration-300"
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-sm flex items-center justify-center">
        <span className="font-black text-lg sm:text-xl text-primary">#{rank}</span>
      </div>

      {/* Fighter Image */}
      <FighterImage
        fighterId={fighterId}
        name={fighter.name}
        imageUrl={fighter.imgUrl}
        size="sm"
        className="flex-shrink-0"
      />

      {/* Fighter Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-base sm:text-lg truncate group-hover:text-primary transition-colors">
          {fighter.name}
        </h3>
        {fighter.nickname && (
          <p className="text-muted-foreground text-xs sm:text-sm italic truncate">
            &ldquo;{fighter.nickname}&rdquo;
          </p>
        )}
      </div>

      {/* Record */}
      <div className="hidden sm:block text-right flex-shrink-0">
        <p className="font-bold text-primary">
          {fighter.wins}-{fighter.losses}
          {fighter.draws !== '0' && `-${fighter.draws}`}
        </p>
        <p className="text-muted-foreground text-xs">Record</p>
      </div>

      {/* Arrow */}
      <div className="text-muted-foreground group-hover:text-primary transition-colors">
        <Swords className="w-4 h-4" />
      </div>
    </Link>
  )
}
