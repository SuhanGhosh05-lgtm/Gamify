CREATE UNIQUE INDEX "Village_universeId_name_key" ON "public"."Village"("universeId", "name");
CREATE UNIQUE INDEX "Ward_villageId_name_key" ON "public"."Ward"("villageId", "name");
CREATE UNIQUE INDEX "House_wardId_name_key" ON "public"."House"("wardId", "name");
