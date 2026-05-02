'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { FighterImage } from '@/components/fighter-image'

interface FighterRanking {
  division: string
  rank: number
}

interface Fighter {
  id: string
  name: string
  nickname: string
  imageUrl: string
  division: string
  record: string
  stance: string
  reach: string
  ranking?: FighterRanking
}

interface FighterSearchProps {
  fighters: Fighter[]
}

export function FighterSearch({ fighters }: FighterSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFighters = useMemo(() => {
    if (!searchQuery.trim()) return fighters

    const query = searchQuery.toLowerCase()
    return fighters.filter(
      (fighter) =>
        fighter.name.toLowerCase().includes(query) ||
        fighter.nickname?.toLowerCase().includes(query) ||
        fighter.division?.toLowerCase().includes(query)
    )
  }, [fighters, searchQuery])

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search fighters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors rounded-sm"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-4 mb-6 sm:mb-8 text-sm text-muted-foreground">
        <span>
          {searchQuery
            ? `${filteredFighters.length} of ${fighters.length} fighters`
            : `${fighters.length} UFC Fighters`}
        </span>
      </div>

      {/* Fighter Grid */}
      {filteredFighters.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredFighters.map((fighter) => (
            <Link
              key={fighter.id}
              href={`/fighters/${fighter.id}`}
              className="group bg-card border border-border hover:border-primary/50 p-4 sm:p-6 transition-all duration-300 rounded-sm"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Ranking Badge */}
                {fighter.ranking && (
                  <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-sm flex items-center justify-center font-black text-sm ${
                    fighter.ranking.rank === 0
                      ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                      : 'bg-primary/10 text-primary border border-primary/20'
                  }`}>
                    {fighter.ranking.rank === 0 ? 'C' : `#${fighter.ranking.rank}`}
                  </div>
                )}
                <FighterImage
                  fighterId={fighter.id}
                  name={fighter.name}
                  imageUrl={fighter.imageUrl}
                  size="md"
                  className="group-hover:border-primary/50 transition-colors flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                    {fighter.name}
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {fighter.division || 'Unknown Division'}
                  </p>
                  {fighter.record && (
                    <p className="text-primary font-bold text-xs sm:text-sm mt-1">
                      {fighter.record}
                    </p>
                  )}
                </div>
              </div>

              {fighter.nickname && fighter.nickname !== 'null' && (
                <p className="mt-3 sm:mt-4 text-muted-foreground text-xs sm:text-sm italic truncate">
                  &ldquo;{fighter.nickname}&rdquo;
                </p>
              )}

              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>{fighter.stance !== 'Unknown' ? fighter.stance : 'Fighter'}</span>
                {fighter.reach && <span>Reach: {fighter.reach}</span>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 bg-card border border-border rounded-sm">
          <p className="text-muted-foreground mb-2">No fighters found</p>
          <p className="text-muted-foreground/70 text-sm">
            Try adjusting your search query
          </p>
        </div>
      )}
    </>
  )
}
