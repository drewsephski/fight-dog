import { getAllOctagonFightersWithRankings } from '@/lib/actions/rankings-actions'
import { FighterSearch } from './_components/fighter-search'

export const dynamic = 'force-dynamic'

export default async function FightersPage() {
  const fighters = await getAllOctagonFightersWithRankings()

  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-12">
          <h1 className="font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-4">
            FIGHTER <span className="text-primary">PROFILES</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
            Browse all {fighters.length} UFC fighters with official records, stats, and division info from the Octagon API.
          </p>
        </div>

        <FighterSearch fighters={fighters} />
      </div>
    </div>
  )
}
