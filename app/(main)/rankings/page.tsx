import { getRankingsWithChampionDetails } from '@/lib/actions/rankings-actions'
import Link from 'next/link'
import { Trophy, Users, Crown } from 'lucide-react'
import { FighterImage } from '@/components/fighter-image'

export default async function RankingsPage() {
  const rankings = await getRankingsWithChampionDetails()

  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-4">
            UFC <span className="text-primary">RANKINGS</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
            Browse all weight classes and see the champions and top-ranked fighters in each division.
          </p>
        </div>

        {/* Rankings Grid */}
        {rankings.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {rankings.map((division) => (
              <Link
                key={division.id}
                href={`/rankings/${division.id}`}
                className="group bg-card border border-border hover:border-primary/50 transition-all duration-300 rounded-sm overflow-hidden"
              >
                {/* Division Header */}
                <div className="bg-primary/5 border-b border-border p-4 sm:p-5">
                  <h2 className="font-black text-lg sm:text-xl tracking-tight group-hover:text-primary transition-colors">
                    {division.categoryName}
                  </h2>
                </div>

                {/* Champion Section */}
                <div className="p-4 sm:p-5">
                  {division.championDetails ? (
                    <div className="flex items-center gap-3 sm:gap-4">
                      <FighterImage
                        fighterId={division.champion.id}
                        name={division.champion.championName}
                        imageUrl={division.championDetails.imgUrl}
                        size="md"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs font-bold text-yellow-500 tracking-wider">
                            CHAMPION
                          </span>
                        </div>
                        <h3 className="font-bold text-base sm:text-lg truncate">
                          {division.champion.championName}
                        </h3>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                          {division.championDetails.wins}-{division.championDetails.losses}
                          {division.championDetails.draws !== '0' && `-${division.championDetails.draws}`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-muted-foreground tracking-wider">
                          CHAMPION
                        </span>
                        <p className="font-bold text-base">{division.champion.championName}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground pt-3 border-t border-border">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {division.fighters.length} ranked fighters
                    </span>
                    <span className="group-hover:text-primary transition-colors">
                      View division →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-card border border-border rounded-sm">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No rankings available</p>
            <p className="text-muted-foreground/70 text-sm">
              Unable to load rankings data from the API
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
