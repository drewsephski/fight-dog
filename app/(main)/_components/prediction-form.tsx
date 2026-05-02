'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { 
  createPrediction, 
  updatePrediction, 
  deletePrediction,
  type PredictionMethod 
} from '@/lib/actions/prediction-actions'
import { Star, Flame, Swords, Clock, Trash2, Check } from 'lucide-react'

interface Fighter {
  id: string
  name: string
  record?: string | null
}

interface PredictionFormProps {
  fightId: string
  fighter1: Fighter
  fighter2: Fighter
  existingPrediction?: {
    id: string
    predictedWinnerId: string
    confidence: number
    predictedMethod: string | null
    predictedRound: number | null
  } | null
  onSuccess?: () => void
}

const METHODS: { value: PredictionMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'KO_TKO', label: 'KO/TKO', icon: <Flame className="w-4 h-4" /> },
  { value: 'SUBMISSION', label: 'Submission', icon: <Swords className="w-4 h-4" /> },
  { value: 'DECISION', label: 'Decision', icon: <Clock className="w-4 h-4" /> },
]

const ROUNDS = [1, 2, 3, 4, 5]

export function PredictionForm({ 
  fightId, 
  fighter1, 
  fighter2, 
  existingPrediction,
  onSuccess 
}: PredictionFormProps) {
  const [selectedFighter, setSelectedFighter] = useState<string>(
    existingPrediction?.predictedWinnerId || ''
  )
  const [confidence, setConfidence] = useState(existingPrediction?.confidence || 3)
  const [method, setMethod] = useState<PredictionMethod>(
    existingPrediction?.predictedMethod as PredictionMethod || null
  )
  const [round, setRound] = useState<number | null>(
    existingPrediction?.predictedRound || null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset round when method is DECISION
  const handleMethodChange = (newMethod: PredictionMethod) => {
    setMethod(newMethod)
    if (newMethod === 'DECISION') {
      setRound(null)
    }
  }

  const handleSubmit = async () => {
    if (!selectedFighter) {
      toast.error('Please select a fighter to predict')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (existingPrediction) {
        // Update existing prediction
        const result = await updatePrediction({
          predictionId: existingPrediction.id,
          predictedWinnerId: selectedFighter,
          confidence,
          predictedMethod: method,
          predictedRound: round,
        })

        if (result.success) {
          toast.success('Prediction updated successfully!')
          onSuccess?.()
        } else {
          if (result.error?.includes('not authenticated')) {
            toast.error('Please sign in to make predictions', {
              action: {
                label: 'Sign In',
                onClick: () => window.location.href = '/sign-in'
              }
            })
          } else if (result.error?.includes('deadline has passed')) {
            toast.error('Prediction deadline has passed for this fight')
          } else {
            toast.error(result.error || 'Failed to update prediction')
          }
        }
      } else {
        // Create new prediction
        const result = await createPrediction({
          fightId,
          predictedWinnerId: selectedFighter,
          confidence,
          predictedMethod: method,
          predictedRound: round,
        })

        if (result.success) {
          const fighterName = selectedFighter === fighter1.id ? fighter1.name : fighter2.name
          toast.success(`Predicted ${fighterName} will win!`, {
            description: method ? `Method: ${method}${round ? ` (Round ${round})` : ''}` : undefined
          })
          onSuccess?.()
        } else {
          if (result.error?.includes('not authenticated')) {
            toast.error('Please sign in to make predictions', {
              action: {
                label: 'Sign In',
                onClick: () => window.location.href = '/sign-in'
              }
            })
          } else if (result.error?.includes('deadline has passed')) {
            toast.error('Prediction deadline has passed for this fight')
          } else if (result.error?.includes('already exists')) {
            toast.error('You already have a prediction for this fight. Please update it instead.')
          } else {
            toast.error(result.error || 'Failed to create prediction')
          }
        }
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!existingPrediction) return

    if (!confirm('Are you sure you want to delete this prediction?')) return

    setIsLoading(true)
    try {
      const result = await deletePrediction(existingPrediction.id)
      if (result.success) {
        toast.success('Prediction deleted successfully')
        onSuccess?.()
      } else {
        if (result.error?.includes('not authenticated')) {
          toast.error('Please sign in', {
            action: {
              label: 'Sign In',
              onClick: () => window.location.href = '/sign-in'
            }
          })
        } else {
          toast.error(result.error || 'Failed to delete prediction')
        }
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 text-sm rounded-sm">
          {error}
        </div>
      )}

      {/* Fighter Selection */}
      <div className="space-y-2 sm:space-y-3">
        <label className="text-xs sm:text-sm font-bold tracking-widest text-muted-foreground">
          PICK YOUR WINNER
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setSelectedFighter(fighter1.id)}
            disabled={isLoading}
            aria-pressed={selectedFighter === fighter1.id}
            className={`p-3 sm:p-4 border transition-all rounded-sm text-left min-h-[80px] sm:min-h-0 ${
              selectedFighter === fighter1.id
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-muted-foreground/50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="font-bold text-base sm:text-lg mb-1 truncate">{fighter1.name}</div>
            {fighter1.record && (
              <div className="text-sm text-muted-foreground">{fighter1.record}</div>
            )}
            {selectedFighter === fighter1.id && (
              <div className="mt-2 text-primary text-xs font-bold tracking-wider">
                SELECTED
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSelectedFighter(fighter2.id)}
            disabled={isLoading}
            aria-pressed={selectedFighter === fighter2.id}
            className={`p-3 sm:p-4 border transition-all rounded-sm text-left min-h-[80px] sm:min-h-0 ${
              selectedFighter === fighter2.id
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-muted-foreground/50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="font-bold text-base sm:text-lg mb-1 truncate">{fighter2.name}</div>
            {fighter2.record && (
              <div className="text-sm text-muted-foreground">{fighter2.record}</div>
            )}
            {selectedFighter === fighter2.id && (
              <div className="mt-2 text-primary text-xs font-bold tracking-wider">
                SELECTED
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Confidence Stars */}
      <div className="space-y-2 sm:space-y-3">
        <label className="text-xs sm:text-sm font-bold tracking-widest text-muted-foreground">
          CONFIDENCE ({confidence}/5)
        </label>
        <div className="flex gap-1 sm:gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setConfidence(star)}
              disabled={isLoading}
              aria-label={`Set confidence to ${star} star${star !== 1 ? 's' : ''}`}
              aria-pressed={star <= confidence}
              className={`transition-all p-1 sm:p-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                star <= confidence ? 'text-primary' : 'text-muted-foreground/30'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Star className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          How confident are you in this pick? Higher confidence = more points if correct!
        </p>
      </div>

      {/* Method Selection */}
      <div className="space-y-2 sm:space-y-3">
        <label className="text-xs sm:text-sm font-bold tracking-widest text-muted-foreground">
          METHOD OF VICTORY (OPTIONAL)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => handleMethodChange(method === m.value ? null : m.value)}
              disabled={isLoading}
              aria-pressed={method === m.value}
              className={`flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 border transition-all text-xs sm:text-sm rounded-sm min-h-[48px] sm:min-h-[56px] ${
                method === m.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-muted-foreground/50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {m.icon}
              <span className="hidden sm:inline">{m.label}</span>
              <span className="sm:hidden">{m.label.split('/')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Round Selection (only for KO/Submission) */}
      {method && method !== 'DECISION' && (
        <div className="space-y-2 sm:space-y-3">
          <label className="text-xs sm:text-sm font-bold tracking-widest text-muted-foreground">
            ROUND OF FINISH (OPTIONAL)
          </label>
          <div className="flex gap-2">
            {ROUNDS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRound(round === r ? null : r)}
                disabled={isLoading}
                aria-pressed={round === r}
                aria-label={`Round ${r}`}
                className={`w-11 h-11 sm:w-12 sm:h-12 border transition-all font-bold rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                  round === r
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-muted-foreground/50'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !selectedFighter}
          className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground px-4 sm:px-6 py-3 font-bold tracking-wide transition-all flex items-center justify-center gap-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background min-h-[48px]"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Processing...
            </span>
          ) : existingPrediction ? (
            <>
              <Check className="w-5 h-5" />
              UPDATE PREDICTION
            </>
          ) : (
            'SUBMIT PREDICTION'
          )}
        </button>
        {existingPrediction && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            aria-label="Delete prediction"
            className="px-4 py-3 border border-destructive/50 text-destructive hover:bg-destructive/10 transition-all rounded-sm focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background min-h-[48px] flex items-center justify-center"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}
