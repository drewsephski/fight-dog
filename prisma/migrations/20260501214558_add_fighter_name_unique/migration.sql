/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `FighterCache` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FighterCache_name_key" ON "FighterCache"("name");
