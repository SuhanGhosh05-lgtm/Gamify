ALTER TABLE "public"."User"
  ADD COLUMN "characterComplete" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "public"."Character" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "skinColor" TEXT NOT NULL,
  "hairStyle" TEXT NOT NULL,
  "hairColor" TEXT NOT NULL,
  "outfitStyle" TEXT NOT NULL,
  "outfitColor" TEXT NOT NULL,
  "accessory" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Character_userId_key" ON "public"."Character"("userId");
CREATE INDEX "Character_userId_idx" ON "public"."Character"("userId");

ALTER TABLE "public"."Character" ADD CONSTRAINT "Character_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
