'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  Trophy, 
  XCircle, 
  Clock, 
  Star, 
  Flame, 
  Swords, 
  Timer,
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react'
import { PredictionForm } from './prediction-form'

interface PredictionCardProps {
  prediction: {
    id: string
    predictedWinnerId: string
    confidence: number
    predictedMethod: string | null
    predictedRound: number | null
    result: string | null
    points: number
    isCorrect: boolean | null
    createdAt: Date
    fight: {
      id: string
      weightClass: string
      isTitleFight: boolean
      isMainEvent: boolean
      status: string
      fighter1: {
        id: string
        name: string
        record?: string | null
      }
      fighter2: {
        id: string
        name: string
        record?: string | null
      }
      winner?: {
        id: string
        name: string
      } | null
      event: {
        name: string
        date: Date
      }
      oddsSnapshots: Array<{
        fighter1Odds: number
        fighter2Odds: number
      }>
    }
    predictedWinner: {
      id: string
      name: string
    }
  }
  onUpdate?: () => void
}

const METHOD_ICONS: Record<string, React.ReactNode> = {
  'KO_TKO': <Flame className="w-3 h-3" />,
  'SUBMISSION': <Swords className="w-3 h-3" />,
  'DECISION': <Timer className="w-3 h-3" />,
}

const METHOD_LABELS: Record<string, string> = {
  'KO_TKO': 'KO/TKO',
  'SUBMISSION': 'Sub',
  'DECISION': 'Dec',
}

export function PredictionCard({ prediction, onUpdate }: PredictionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const { fight, predictedWinner, confidence, predictedMethod, predictedRound, result, points } = prediction
  
  const opponent = fight.fighter1.id === predictedWinner.id 
    ? fight.fighter2 
    : fight.fighter1

  const isUpcoming = fight.status === 'upcoming'
  const isWin = result === 'win'
  const isLoss = result === 'loss'
  const isPending = result === 'pending' || !result

  // Calculate odds advantage
  const oddsSnapshot = fight.oddsSnapshots[0]
  const isUnderdog = oddsSnapshot && (
    (predictedWinner.id === fight.fighter1.id && oddsSnapshot.fighter1Odds > oddsSnapshot.fighter2Odds) ||
    (predictedWinner.id === fight.fighter2.id && oddsSnapshot.fighter2Odds > oddsSnapshot.fighter1Odds)
  )

  const handleEditSuccess = () => {
    setIsEditing(false)
    onUpdate?.()
  }

  return (
    <div className="bg-[#111] border border-white/10 overflow-hidden">
      {/* Card Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left: Event Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {fight.isTitleFight && (
                <Trophy className="w-3 h-3 text-[#d20a0a]" />
              )}
              <span className="text-xs text-[#d20a0a] font-bold tracking-wider truncate">
                {fight.event.name}
              </span>
            </div>
            <div className="text-xs text-white/40 mb-2">
              {format(new Date(fight.event.date), 'MMM d, yyyy')} • {fight.weightClass}
            </div>
            
            {/* Fighters */}
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm truncate">{predictedWinner.name}</span>
              <span className="text-white/40 text-xs">vs</span>
              <span className="text-white/60 text-sm truncate">{opponent.name}</span>
            </div>
          </div>

          {/* Right: Status & Points */}
          <div className="flex flex-col items-end gap-2">
            {isPending ? (
              <div className="flex items-center gap-1 text-white/40 text-xs">
                <Clock className="w-3 h-3" />
                PENDING
              </div>
            ) : isWin ? (
              <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
                <Trophy className="w-3 h-3" />
                +{points} PTS
              </div>
            ) : isLoss ? (
              <div className="flex items-center gap-1 text-[#d20a0a] text-xs font-bold">
                <XCircle className="w-3 h-3" />
                LOSS
              </div>
            ) : null}
            
            {/* Confidence Stars */}
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-3 h-3 ${star <= confidence ? 'text-[#d20a0a] fill-[#d20a0a]' : 'text-white/20'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Prediction Summary */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Target className="w-3 h-3" />
            Pick: <span className="text-white font-medium">{predictedWinner.name.split(' ').pop()}</span>
          </div>
          {predictedMethod && (
            <div className="flex items-center gap-1 text-xs text-white/60">
              <span className="text-white/20">•</span>
              {METHOD_ICONS[predictedMethod]}
              {METHOD_LABELS[predictedMethod]}
              {predictedRound && ` R${predictedRound}`}
            </div>
          )}
          {isUnderdog && (
            <span className="text-xs bg-[#d20a0a]/20 text-[#d20a0a] px-1.5 py-0.5 rounded">
              Underdog
            </span>
          )}
          
          <div className="ml-auto">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-white/40" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/40" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/10 p-4 bg-[#0a0a0a]">
          {isEditing ? (
            <PredictionForm
              fightId={fight.id}
              fighter1={fight.fighter1}
              fighter2={fight.fighter2}
              existingPrediction={{
                id: prediction.id,
                predictedWinnerId: prediction.predictedWinnerId,
                confidence: prediction.confidence,
                predictedMethod: prediction.predictedMethod,
                predictedRound: prediction.predictedRound,
              }}
              onSuccess={handleEditSuccess}
            />
          ) : (
            <div className="space-y-4">
              {/* Result Summary (if completed) */}
              {!isPending && fight.winner && (
                <div className={`p-3 border ${isWin ? 'border-green-500/30 bg-green-500/10' : 'border-[#d20a0a]/30 bg-[#d20a0a]/10'}`}>
                  <div className="text-xs text-white/60 mb-1">RESULT</div>
                  <div className="font-bold">
                    {fight.winner.name} 
                    {isWin ? ' - Your pick was correct!' : ' - Your pick was incorrect'}
                  </div>
                </div>
              )}

              {/* Prediction Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-white/40 text-xs mb-1">YOUR PICK</div>
                  <div className="font-medium">{predictedWinner.name}</div>
                </div>
                <div>
                  <div className="text-white/40 text-xs mb-1">CONFIDENCE</div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= confidence ? 'text-[#d20a0a] fill-[#d20a0a]' : 'text-white/20'}`}
                      />
                    ))}
                  </div>
                </div>
                {predictedMethod && (
                  <div>
                    <div className="text-white/40 text-xs mb-1">METHOD</div>
                    <div className="flex items-center gap-1">
                      {METHOD_ICONS[predictedMethod]}
                      {METHOD_LABELS[predictedMethod]}
                    </div>
                  </div>
                )}
                {predictedRound && (
                  <div>
                    <div className="text-white/40 text-xs mb-1">ROUND</div>
                    <div>Round {predictedRound}</div>
                  </div>
                )}
              </div>

              {/* Odds Info */}
              {oddsSnapshot && (
                <div className="pt-3 border-t border-white/10">
                  <div className="text-white/40 text-xs mb-2">ODDS AT PREDICTION</div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-white/60">{fight.fighter1.name.split(' ').pop()}: </span>
                      <span className={oddsSnapshot.fighter1Odds > 0 ? 'text-green-400' : 'text-[#d20a0a]'}>
                        {oddsSnapshot.fighter1Odds > 0 ? '+' : ''}{oddsSnapshot.fighter1Odds}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60">{fight.fighter2.name.split(' ').pop()}: </span>
                      <span className={oddsSnapshot.fighter2Odds > 0 ? 'text-green-400' : 'text-[#d20a0a]'}>
                        {oddsSnapshot.fighter2Odds > 0 ? '+' : ''}{oddsSnapshot.fighter2Odds}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isUpcoming && (
                <div className="flex gap-2 pt-3 border-t border-white/10">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Edit Prediction
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
