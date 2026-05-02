-- AlterTable
ALTER TABLE "Fight" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Fight_position_idx" ON "Fight"("position");
