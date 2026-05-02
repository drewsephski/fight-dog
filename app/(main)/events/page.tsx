import { getEvents } from '@/lib/actions/odds-actions'
import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar, MapPin, Users, Star } from 'lucide-react'

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-12">
          <h1 className="font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-4">
            UPCOMING <span className="text-primary">EVENTS</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
            Browse upcoming UFC events with fight cards and live odds.
          </p>
        </div>

        {events.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {events.map((event, index) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group relative bg-card border-2 border-border hover:border-primary/50 transition-all duration-300 rounded-sm overflow-hidden"
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
                      {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>

                  {/* Event name */}
                  <h2 className="font-black text-xl sm:text-2xl tracking-tight group-hover:text-primary transition-colors mb-4">
                    {event.name}
                  </h2>

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{event.location}{event.venue && ` - ${event.venue}`}</span>
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-6 pt-6 border-t-2 border-border">
                    <div>
                      <span className="text-2xl font-black text-foreground">{event.fights.length}</span>
                      <span className="text-xs font-bold tracking-wider text-muted-foreground ml-2">FIGHTS</span>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-muted-foreground">
                        {format(new Date(event.date), 'MMM')}
                      </div>
                      <div className="text-xs text-muted-foreground tracking-widest">
                        {format(new Date(event.date), 'd')}
                      </div>
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
                      <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted-foreground mb-3">
                        <Users className="w-3.5 h-3.5" />
                        MAIN CARD MATCHUPS
                      </div>
                      <div className="space-y-2">
                        {event.fights
                          .filter(fight => fight.isMainEvent || fight.isTitleFight)
                          .slice(0, 3)
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
                        {event.fights.filter(fight => fight.isMainEvent || fight.isTitleFight).length === 0 && (
                          <div className="text-sm font-medium text-muted-foreground">
                            No main card fights available
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 bg-card border border-border rounded-sm">
            <p className="text-muted-foreground mb-4">No upcoming events found</p>
            <p className="text-muted-foreground/70 text-sm">Data is syncing from The Odds API...</p>
          </div>
        )}
      </div>
    </div>
  )
}
