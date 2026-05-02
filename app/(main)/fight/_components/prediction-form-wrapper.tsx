'use client'

import { PredictionForm } from '../../_components/prediction-form'

interface Fighter {
  id: string
  name: string
  record?: string | null
}

interface PredictionFormWrapperProps {
  fightId: string
  fighter1: Fighter
  fighter2: Fighter
  existingPrediction: {
    id: string
    predictedWinnerId: string
    confidence: number
    predictedMethod: string | null
    predictedRound: number | null
  } | null
}

export function PredictionFormWrapper({ 
  fightId, 
  fighter1, 
  fighter2, 
  existingPrediction 
}: PredictionFormWrapperProps) {
  const handleSuccess = () => {
    // Refresh the page to show updated prediction
    window.location.reload()
  }

  return (
    <PredictionForm
      fightId={fightId}
      fighter1={fighter1}
      fighter2={fighter2}
      existingPrediction={existingPrediction}
      onSuccess={handleSuccess}
    />
  )
}
