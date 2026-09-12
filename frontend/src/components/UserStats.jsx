const entries = (progression, universe) => [
  ['Level', progression.currentLevel], ['Total XP', progression.totalXp],
  ['Current streak', progression.currentStreak], ['Longest streak', progression.longestStreak],
  ['Tasks completed', progression.totalTasksCompleted], ['Tasks created', progression.totalTasksCreated],
  ['Regions unlocked', universe.regionsUnlocked], ['Quests completed', universe.questsCompleted],
  ['Achievements', universe.achievementsUnlocked],
];

export default function UserStats({ data }) {
  const { user, progression, universe } = data;
  return (
    <main className="stats-view" id="journey-stats" tabIndex="-1">
      <p className="eyebrow">Universe restored</p>
      <h1>Welcome back, {user.displayName || 'Adventurer'}.</h1>
      <p className="stats-email">{user.email || 'Your Life RPG journey continues.'}</p>
      <section className="region-card">
        <p className="eyebrow">Current universe</p>
        <h2>{universe.currentRegion}</h2>
        <p>{universe.currentQuest ? `Current quest: ${universe.currentQuest}` : 'No active quest. Your next adventure awaits.'}</p>
        <button className="enter-universe-button" type="button">Enter Universe <span aria-hidden="true">→</span></button>
      </section>
      <section className="stat-grid" aria-label="Your Life RPG statistics">
        {entries(progression, universe).map(([label, value]) => <article className="stat-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}
      </section>
    </main>
  );
}
