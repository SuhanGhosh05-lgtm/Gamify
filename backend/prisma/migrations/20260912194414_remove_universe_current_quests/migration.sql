/*
  Warnings:

  - You are about to drop the `UniverseCurrentQuest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UniverseCurrentQuest" DROP CONSTRAINT "UniverseCurrentQuest_questId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UniverseCurrentQuest" DROP CONSTRAINT "UniverseCurrentQuest_universeId_fkey";

-- DropTable
DROP TABLE "public"."UniverseCurrentQuest";
