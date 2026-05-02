import Link from 'next/link'
import { Ghost, Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 sm:mb-8">
          <Ghost className="w-20 h-20 sm:w-24 sm:h-24 text-primary mx-auto mb-4 sm:mb-6 opacity-80" />
          <h1 className="font-black text-6xl sm:text-7xl tracking-tighter mb-2">404</h1>
          <p className="text-muted-foreground text-base sm:text-lg">Page not found</p>
        </div>

        <p className="text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
          Looks like this page stepped out of the Octagon.
          The fight you&apos;re looking for might have been moved or doesn&apos;t exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 font-bold tracking-wide transition-all rounded-sm"
          >
            <Home className="w-5 h-5" />
            Back Home
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-2 border border-border hover:border-muted-foreground/50 text-foreground px-6 py-3 font-bold tracking-wide transition-all rounded-sm"
          >
            <Search className="w-5 h-5" />
            Browse Events
          </Link>
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Or go back to the previous page
          </button>
        </div>
      </div>
    </div>
  )
}
