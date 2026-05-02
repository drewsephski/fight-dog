'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Trophy, Activity, Target, Check, Loader2, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createPrediction } from '@/lib/actions/prediction-actions'
import { FighterImage } from '@/components/fighter-image'

interface Fight {
  id: string
  weightClass: string
  isTitleFight: boolean
  isMainEvent: boolean
  fighter1: {
    id: string
    name: string
    imageUrl?: string | null
  }
  fighter2: {
    id: string
    name: string
    imageUrl?: string | null
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
  userPrediction?: {
    predictedWinnerId: string
  } | null
}

interface FightsListWithPredictionsProps {
  fights: Fight[]
  isAuthenticated?: boolean
}

export function FightsListWithPredictions({ fights, isAuthenticated = false }: FightsListWithPredictionsProps) {
  const [predictingId, setPredictingId] = useState<string | null>(null)

  if (fights.length === 0) {
    return (
      <div className="text-center py-16 sm:py-24 border-2 border-border bg-muted">
        <div className="w-16 h-16 border-2 border-border mx-auto mb-6 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium mb-2">No upcoming fights found</p>
        <p className="text-muted-foreground/70 text-sm">Check back soon for upcoming events</p>
      </div>
    )
  }

  const handleQuickPredict = async (fightId: string, fighterId: string, fighterName: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to make predictions', {
        action: {
          label: 'Sign In',
          onClick: () => window.location.href = '/sign-in'
        }
      })
      return
    }

    setPredictingId(`${fightId}-${fighterId}`)
    
    try {
      const result = await createPrediction({
        fightId,
        predictedWinnerId: fighterId,
        confidence: 3, // Default confidence
      })

      if (result.success) {
        toast.success(`Predicted ${fighterName} will win!`, {
          description: 'View your predictions on the Predictions page',
          action: {
            label: 'View',
            onClick: () => window.location.href = '/predictions'
          }
        })
        // Refresh the page to show updated state
        window.location.reload()
      } else {
        if (result.error?.includes('already exists')) {
          toast.error('You already predicted this fight. Visit the fight page to update.')
        } else if (result.error?.includes('deadline')) {
          toast.error('Prediction deadline has passed')
        } else {
          toast.error(result.error || 'Failed to create prediction')
        }
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setPredictingId(null)
    }
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-2 border-border">
      {fights.map((fight, index) => (
        <div
          key={fight.id}
          className="group relative bg-background hover:bg-muted transition-colors"
        >
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="p-6 sm:p-8">
            {/* Header row - Fight number and badges */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-3">
                {fight.isTitleFight && (
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold tracking-wider text-primary">TITLE</span>
                  </div>
                )}
                {fight.isMainEvent && (
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-bold tracking-wider text-muted-foreground">MAIN</span>
                  </div>
                )}
              </div>
            </div>

            {/* Event Information */}
            <Link href={`/events/${fight.event.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="mb-6 pb-6 border-b-2 border-border">
                <div className="text-xs font-bold tracking-widest text-primary mb-1 uppercase">
                  {fight.event.name}
                </div>
                <div className="text-muted-foreground text-sm font-medium">
                  {format(new Date(fight.event.date), 'EEEE, MMMM d')}
                </div>
              </div>
            </Link>

            {/* Fighters with Quick Predict */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {/* Fighter 1 */}
              <div className="text-center flex-1 min-w-0">
                <FighterImage
                  fighterId={fight.fighter1.id}
                  name={fight.fighter1.name}
                  imageUrl={fight.fighter1.imageUrl}
                  className="mb-3 mx-auto group-hover:border-primary/30 transition-colors"
                />
                <div className="font-black text-sm tracking-tight truncate mb-3 uppercase">{fight.fighter1.name}</div>

                {/* Quick Predict Button Fighter 1 */}
                {fight.userPrediction?.predictedWinnerId === fight.fighter1.id ? (
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary">
                    <Check className="w-4 h-4" />
                    <span>PREDICTED</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleQuickPredict(fight.id, fight.fighter1.id, fight.fighter1.name)}
                    disabled={predictingId === `${fight.id}-${fight.fighter1.id}` || !!fight.userPrediction}
                    className="w-full bg-secondary hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground hover:text-primary-foreground text-xs font-bold tracking-wide py-2.5 px-3 transition-colors flex items-center justify-center gap-1.5 border border-border hover:border-primary"
                  >
                    {predictingId === `${fight.id}-${fight.fighter1.id}` ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Target className="w-3.5 h-3.5" />
                    )}
                    PICK
                  </button>
                )}
              </div>

              {/* VS */}
              <div className="text-xl sm:text-2xl font-black text-primary flex-shrink-0">VS</div>

              {/* Fighter 2 */}
              <div className="text-center flex-1 min-w-0">
                <FighterImage
                  fighterId={fight.fighter2.id}
                  name={fight.fighter2.name}
                  imageUrl={fight.fighter2.imageUrl}
                  className="mb-3 mx-auto group-hover:border-primary/30 transition-colors"
                />
                <div className="font-black text-sm tracking-tight truncate mb-3 uppercase">{fight.fighter2.name}</div>
                
                {/* Quick Predict Button Fighter 2 */}
                {fight.userPrediction?.predictedWinnerId === fight.fighter2.id ? (
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary">
                    <Check className="w-4 h-4" />
                    <span>PREDICTED</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleQuickPredict(fight.id, fight.fighter2.id, fight.fighter2.name)}
                    disabled={predictingId === `${fight.id}-${fight.fighter2.id}` || !!fight.userPrediction}
                    className="w-full bg-secondary hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground hover:text-primary-foreground text-xs font-bold tracking-wide py-2.5 px-3 transition-colors flex items-center justify-center gap-1.5 border border-border hover:border-primary"
                  >
                    {predictingId === `${fight.id}-${fight.fighter2.id}` ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Target className="w-3.5 h-3.5" />
                    )}
                    PICK
                  </button>
                )}
              </div>
            </div>
            
            {/* Odds Display */}
            {fight.oddsSnapshots[0] && (
              <div className="bg-muted border-2 border-border p-4 mb-4">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Target className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-bold tracking-widest text-muted-foreground">LIVE ODDS</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-center flex-1 min-w-0">
                    <div className="text-muted-foreground text-xs mb-1 truncate">
                      {fight.fighter1.name.split(' ').pop()}
                    </div>
                    <div className="text-primary font-black text-xl sm:text-2xl">
                      {fight.oddsSnapshots[0].fighter1Odds > 0 ? '+' : ''}
                      {fight.oddsSnapshots[0].fighter1Odds}
                    </div>
                  </div>
                  <div className="text-border text-xs font-bold mx-2 sm:mx-4">VS</div>
                  <div className="text-center flex-1 min-w-0">
                    <div className="text-muted-foreground text-xs mb-1 truncate">
                      {fight.fighter2.name.split(' ').pop()}
                    </div>
                    <div className="text-primary font-black text-xl sm:text-2xl">
                      {fight.oddsSnapshots[0].fighter2Odds > 0 ? '+' : ''}
                      {fight.oddsSnapshots[0].fighter2Odds}
                    </div>
                  </div>
                </div>
                {fight.oddsSnapshots[0].bookmakerName && (
                  <div className="text-muted-foreground/60 text-xs text-center mt-3 font-medium">
                    Best odds via {fight.oddsSnapshots[0].bookmakerName}
                  </div>
                )}
              </div>
            )}
            
            {/* Fight details footer */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary" />
                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  {fight.weightClass}
                </span>
              </div>
              <Link 
                href={`/fight/${fight.id}`}
                className="text-xs font-bold tracking-wide text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                DETAILS
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
