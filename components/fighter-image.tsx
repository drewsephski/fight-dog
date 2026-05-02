'use client'

import Image from 'next/image'
import { useState } from 'react'

interface FighterImageProps {
  fighterId: string
  name: string
  imageUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fallbackLetter?: boolean
}

export function FighterImage({ 
  fighterId, 
  name, 
  imageUrl, 
  size = 'md', 
  className = '',
  fallbackLetter = true 
}: FighterImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-32 h-32 sm:w-40 sm:h-40'
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-4xl sm:text-5xl'
  }

  // If no image URL or image failed to load, show letter fallback
  if (!imageUrl || imageError) {
    return (
      <div className={`${sizeClasses[size]} bg-muted border-2 border-border flex items-center justify-center transition-colors ${className}`}>
        <span className={`${textSizes[size]} font-black text-foreground`}>
          {name.charAt(0)}
        </span>
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      {!imageLoaded && (
        <div className={`${sizeClasses[size]} bg-muted border-2 border-border flex items-center justify-center absolute inset-0 transition-colors`}>
          <span className={`${textSizes[size]} font-black text-foreground`}>
            {name.charAt(0)}
          </span>
        </div>
      )}
      <Image
        src={imageUrl}
        alt={name}
        fill
        className={`object-contain border-2 border-border transition-opacity ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={() => setImageError(true)}
        onLoad={() => setImageLoaded(true)}
        sizes="(max-width: 640px) 96px, 128px"
      />
    </div>
  )
}
