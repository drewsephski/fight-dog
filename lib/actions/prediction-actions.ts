'use server'

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import { currentUser } from '@clerk/nextjs/server'

// Types
export type PredictionMethod = 'KO_TKO' | 'SUBMISSION' | 'DECISION' | null
export type PredictionResult = 'win' | 'loss' | 'pending' | 'push'

export interface CreatePredictionInput {
  fightId: string
  predictedWinnerId: string
  confidence: number // 1-5
  predictedMethod?: PredictionMethod
  predictedRound?: number | null
}

export interface UpdatePredictionInput {
  predictionId: string
  predictedWinnerId?: string
  confidence?: number
  predictedMethod?: PredictionMethod
  predictedRound?: number | null
}

// Helper to get or create user from Clerk
async function getOrCreateUser() {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        username: clerkUser.username || `user_${clerkUser.id.slice(0, 8)}`,
        displayName: clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}` 
          : clerkUser.firstName || clerkUser.username || 'User',
        avatarUrl: clerkUser.imageUrl,
      },
    })
    
    // Create initial user stats
    await prisma.userStats.create({
      data: {
        userId: user.id,
      },
    })
  }

  return user
}

// Check if prediction deadline has passed (fight has started)
async function canPredict(fightId: string): Promise<boolean> {
  const fight = await prisma.fight.findUnique({
    where: { id: fightId },
    include: { event: true },
  })

  if (!fight || fight.status !== 'upcoming') return false
  
  // Allow predictions until event date
  const now = new Date()
  const eventDate = new Date(fight.event.date)
  
  return now < eventDate
}

// Create a new prediction
export async function createPrediction(input: CreatePredictionInput) {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Check deadline
    const canMakePrediction = await canPredict(input.fightId)
    if (!canMakePrediction) {
      return { success: false, error: 'Prediction deadline has passed' }
    }

    // Validate confidence is 1-5
    if (input.confidence < 1 || input.confidence > 5) {
      return { success: false, error: 'Confidence must be between 1 and 5' }
    }

    // Validate round if provided
    if (input.predictedRound && (input.predictedRound < 1 || input.predictedRound > 5)) {
      return { success: false, error: 'Round must be between 1 and 5' }
    }

    // Check if prediction already exists
    const existingPrediction = await prisma.userPick.findUnique({
      where: {
        userId_fightId: {
          userId: user.id,
          fightId: input.fightId,
        },
      },
    })

    if (existingPrediction) {
      return { success: false, error: 'Prediction already exists. Use update instead.' }
    }

    const prediction = await prisma.userPick.create({
      data: {
        userId: user.id,
        fightId: input.fightId,
        predictedWinnerId: input.predictedWinnerId,
        confidence: input.confidence,
        predictedMethod: input.predictedMethod,
        predictedRound: input.predictedRound,
        result: 'pending',
      },
      include: {
        fight: {
          include: {
            fighter1: true,
            fighter2: true,
            event: true,
          },
        },
        predictedWinner: true,
      },
    })

    revalidatePath('/predictions')
    revalidatePath(`/fight/${input.fightId}`)
    
    return { success: true, prediction }
  } catch (error) {
    console.error('Failed to create prediction:', error)
    return { success: false, error: 'Failed to create prediction' }
  }
}

// Update an existing prediction
export async function updatePrediction(input: UpdatePredictionInput) {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const existingPrediction = await prisma.userPick.findUnique({
      where: { id: input.predictionId },
    })

    if (!existingPrediction) {
      return { success: false, error: 'Prediction not found' }
    }

    if (existingPrediction.userId !== user.id) {
      return { success: false, error: 'Not authorized to update this prediction' }
    }

    // Check deadline
    const canMakePrediction = await canPredict(existingPrediction.fightId)
    if (!canMakePrediction) {
      return { success: false, error: 'Prediction deadline has passed' }
    }

    // Validate confidence if provided
    if (input.confidence !== undefined && (input.confidence < 1 || input.confidence > 5)) {
      return { success: false, error: 'Confidence must be between 1 and 5' }
    }

    // Validate round if provided
    if (input.predictedRound !== undefined && input.predictedRound !== null && 
        (input.predictedRound < 1 || input.predictedRound > 5)) {
      return { success: false, error: 'Round must be between 1 and 5' }
    }

    const prediction = await prisma.userPick.update({
      where: { id: input.predictionId },
      data: {
        predictedWinnerId: input.predictedWinnerId,
        confidence: input.confidence,
        predictedMethod: input.predictedMethod,
        predictedRound: input.predictedRound,
        updatedAt: new Date(),
      },
      include: {
        fight: {
          include: {
            fighter1: true,
            fighter2: true,
            event: true,
          },
        },
        predictedWinner: true,
      },
    })

    revalidatePath('/predictions')
    revalidatePath(`/fight/${existingPrediction.fightId}`)
    
    return { success: true, prediction }
  } catch (error) {
    console.error('Failed to update prediction:', error)
    return { success: false, error: 'Failed to update prediction' }
  }
}

// Delete a prediction
export async function deletePrediction(predictionId: string) {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const existingPrediction = await prisma.userPick.findUnique({
      where: { id: predictionId },
    })

    if (!existingPrediction) {
      return { success: false, error: 'Prediction not found' }
    }

    if (existingPrediction.userId !== user.id) {
      return { success: false, error: 'Not authorized to delete this prediction' }
    }

    // Check deadline
    const canDelete = await canPredict(existingPrediction.fightId)
    if (!canDelete) {
      return { success: false, error: 'Cannot delete prediction after fight starts' }
    }

    await prisma.userPick.delete({
      where: { id: predictionId },
    })

    revalidatePath('/predictions')
    revalidatePath(`/fight/${existingPrediction.fightId}`)
    
    return { success: true }
  } catch (error) {
    console.error('Failed to delete prediction:', error)
    return { success: false, error: 'Failed to delete prediction' }
  }
}

// Get user's predictions
export async function getUserPredictions(status?: PredictionResult) {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, error: 'User not authenticated', predictions: [] }
    }

    const predictions = await prisma.userPick.findMany({
      where: {
        userId: user.id,
        ...(status && { result: status }),
      },
      include: {
        fight: {
          include: {
            fighter1: true,
            fighter2: true,
            event: true,
            oddsSnapshots: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        predictedWinner: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, predictions }
  } catch (error) {
    console.error('Failed to get user predictions:', error)
    return { success: false, error: 'Failed to get predictions', predictions: [] }
  }
}

// Get prediction for a specific fight
export async function getFightPrediction(fightId: string) {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: true, prediction: null }
    }

    const prediction = await prisma.userPick.findUnique({
      where: {
        userId_fightId: {
          userId: user.id,
          fightId: fightId,
        },
      },
      select: {
        id: true,
        predictedWinnerId: true,
        confidence: true,
        predictedMethod: true,
        predictedRound: true,
        predictedWinner: true,
      },
    })

    return { success: true, prediction }
  } catch (error) {
    console.error('Failed to get fight prediction:', error)
    return { success: false, error: 'Failed to get prediction', prediction: null }
  }
}

// Get user's prediction stats
export async function getUserStats() {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, error: 'User not authenticated', stats: null }
    }

    let stats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    })

    if (!stats) {
      stats = await prisma.userStats.create({
        data: { userId: user.id },
      })
    }

    return { success: true, stats }
  } catch (error) {
    console.error('Failed to get user stats:', error)
    return { success: false, error: 'Failed to get stats', stats: null }
  }
}

// Calculate and update user stats
export async function calculateUserStats(userId?: string) {
  try {
    const currentUserData = await getOrCreateUser()
    const targetUserId = userId || currentUserData?.id
    
    if (!targetUserId) {
      return { success: false, error: 'User not found' }
    }

    const predictions = await prisma.userPick.findMany({
      where: { userId: targetUserId },
      select: {
        id: true,
        result: true,
        resolvedAt: true,
        predictedMethod: true,
        predictedRound: true,
      }
    })

    const totalPicks = predictions.length
    const correctPicks = predictions.filter(p => p.result === 'win').length
    const incorrectPicks = predictions.filter(p => p.result === 'loss').length
    const pushPicks = predictions.filter(p => p.result === 'push').length
    const accuracy = totalPicks > 0 ? (correctPicks / totalPicks) * 100 : 0

    // Calculate streaks
    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0

    const sortedPredictions = predictions
      .filter(p => p.result !== 'pending')
      .sort((a, b) => new Date(b.resolvedAt || 0).getTime() - new Date(a.resolvedAt || 0).getTime())

    for (const pred of sortedPredictions) {
      if (pred.result === 'win') {
        tempStreak++
        if (tempStreak > bestStreak) bestStreak = tempStreak
      } else {
        tempStreak = 0
      }
    }
    currentStreak = tempStreak

    // Calculate method accuracy
    const methodPredictions = predictions.filter(p => p.predictedMethod && p.result !== 'pending')
    const methodWins = methodPredictions.filter(p => {
      // This would need actual fight result data to calculate properly
      // For now, we'll track separately
      return p.result === 'win'
    }).length
    const methodAccuracy = methodPredictions.length > 0 ? (methodWins / methodPredictions.length) * 100 : 0

    // Determine tier
    let tier = 'Bronze'
    if (accuracy >= 70 && totalPicks >= 50) tier = 'Diamond'
    else if (accuracy >= 65 && totalPicks >= 30) tier = 'Platinum'
    else if (accuracy >= 60 && totalPicks >= 20) tier = 'Gold'
    else if (accuracy >= 55 && totalPicks >= 10) tier = 'Silver'

    const stats = await prisma.userStats.upsert({
      where: { userId: targetUserId },
      create: {
        userId: targetUserId,
        totalPicks,
        correctPicks,
        incorrectPicks,
        pushPicks,
        accuracy,
        currentStreak,
        bestStreak,
        methodAccuracy,
        tier,
      },
      update: {
        totalPicks,
        correctPicks,
        incorrectPicks,
        pushPicks,
        accuracy,
        currentStreak,
        bestStreak,
        methodAccuracy,
        tier,
        lastCalculatedAt: new Date(),
      },
    })

    return { success: true, stats }
  } catch (error) {
    console.error('Failed to calculate user stats:', error)
    return { success: false, error: 'Failed to calculate stats' }
  }
}

// Get leaderboard
export async function getLeaderboard(limit: number = 50) {
  try {
    const leaders = await prisma.userStats.findMany({
      where: {
        totalPicks: { gte: 5 }, // Minimum 5 picks to appear
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ accuracy: 'desc' }, { totalPicks: 'desc' }],
      take: limit,
    })

    // Add rank
    const ranked = leaders.map((stats, index) => ({
      ...stats,
      rank: index + 1,
    }))

    return { success: true, leaderboard: ranked }
  } catch (error) {
    console.error('Failed to get leaderboard:', error)
    return { success: false, error: 'Failed to get leaderboard', leaderboard: [] }
  }
}

// ==================== SOCIAL FEATURES ====================

// Follow a user
export async function followUser(userIdToFollow: string) {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    if (user.id === userIdToFollow) {
      return { success: false, error: 'Cannot follow yourself' }
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: userIdToFollow,
        },
      },
    })

    if (existingFollow) {
      return { success: false, error: 'Already following this user' }
    }

    await prisma.follow.create({
      data: {
        followerId: user.id,
        followingId: userIdToFollow,
      },
    })

    revalidatePath('/predictions')
    revalidatePath('/users/[id]')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to follow user:', error)
    return { success: false, error: 'Failed to follow user' }
  }
}

// Unfollow a user
export async function unfollowUser(userIdToUnfollow: string) {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: userIdToUnfollow,
        },
      },
    })

    revalidatePath('/predictions')
    revalidatePath('/users/[id]')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to unfollow user:', error)
    return { success: false, error: 'Failed to unfollow user' }
  }
}

// Check if following a user
export async function isFollowing(userIdToCheck: string) {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, isFollowing: false }
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: userIdToCheck,
        },
      },
    })

    return { success: true, isFollowing: !!follow }
  } catch (error) {
    console.error('Failed to check follow status:', error)
    return { success: false, isFollowing: false }
  }
}

// Get users being followed
export async function getFollowing() {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, following: [] }
    }

    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            stats: {
              select: {
                accuracy: true,
                totalPicks: true,
                tier: true,
              },
            },
          },
        },
      },
    })

    return { success: true, following: following.map(f => f.following) }
  } catch (error) {
    console.error('Failed to get following:', error)
    return { success: false, following: [] }
  }
}

// Get user profile with stats
export async function getUserProfile(userId: string) {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        stats: true,
        _count: {
          select: {
            followers: true,
            following: true,
            picks: true,
          },
        },
      },
    })

    if (!profile) {
      return { success: false, error: 'User not found', profile: null }
    }

    // Get recent predictions
    const recentPredictions = await prisma.userPick.findMany({
      where: { userId },
      include: {
        fight: {
          include: {
            fighter1: { select: { id: true, name: true } },
            fighter2: { select: { id: true, name: true } },
            event: { select: { name: true, date: true } },
          },
        },
        predictedWinner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Check if current user is following
    const currentUser = await getOrCreateUser()
    let isFollowingUser = false
    
    if (currentUser) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: userId,
          },
        },
      })
      isFollowingUser = !!follow
    }

    return { 
      success: true, 
      profile: {
        ...profile,
        recentPredictions,
        isFollowing: isFollowingUser,
      } 
    }
  } catch (error) {
    console.error('Failed to get user profile:', error)
    return { success: false, error: 'Failed to get profile', profile: null }
  }
}

// Create a prediction group
export async function createPredictionGroup(name: string, description?: string, isPrivate: boolean = false) {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()

    const group = await prisma.predictionGroup.create({
      data: {
        name,
        description,
        isPrivate,
        inviteCode,
        createdById: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'admin',
          },
        },
      },
    })

    revalidatePath('/groups')
    
    return { success: true, group }
  } catch (error) {
    console.error('Failed to create group:', error)
    return { success: false, error: 'Failed to create group' }
  }
}

// Join a group with invite code
export async function joinGroup(inviteCode: string) {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const group = await prisma.predictionGroup.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
    })

    if (!group) {
      return { success: false, error: 'Invalid invite code' }
    }

    // Check if already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: user.id,
        },
      },
    })

    if (existingMember) {
      return { success: false, error: 'Already a member of this group' }
    }

    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: user.id,
        role: 'member',
      },
    })

    revalidatePath('/groups')
    revalidatePath(`/groups/${group.id}`)
    
    return { success: true, group }
  } catch (error) {
    console.error('Failed to join group:', error)
    return { success: false, error: 'Failed to join group' }
  }
}

// Get user's groups
export async function getUserGroups() {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, groups: [] }
    }

    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.id },
      include: {
        group: {
          include: {
            createdBy: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
            _count: {
              select: { members: true },
            },
          },
        },
      },
    })

    return { success: true, groups: memberships.map(m => m.group) }
  } catch (error) {
    console.error('Failed to get groups:', error)
    return { success: false, groups: [] }
  }
}

// Get group leaderboard (members ranked by accuracy)
export async function getGroupLeaderboard(groupId: string) {
  try {
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            stats: true,
          },
        },
      },
    })

    // Sort by accuracy
    const ranked = members
      .map(m => m.user)
      .filter((u: typeof members[0]['user']) => u.stats && u.stats.totalPicks >= 1)
      .sort((a, b) => (b.stats?.accuracy || 0) - (a.stats?.accuracy || 0))
      .map((u: typeof members[0]['user'], index: number) => ({ ...u, rank: index + 1 }))

    return { success: true, leaderboard: ranked }
  } catch (error) {
    console.error('Failed to get group leaderboard:', error)
    return { success: false, leaderboard: [] }
  }
}

// Get followed users' recent predictions (social feed)
export async function getSocialFeed(limit: number = 20) {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, feed: [] }
    }

    // Get users being followed
    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    })

    const followingIds = following.map(f => f.followingId)

    if (followingIds.length === 0) {
      return { success: true, feed: [] }
    }

    // Get recent predictions from followed users
    const predictions = await prisma.userPick.findMany({
      where: {
        userId: { in: followingIds },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        fight: {
          include: {
            fighter1: { select: { id: true, name: true } },
            fighter2: { select: { id: true, name: true } },
            event: { select: { name: true, date: true } },
          },
        },
        predictedWinner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return { success: true, feed: predictions }
  } catch (error) {
    console.error('Failed to get social feed:', error)
    return { success: false, feed: [] }
  }
}

// Get upcoming fights without predictions (for quick pick interface)
export async function getUpcomingFightsWithoutPredictions(limit: number = 10) {
  try {
    const user = await getOrCreateUser()
    if (!user) {
      return { success: false, error: 'User not authenticated', fights: [] }
    }

    const fights = await prisma.fight.findMany({
      where: {
        status: 'upcoming',
        picks: {
          none: {
            userId: user.id,
          },
        },
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
          },
        },
        fighter1: {
          select: {
            id: true,
            name: true,
            record: true,
          },
        },
        fighter2: {
          select: {
            id: true,
            name: true,
            record: true,
          },
        },
        oddsSnapshots: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [
        { event: { date: 'asc' } },
      ],
      take: limit,
    })

    return { success: true, fights }
  } catch (error) {
    console.error('Failed to get upcoming fights:', error)
    return { success: false, error: 'Failed to get fights', fights: [] }
  }
}
