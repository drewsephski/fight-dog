import { Trophy, Medal, Target, TrendingUp, Award, Zap } from 'lucide-react'
import { getLeaderboard, getUserStats } from '@/lib/actions/prediction-actions'

const TIER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Bronze': { bg: 'bg-amber-700/10', border: 'border-amber-700/30', text: 'text-amber-600' },
  'Silver': { bg: 'bg-slate-400/10', border: 'border-slate-400/30', text: 'text-slate-400' },
  'Gold': { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-500' },
  'Platinum': { bg: 'bg-gray-300/10', border: 'border-gray-300/30', text: 'text-gray-300' },
  'Diamond': { bg: 'bg-cyan-300/10', border: 'border-cyan-300/30', text: 'text-cyan-300' },
}

export default async function LeaderboardPage() {
  const leaderboardResult = await getLeaderboard(50)
  const userStatsResult = await getUserStats()
  
  const leaderboard = leaderboardResult.success ? leaderboardResult.leaderboard : []
  const userStats = userStatsResult.success ? userStatsResult.stats : null
  
  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-4">
            PREDICTION <span className="text-primary">LEADERBOARD</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
            See who&apos;s making the best fight predictions. Compete with friends and climb the ranks.
          </p>
        </div>

        {/* Top 3 Podium */}
        {top3.length > 0 && (
          <div className="grid md:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
            {/* 2nd Place */}
            {top3[1] && (
              <div className="bg-slate-400/10 border border-slate-400/30 p-6 sm:p-8 text-center order-2 md:order-1 rounded-sm">
                <Medal className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-4" />
                <div className="text-2xl sm:text-3xl font-black text-slate-400 mb-2">2nd</div>
                <div className="font-bold text-base sm:text-lg mb-1">
                  {top3[1].user.displayName || top3[1].user.username || 'User'}
                </div>
                <div className="text-muted-foreground text-sm mb-3">
                  {top3[1].accuracy.toFixed(1)}% accuracy • {top3[1].correctPicks}W-{top3[1].incorrectPicks}L
                </div>
                <span className={`inline-block px-2 py-1 text-xs font-bold ${TIER_COLORS[top3[1].tier].bg} ${TIER_COLORS[top3[1].tier].text} ${TIER_COLORS[top3[1].tier].border} border rounded-sm`}>
                  {top3[1].tier}
                </span>
              </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 sm:p-8 text-center order-1 md:order-2 transform md:-translate-y-4 rounded-sm">
                <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-4" />
                <div className="text-3xl sm:text-4xl font-black text-yellow-500 mb-2">1st</div>
                <div className="font-bold text-lg sm:text-xl mb-1">
                  {top3[0].user.displayName || top3[0].user.username || 'User'}
                </div>
                <div className="text-muted-foreground text-sm mb-3">
                  {top3[0].accuracy.toFixed(1)}% accuracy • {top3[0].correctPicks}W-{top3[0].incorrectPicks}L
                </div>
                <span className={`inline-block px-2 py-1 text-xs font-bold ${TIER_COLORS[top3[0].tier].bg} ${TIER_COLORS[top3[0].tier].text} ${TIER_COLORS[top3[0].tier].border} border rounded-sm`}>
                  {top3[0].tier}
                </span>
              </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <div className="bg-amber-700/10 border border-amber-700/30 p-6 sm:p-8 text-center order-3 rounded-sm">
                <Medal className="w-10 h-10 sm:w-12 sm:h-12 text-amber-600 mx-auto mb-4" />
                <div className="text-2xl sm:text-3xl font-black text-amber-600 mb-2">3rd</div>
                <div className="font-bold text-base sm:text-lg mb-1">
                  {top3[2].user.displayName || top3[2].user.username || 'User'}
                </div>
                <div className="text-muted-foreground text-sm mb-3">
                  {top3[2].accuracy.toFixed(1)}% accuracy • {top3[2].correctPicks}W-{top3[2].incorrectPicks}L
                </div>
                <span className={`inline-block px-2 py-1 text-xs font-bold ${TIER_COLORS[top3[2].tier].bg} ${TIER_COLORS[top3[2].tier].text} ${TIER_COLORS[top3[2].tier].border} border rounded-sm`}>
                  {top3[2].tier}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Full Leaderboard Table */}
        {rest.length > 0 && (
          <div className="bg-card border border-border overflow-hidden mb-6 sm:mb-8 rounded-sm">
            <div className="p-3 sm:p-4 border-b border-border">
              <h2 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                FULL RANKINGS
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-muted">
                  <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="p-3 sm:p-4 font-medium">Rank</th>
                    <th className="p-3 sm:p-4 font-medium">User</th>
                    <th className="p-3 sm:p-4 font-medium text-center">Tier</th>
                    <th className="p-3 sm:p-4 font-medium text-center">Accuracy</th>
                    <th className="p-3 sm:p-4 font-medium text-center">Record</th>
                    <th className="p-3 sm:p-4 font-medium text-center">Streak</th>
                    <th className="p-3 sm:p-4 font-medium text-center">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rest.map((entry, index) => (
                    <tr key={entry.userId} className="hover:bg-accent transition-colors">
                      <td className="p-3 sm:p-4">
                        <span className="font-black text-base sm:text-lg text-muted-foreground">
                          #{entry.rank || index + 4}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="font-medium">
                          {entry.user.displayName || entry.user.username || 'User'}
                        </div>
                        {entry.user.username && (
                          <div className="text-xs text-muted-foreground">@{entry.user.username}</div>
                        )}
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        <span className={`inline-block px-2 py-1 text-xs font-bold ${TIER_COLORS[entry.tier].bg} ${TIER_COLORS[entry.tier].text} ${TIER_COLORS[entry.tier].border} border rounded-sm`}>
                          {entry.tier}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        <div className={`font-bold ${entry.accuracy >= 60 ? 'text-green-500' : entry.accuracy >= 50 ? 'text-yellow-500' : 'text-primary'}`}>
                          {entry.accuracy.toFixed(1)}%
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        <span className="text-sm">
                          <span className="text-green-500">{entry.correctPicks}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-primary">{entry.incorrectPicks}</span>
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        <span className={`text-sm font-medium ${entry.currentStreak > 0 ? 'text-green-500' : entry.currentStreak < 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                          {entry.currentStreak > 0 ? `+${entry.currentStreak}` : entry.currentStreak}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        <span className="font-bold text-primary">{entry.totalPoints}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User's Position Card */}
        {userStats && userStats.totalPicks >= 5 && !leaderboard.find(e => e.userId === userStats.userId) && (
          <div className="bg-primary/10 border border-primary/30 p-4 sm:p-6 rounded-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Award className="w-8 h-8 sm:w-10 sm:h-10 text-primary flex-shrink-0" />
              <div className="flex-1">
                <div className="font-bold text-base sm:text-lg">Your Stats</div>
                <div className="text-muted-foreground text-sm">
                  {userStats.accuracy.toFixed(1)}% accuracy • {userStats.correctPicks}W-{userStats.incorrectPicks}L • {userStats.totalPoints} points
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Keep predicting to appear on the leaderboard!</div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {leaderboard.length === 0 && (
          <div className="bg-card border border-border p-8 sm:p-12 text-center rounded-sm">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-6" />
            <h2 className="font-bold text-xl sm:text-2xl mb-4">LEADERBOARD EMPTY</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              No predictions have been made yet. Be the first to make picks and claim the #1 spot!
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 sm:mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-card border border-border p-4 sm:p-6 rounded-sm">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-3" />
            <h3 className="font-bold mb-2">How to Climb</h3>
            <p className="text-muted-foreground text-sm">
              Make accurate predictions consistently. Higher confidence picks earn more points when correct.
            </p>
          </div>
          <div className="bg-card border border-border p-4 sm:p-6 rounded-sm">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-3" />
            <h3 className="font-bold mb-2">Underdog Bonus</h3>
            <p className="text-muted-foreground text-sm">
              Correctly picking underdogs that win gives you bonus points and recognition.
            </p>
          </div>
          <div className="bg-card border border-border p-4 sm:p-6 rounded-sm">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-3" />
            <h3 className="font-bold mb-2">Tier System</h3>
            <p className="text-muted-foreground text-sm">
              Bronze → Silver → Gold → Platinum → Diamond. Climb tiers by maintaining high accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
