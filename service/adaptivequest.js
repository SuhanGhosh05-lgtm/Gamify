export function generateUniverse(preferences) {
  const interests = preferences.interests.split(',').map((item) => item.trim()).filter(Boolean);
  return { title: `${preferences.primaryGoal} Journey`, interests, regions: interests.map((name, index) => ({ id: `region-${index + 1}`, name, unlocked: index === 0, skills: [] })), tasks: [], quests: [], progress: { xp: 0, coins: 0, streak: 0, momentum: 0, achievements: [] }, createdAt: new Date().toISOString() };
}
