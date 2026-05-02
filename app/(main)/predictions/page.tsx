import { Trophy, Target, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react'
import { getUserPredictions, getUserStats, getUpcomingFightsWithoutPredictions } from '@/lib/actions/prediction-actions'
import { PredictionCard } from '../_components/prediction-card'
import { UserStatsDashboard } from '../_components/user-stats-dashboard'
import Link from 'next/link'

export default async function PredictionsPage() {
  const [predictionsResult, statsResult, upcomingResult] = await Promise.all([
    getUserPredictions(),
    getUserStats(),
    getUpcomingFightsWithoutPredictions(5),
  ])

  const predictions = predictionsResult.success ? predictionsResult.predictions : []
  const stats = statsResult.success ? statsResult.stats : null
  const upcomingFights = upcomingResult.success ? upcomingResult.fights : []

  const pendingPredictions = predictions.filter(p => p.result === 'pending' || !p.result)
  const completedPredictions = predictions.filter(p => p.result === 'win' || p.result === 'loss')

  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-4">
            YOUR <span className="text-primary">PREDICTIONS</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
            Track your fight picks, accuracy, and compete on the leaderboard.
          </p>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
          <div className="bg-card border border-border p-4 sm:p-6 text-center rounded-sm">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-black text-foreground">{stats?.totalPicks || 0}</div>
            <p className="text-muted-foreground text-xs tracking-widest mt-1">TOTAL PICKS</p>
          </div>
          <div className="bg-card border border-border p-4 sm:p-6 text-center rounded-sm">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-black text-primary">
              {stats?.accuracy ? `${stats.accuracy.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-muted-foreground text-xs tracking-widest mt-1">ACCURACY</p>
          </div>
          <div className="bg-card border border-border p-4 sm:p-6 text-center rounded-sm">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mx-auto mb-2" />
            <div className={`text-2xl sm:text-3xl font-black ${(stats?.currentStreak || 0) > 0 ? 'text-green-500' : 'text-foreground'}`}>
              {(stats?.currentStreak || 0) > 0 ? `+${stats?.currentStreak}` : stats?.currentStreak || 0}
            </div>
            <p className="text-muted-foreground text-xs tracking-widest mt-1">STREAK</p>
          </div>
          <div className="bg-card border border-border p-4 sm:p-6 text-center rounded-sm">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-black text-foreground">{pendingPredictions.length}</div>
            <p className="text-muted-foreground text-xs tracking-widest mt-1">PENDING</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Detailed Stats */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <div className="bg-card border border-border p-4 sm:p-6 rounded-sm">
              <h2 className="font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                YOUR STATS
              </h2>
              <UserStatsDashboard stats={stats} />
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border p-4 sm:p-6 rounded-sm">
              <h2 className="font-bold text-base sm:text-lg mb-4">QUICK ACTIONS</h2>
              <div className="space-y-3">
                <Link
                  href="/events"
                  className="flex items-center gap-3 p-3 bg-accent hover:bg-accent/80 transition-colors rounded-sm"
                >
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-medium">Browse Events</span>
                </Link>
                <Link
                  href="/leaderboard"
                  className="flex items-center gap-3 p-3 bg-accent hover:bg-accent/80 transition-colors rounded-sm"
                >
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="font-medium">View Leaderboard</span>
                </Link>
              </div>
            </div>

            {/* Upcoming Fights Without Predictions */}
            {upcomingFights.length > 0 && (
              <div className="bg-card border border-border p-4 sm:p-6 rounded-sm">
                <h2 className="font-bold text-base sm:text-lg mb-4">NEED PREDICTIONS</h2>
                <div className="space-y-3">
                  {upcomingFights.slice(0, 3).map((fight) => (
                    <Link
                      key={fight.id}
                      href={`/fight/${fight.id}`}
                      className="block p-3 bg-accent hover:bg-accent/80 transition-colors rounded-sm"
                    >
                      <div className="text-xs text-primary mb-1 truncate">{fight.event.name}</div>
                      <div className="text-sm font-medium">
                        {fight.fighter1.name.split(' ').pop()} vs {fight.fighter2.name.split(' ').pop()}
                      </div>
                    </Link>
                  ))}
                </div>
                {upcomingFights.length > 3 && (
                  <Link
                    href="/events"
                    className="block mt-3 text-center text-sm text-primary hover:underline"
                  >
                    View {upcomingFights.length - 3} more fights →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Predictions List */}
          <div className="lg:col-span-2">
            {/* Pending Predictions */}
            {pendingPredictions.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h2 className="font-bold text-lg sm:text-xl mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  PENDING PREDICTIONS
                  <span className="text-sm font-normal text-muted-foreground">({pendingPredictions.length})</span>
                </h2>
                <div className="space-y-4">
                  {pendingPredictions.map((prediction) => (
                    <PredictionCard
                      key={prediction.id}
                      prediction={prediction}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Predictions */}
            {completedPredictions.length > 0 && (
              <div>
                <h2 className="font-bold text-lg sm:text-xl mb-4 flex items-center gap-2">
                  {completedPredictions.filter(p => p.result === 'win').length > completedPredictions.filter(p => p.result === 'loss').length ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-primary" />
                  )}
                  COMPLETED PREDICTIONS
                  <span className="text-sm font-normal text-muted-foreground">({completedPredictions.length})</span>
                </h2>
                <div className="space-y-4">
                  {completedPredictions.slice(0, 10).map((prediction) => (
                    <PredictionCard
                      key={prediction.id}
                      prediction={prediction}
                    />
                  ))}
                </div>
                {completedPredictions.length > 10 && (
                  <div className="text-center mt-6">
                    <button className="text-muted-foreground hover:text-foreground text-sm font-medium">
                      View all {completedPredictions.length} predictions
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {predictions.length === 0 && (
              <div className="bg-card border border-border p-8 sm:p-12 text-center rounded-sm">
                <Target className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-6" />
                <h2 className="font-bold text-xl sm:text-2xl mb-4">NO PREDICTIONS YET</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Start making fight predictions to track your accuracy and compete on the leaderboard.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/events"
                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 font-bold tracking-wide transition-all rounded-sm"
                  >
                    <Calendar className="w-5 h-5" />
                    BROWSE EVENTS
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
