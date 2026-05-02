'use client'

import { Trophy, Target, Flame, Swords, Clock, Zap, TrendingUp, Award } from 'lucide-react'

interface UserStatsDashboardProps {
  stats: {
    totalPicks: number
    correctPicks: number
    incorrectPicks: number
    accuracy: number
    currentStreak: number
    bestStreak: number
    totalPoints: number
    underdogWins: number
    koTkoWins: number
    submissionWins: number
    decisionWins: number
    methodAccuracy: number
    tier: string
  } | null
}

const TIER_COLORS: Record<string, string> = {
  'Bronze': 'text-amber-600',
  'Silver': 'text-slate-400',
  'Gold': 'text-yellow-500',
  'Platinum': 'text-gray-300',
  'Diamond': 'text-cyan-300',
}

const TIER_BG: Record<string, string> = {
  'Bronze': 'bg-amber-700/10 border-amber-700/30',
  'Silver': 'bg-slate-400/10 border-slate-400/30',
  'Gold': 'bg-yellow-500/10 border-yellow-500/30',
  'Platinum': 'bg-gray-300/10 border-gray-300/30',
  'Diamond': 'bg-cyan-300/10 border-cyan-300/30',
}

export function UserStatsDashboard({ stats }: UserStatsDashboardProps) {
  if (!stats || stats.totalPicks === 0) {
    return (
      <div className="bg-card border border-border p-6 sm:p-8 text-center rounded-sm">
        <Target className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="font-bold text-base sm:text-lg mb-2">No Predictions Yet</h3>
        <p className="text-muted-foreground text-sm">
          Start making fight predictions to see your stats and track your accuracy.
        </p>
      </div>
    )
  }

  const winRate = stats.totalPicks > 0 ? (stats.correctPicks / stats.totalPicks) * 100 : 0

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tier Badge */}
      <div className={`p-3 sm:p-4 border rounded-sm ${TIER_BG[stats.tier] || TIER_BG['Bronze']}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">CURRENT TIER</div>
            <div className={`text-xl sm:text-2xl font-black ${TIER_COLORS[stats.tier] || TIER_COLORS['Bronze']}`}>
              {stats.tier.toUpperCase()}
            </div>
          </div>
          <Award className={`w-10 h-10 sm:w-12 sm:h-12 ${TIER_COLORS[stats.tier] || TIER_COLORS['Bronze']}`} />
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border border-border p-3 sm:p-4 text-center rounded-sm">
          <div className="text-2xl sm:text-3xl font-black text-foreground mb-1">{stats.totalPicks}</div>
          <div className="text-xs text-muted-foreground tracking-widest">TOTAL PICKS</div>
        </div>
        <div className="bg-card border border-border p-3 sm:p-4 text-center rounded-sm">
          <div className={`text-2xl sm:text-3xl font-black mb-1 ${winRate >= 60 ? 'text-green-500' : winRate >= 50 ? 'text-yellow-500' : 'text-primary'}`}>
            {winRate.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground tracking-widest">ACCURACY</div>
        </div>
        <div className="bg-card border border-border p-3 sm:p-4 text-center rounded-sm">
          <div className="text-2xl sm:text-3xl font-black text-primary mb-1">{stats.totalPoints}</div>
          <div className="text-xs text-muted-foreground tracking-widest">POINTS</div>
        </div>
        <div className="bg-card border border-border p-3 sm:p-4 text-center rounded-sm">
          <div className={`text-2xl sm:text-3xl font-black mb-1 ${stats.currentStreak > 0 ? 'text-green-500' : 'text-foreground'}`}>
            {stats.currentStreak > 0 ? `+${stats.currentStreak}` : stats.currentStreak}
          </div>
          <div className="text-xs text-muted-foreground tracking-widest">STREAK</div>
        </div>
      </div>

      {/* Breakdown Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Record */}
        <div className="bg-card border border-border p-3 sm:p-4 rounded-sm">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">RECORD</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-black text-green-500">{stats.correctPicks}</span>
            <span className="text-muted-foreground">-</span>
            <span className="text-2xl font-black text-primary">{stats.incorrectPicks}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Correct - Incorrect</div>
        </div>

        {/* Best Streak */}
        <div className="bg-card border border-border p-3 sm:p-4 rounded-sm">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-bold">BEST STREAK</span>
          </div>
          <div className="text-2xl font-black text-yellow-500">{stats.bestStreak}</div>
          <div className="text-xs text-muted-foreground mt-1">Consecutive wins</div>
        </div>

        {/* Method Breakdown */}
        <div className="bg-card border border-border p-3 sm:p-4 rounded-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">BY METHOD</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Flame className="w-3 h-3" />
                KO/TKO
              </div>
              <span className="font-bold">{stats.koTkoWins}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Swords className="w-3 h-3" />
                Sub
              </div>
              <span className="font-bold">{stats.submissionWins}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-3 h-3" />
                Dec
              </div>
              <span className="font-bold">{stats.decisionWins}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Underdog Bonus */}
      {stats.underdogWins > 0 && (
        <div className="bg-primary/10 border border-primary/30 p-3 sm:p-4 rounded-sm">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">UNDERDOG WINS</span>
          </div>
          <div className="text-2xl font-black text-primary">{stats.underdogWins}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Correctly picked {stats.underdogWins} underdog{stats.underdogWins !== 1 ? 's' : ''} that won
          </div>
        </div>
      )}
    </div>
  )
}
