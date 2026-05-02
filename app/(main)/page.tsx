import { getMainCardFights, getEvents } from '@/lib/actions/odds-actions'
import { getEnhancedMainCardFights } from '@/lib/actions/enhanced-fights-actions'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { Suspense } from 'react'
import { Trophy, Calendar, TrendingUp, Users, MapPin, Star, ArrowRight } from 'lucide-react'
import { FightsListWithPredictions } from './_components/fights-list-with-predictions'
import { HeroSkeleton } from './_components/hero-skeleton'
import { format } from 'date-fns'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Grid overlay - brutalist texture */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]">
        <div className="h-full w-full" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, #000 40px, #000 41px),
                           repeating-linear-gradient(90deg, transparent, transparent 40px, #000 40px, #000 41px)`
        }} />
      </div>

      {/* Hero Section - Brutalist tower */}
      <HeroSection />

      {/* Upcoming Events - Brutalist archive */}
      <Suspense fallback={<HeroSkeleton />}>
        <EventsSection />
      </Suspense>

      {/* Featured Fights - Raw intensity */}
      <Suspense fallback={<HeroSkeleton />}>
        <FightsSection />
      </Suspense>

      {/* Stats Section - Industrial data blocks */}
      <StatsSection />

      {/* CTA Section - Hard call to action */}
      <CTASection />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative border-b-2 border-border">
      {/* Brutalist hero with stark typography */}
      <div className="max-w-7xl mx-auto">
        {/* Top bar with live indicator */}
        <div className="border-b-2 border-border px-4 sm:px-6 lg:px-12 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary animate-pulse" />
            <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground">LIVE DATA FEED</span>
          </div>
          <div className="flex-1 border-t border-border/50" />
          <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground hidden sm:block">UFC ONLY</span>
        </div>

        <div className="px-4 sm:px-6 lg:px-12 py-16 sm:py-24 lg:py-32">
          {/* Massive stacked headline - brutalist tower */}
          <div className="mb-12 sm:mb-16">
            <h1 className="font-black text-[clamp(4rem,15vw,12rem)] leading-[0.8] tracking-[-0.04em] uppercase">
              <span className="block">FIGHT</span>
              <span className="block text-primary">INTEL</span>
            </h1>
          </div>

          {/* Description with hard edge separator */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-end">
            <div className="border-l-4 border-primary pl-6">
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-md">
                Real-time UFC odds, fighter analytics, and predictive insights.
                <span className="text-foreground font-medium"> No fluff. Just data.</span>
              </p>
            </div>

            {/* CTA Buttons - hard edges */}
            <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
              <Link
                href="/events"
                className="group inline-flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 font-bold tracking-wide transition-colors border-2 border-primary hover:border-primary/90"
              >
                <Calendar className="w-5 h-5" />
                VIEW EVENTS
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/fighters"
                className="inline-flex items-center justify-center gap-3 bg-background text-foreground px-8 py-4 font-bold tracking-wide transition-colors border-2 border-foreground hover:bg-foreground hover:text-background"
              >
                <Users className="w-5 h-5" />
                FIGHTERS
              </Link>
            </div>
          </div>
        </div>

        {/* Stats strip - industrial data display */}
        <div className="grid grid-cols-3 border-t-2 border-border">
          <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8 border-r-2 border-border">
            <div className="text-xs font-bold tracking-[0.15em] text-muted-foreground mb-2">ODDS</div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground">24/7</div>
            <div className="text-xs text-muted-foreground mt-1 tracking-wide">LIVE TRACKING</div>
          </div>
          <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8 border-r-2 border-border">
            <div className="text-xs font-bold tracking-[0.15em] text-muted-foreground mb-2">FOCUS</div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary">UFC</div>
            <div className="text-xs text-muted-foreground mt-1 tracking-wide">EXCLUSIVE</div>
          </div>
          <div className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
            <div className="text-xs font-bold tracking-[0.15em] text-muted-foreground mb-2">TRACK</div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground">YOUR</div>
            <div className="text-xs text-muted-foreground mt-1 tracking-wide">PREDICTIONS</div>
          </div>
        </div>
      </div>
    </section>
  )
}

async function EventsSection() {
  const events = await getEvents()

  return (
    <section className="border-b-2 border-border">
      {/* Section header - industrial style */}
      <div className="border-b-2 border-border bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold tracking-[0.2em] text-primary">01</span>
            <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground">UPCOMING EVENTS</span>
          </div>
          <Link
            href="/events"
            className="group flex items-center gap-2 text-xs font-bold tracking-wide text-muted-foreground hover:text-foreground transition-colors"
          >
            VIEW ALL
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
        {/* Section headline */}
        <div className="mb-12 sm:mb-16">
          <h2 className="font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter uppercase leading-none mb-4">
            Fight Schedule
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Championship bouts, rising contenders, can&apos;t-miss matchups. Track every UFC event with live odds.
          </p>
        </div>

        {/* Events grid - brutalist cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-2 border-border">
          {events.slice(0, 6).map((event, index) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group relative bg-background hover:bg-muted transition-colors"
            >
              <div className="p-6 sm:p-8">
                {/* Event number */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {event.isPpv && (
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 tracking-wider">
                      PPV
                    </span>
                  )}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium tracking-wide">
                    {format(new Date(event.date), 'MMMM d, yyyy')}
                  </span>
                </div>

                {/* Event name */}
                <h3 className="font-black text-xl sm:text-2xl tracking-tight group-hover:text-primary transition-colors mb-4 uppercase">
                  {event.name}
                </h3>

                {/* Location */}
                {event.location && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-6 pt-6 border-t-2 border-border">
                  <div>
                    <span className="text-2xl font-black text-foreground">{event.fights.length}</span>
                    <span className="text-xs font-bold tracking-wider text-muted-foreground ml-2">FIGHTS</span>
                  </div>
                  {event.fights.some(f => f.isTitleFight) && (
                    <div className="flex items-center gap-1.5 text-primary">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs font-bold tracking-wider">TITLE</span>
                    </div>
                  )}
                </div>

                {/* Main card preview */}
                {event.fights.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <div className="text-xs font-bold tracking-wider text-muted-foreground mb-3">MAIN CARD</div>
                    <div className="space-y-2">
                      {event.fights
                        .filter(fight => fight.isMainEvent || fight.isTitleFight)
                        .slice(0, 2)
                        .map((fight) => (
                          <div
                            key={fight.id}
                            className="text-sm font-medium text-muted-foreground"
                          >
                            {fight.isMainEvent && <span className="text-primary font-bold">MAIN </span>}
                            {fight.isTitleFight && <span className="text-primary font-bold">TITLE </span>}
                            <span className="text-foreground">{fight.fighter1.name.split(' ').pop()} vs {fight.fighter2.name.split(' ').pop()}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Hover indicator */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-16 sm:py-24 border-2 border-border bg-muted">
            <div className="w-16 h-16 border-2 border-border mx-auto mb-6 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium mb-2">No upcoming events found</p>
            <p className="text-muted-foreground/70 text-sm">Data is syncing from The Odds API...</p>
          </div>
        )}
      </div>
    </section>
  )
}

async function FightsSection() {
  const fights = await getEnhancedMainCardFights(6)
  const { userId } = await auth()

  return (
    <section className="border-b-2 border-border">
      {/* Section header - industrial style */}
      <div className="border-b-2 border-border bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold tracking-[0.2em] text-primary">02</span>
            <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground">FEATURED FIGHTS</span>
          </div>
          <Link
            href="/events"
            className="group flex items-center gap-2 text-xs font-bold tracking-wide text-muted-foreground hover:text-foreground transition-colors"
          >
            VIEW ALL
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16">
        {/* Section headline */}
        <div className="mb-12 sm:mb-16">
          <h2 className="font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter uppercase leading-none mb-4">
            Can&apos;t Miss
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            The most anticipated matchups. Title fights, grudge matches, and rising stars making their move.
          </p>
        </div>

        <FightsListWithPredictions 
          fights={fights.map(f => ({ ...f, userPrediction: null }))} 
          isAuthenticated={!!userId}
        />
      </div>
    </section>
  )
}

function StatsSection() {
  const features = [
    {
      number: '01',
      icon: TrendingUp,
      title: 'LIVE ODDS',
      description: 'Real-time odds from major sportsbooks. Track line movements and find the best value.'
    },
    {
      number: '02',
      icon: Trophy,
      title: 'PREDICTIONS',
      description: 'Make your picks and track your accuracy. Compete on the leaderboard with other fans.'
    },
    {
      number: '03',
      icon: Users,
      title: 'FIGHTER PROFILES',
      description: 'Detailed stats, records, and fight history for every UFC athlete.'
    }
  ]

  return (
    <section className="border-b-2 border-border">
      {/* Section header */}
      <div className="border-b-2 border-border bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold tracking-[0.2em] text-primary">03</span>
            <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground">FEATURES</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.number}
              className={`p-8 sm:p-12 ${index < 2 ? 'lg:border-r-2' : ''} border-b-2 lg:border-b-0 border-border`}
            >
              {/* Number and icon row */}
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground">{feature.number}</span>
                <feature.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Title */}
              <h3 className="font-black text-2xl sm:text-3xl tracking-tight uppercase mb-4">
                {feature.title}
              </h3>

              {/* Divider */}
              <div className="w-12 h-1 bg-primary mb-6" />

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="bg-primary">
      <div className="max-w-7xl mx-auto">
        {/* Top accent line */}
        <div className="border-b-2 border-primary-foreground/20" />

        <div className="px-4 sm:px-6 lg:px-12 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Headline */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-bold tracking-[0.2em] text-primary-foreground/60">04</span>
                <span className="text-xs font-bold tracking-[0.2em] text-primary-foreground/60">GET STARTED</span>
              </div>
              <h2 className="font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter text-primary-foreground uppercase leading-none">
                Ready to<br />Make Your<br />Picks?
              </h2>
            </div>

            {/* Right - Content */}
            <div>
              <p className="text-primary-foreground/80 text-lg sm:text-xl mb-8 leading-relaxed">
                Join FightLens today and start tracking your fight predictions.
                Compete with friends and prove your MMA knowledge.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/predictions"
                  className="group inline-flex items-center justify-center gap-3 bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-4 font-bold tracking-wide transition-colors border-2 border-primary-foreground"
                >
                  START PREDICTING
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-3 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-4 font-bold tracking-wide transition-colors border-2 border-primary-foreground"
                >
                  BROWSE EVENTS
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats strip */}
        <div className="border-t-2 border-primary-foreground/20 grid sm:grid-cols-3">
          <div className="px-4 sm:px-6 lg:px-12 py-6 border-b sm:border-b-0 sm:border-r border-primary-foreground/20">
            <span className="text-xs font-bold tracking-[0.15em] text-primary-foreground/60">FREE TO JOIN</span>
          </div>
          <div className="px-4 sm:px-6 lg:px-12 py-6 border-b sm:border-b-0 sm:border-r border-primary-foreground/20">
            <span className="text-xs font-bold tracking-[0.15em] text-primary-foreground/60">UFC EXCLUSIVE</span>
          </div>
          <div className="px-4 sm:px-6 lg:px-12 py-6">
            <span className="text-xs font-bold tracking-[0.15em] text-primary-foreground/60">REAL-TIME DATA</span>
          </div>
        </div>
      </div>
    </section>
  )
}
