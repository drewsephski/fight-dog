/*
  Warnings:

  - Added the required column `updatedAt` to the `UserPick` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "displayName" TEXT;

-- AlterTable
ALTER TABLE "UserPick" ADD COLUMN     "beatTheOdds" BOOLEAN,
ADD COLUMN     "isCorrect" BOOLEAN,
ADD COLUMN     "predictedMethod" TEXT,
ADD COLUMN     "predictedRound" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "confidence" SET DEFAULT 3;

-- CreateTable
CREATE TABLE "UserStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalPicks" INTEGER NOT NULL DEFAULT 0,
    "correctPicks" INTEGER NOT NULL DEFAULT 0,
    "incorrectPicks" INTEGER NOT NULL DEFAULT 0,
    "pushPicks" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "underdogPicks" INTEGER NOT NULL DEFAULT 0,
    "underdogWins" INTEGER NOT NULL DEFAULT 0,
    "koTkoPicks" INTEGER NOT NULL DEFAULT 0,
    "koTkoWins" INTEGER NOT NULL DEFAULT 0,
    "submissionPicks" INTEGER NOT NULL DEFAULT 0,
    "submissionWins" INTEGER NOT NULL DEFAULT 0,
    "decisionPicks" INTEGER NOT NULL DEFAULT 0,
    "decisionWins" INTEGER NOT NULL DEFAULT 0,
    "methodAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roundAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "tier" TEXT NOT NULL DEFAULT 'Bronze',
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictionComment" (
    "id" TEXT NOT NULL,
    "pickId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PredictionComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictionGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "inviteCode" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PredictionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserStats_userId_key" ON "UserStats"("userId");

-- CreateIndex
CREATE INDEX "UserStats_rank_idx" ON "UserStats"("rank");

-- CreateIndex
CREATE INDEX "UserStats_tier_idx" ON "UserStats"("tier");

-- CreateIndex
CREATE INDEX "UserStats_accuracy_idx" ON "UserStats"("accuracy");

-- CreateIndex
CREATE INDEX "Follow_followerId_idx" ON "Follow"("followerId");

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "PredictionComment_pickId_idx" ON "PredictionComment"("pickId");

-- CreateIndex
CREATE INDEX "PredictionComment_userId_idx" ON "PredictionComment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PredictionGroup_inviteCode_key" ON "PredictionGroup"("inviteCode");

-- CreateIndex
CREATE INDEX "PredictionGroup_inviteCode_idx" ON "PredictionGroup"("inviteCode");

-- CreateIndex
CREATE INDEX "GroupMember_groupId_idx" ON "GroupMember"("groupId");

-- CreateIndex
CREATE INDEX "GroupMember_userId_idx" ON "GroupMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");

-- CreateIndex
CREATE INDEX "UserPick_result_idx" ON "UserPick"("result");

-- AddForeignKey
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionComment" ADD CONSTRAINT "PredictionComment_pickId_fkey" FOREIGN KEY ("pickId") REFERENCES "UserPick"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredictionGroup" ADD CONSTRAINT "PredictionGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PredictionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
