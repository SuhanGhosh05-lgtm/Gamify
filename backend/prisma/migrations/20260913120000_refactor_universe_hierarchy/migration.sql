-- The former "currentQuest" field was free text, not a Quest foreign key. It
-- cannot be safely converted into an assignment, so it is deliberately removed.
ALTER TABLE "public"."Universe"
  DROP COLUMN "currentQuest",
  DROP COLUMN "regionsUnlocked",
  DROP COLUMN "currentUniverseState";

CREATE TABLE "public"."Village" (
  "id" TEXT NOT NULL,
  "universeId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."Ward" (
  "id" TEXT NOT NULL,
  "villageId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Ward_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."House" (
  "id" TEXT NOT NULL,
  "wardId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."Quest" (
  "id" TEXT NOT NULL,
  "houseId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "difficulty" TEXT,
  "estimatedMinutes" INTEGER,
  "xpReward" INTEGER NOT NULL DEFAULT 0,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."UniverseCurrentQuest" (
  "universeId" TEXT NOT NULL,
  "questId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UniverseCurrentQuest_pkey" PRIMARY KEY ("universeId", "questId")
);

CREATE INDEX "Universe_userId_idx" ON "public"."Universe"("userId");
CREATE INDEX "Village_universeId_idx" ON "public"."Village"("universeId");
CREATE INDEX "Ward_villageId_idx" ON "public"."Ward"("villageId");
CREATE INDEX "House_wardId_idx" ON "public"."House"("wardId");
CREATE INDEX "Quest_houseId_idx" ON "public"."Quest"("houseId");
CREATE UNIQUE INDEX "UniverseCurrentQuest_questId_key" ON "public"."UniverseCurrentQuest"("questId");
CREATE INDEX "UniverseCurrentQuest_questId_idx" ON "public"."UniverseCurrentQuest"("questId");

ALTER TABLE "public"."Village" ADD CONSTRAINT "Village_universeId_fkey"
  FOREIGN KEY ("universeId") REFERENCES "public"."Universe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."Ward" ADD CONSTRAINT "Ward_villageId_fkey"
  FOREIGN KEY ("villageId") REFERENCES "public"."Village"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."House" ADD CONSTRAINT "House_wardId_fkey"
  FOREIGN KEY ("wardId") REFERENCES "public"."Ward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."Quest" ADD CONSTRAINT "Quest_houseId_fkey"
  FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."UniverseCurrentQuest" ADD CONSTRAINT "UniverseCurrentQuest_universeId_fkey"
  FOREIGN KEY ("universeId") REFERENCES "public"."Universe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."UniverseCurrentQuest" ADD CONSTRAINT "UniverseCurrentQuest_questId_fkey"
  FOREIGN KEY ("questId") REFERENCES "public"."Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
