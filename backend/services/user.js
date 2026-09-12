import { getUserWithGameData } from './auth.js';

export async function getUserDashboardStats(firebaseUid) {
  const user = await getUserWithGameData(firebaseUid);
  if (!user) return null;

  const { progression, universe, ...profile } = user;
  return {
    ...profile,
    progression: progression && {
      totalXp: progression.totalXp, currentLevel: progression.currentLevel,
      totalTasksCompleted: progression.totalTasksCompleted, totalTasksCreated: progression.totalTasksCreated,
      currentStreak: progression.currentStreak, longestStreak: progression.longestStreak,
      strength: progression.strength, intelligence: progression.intelligence,
      discipline: progression.discipline, vitality: progression.vitality, creativity: progression.creativity,
    },
    universe: universe && {
      id: universe.id,
      currentRegion: universe.currentRegion,
      questsCompleted: universe.questsCompleted,
      achievementsUnlocked: universe.achievementsUnlocked,
    },
  };
}
