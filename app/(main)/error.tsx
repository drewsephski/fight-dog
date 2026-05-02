'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Main layout error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-xl sm:text-2xl text-primary">!</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tighter mb-3 text-foreground">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">
          We encountered an error loading this page. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 font-bold tracking-wide transition-colors rounded-sm"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border border-border hover:border-muted-foreground/50 text-foreground px-6 py-3 font-bold tracking-wide transition-colors rounded-sm text-center"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
