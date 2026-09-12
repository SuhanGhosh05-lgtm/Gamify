import { useState } from 'react';
import CharacterPreview from './character-preview';

const entries = (progression, universe) => [
  ['Level', progression.currentLevel], ['Total XP', progression.totalXp],
  ['Current streak', progression.currentStreak], ['Longest streak', progression.longestStreak],
  ['Tasks completed', progression.totalTasksCompleted], ['Tasks created', progression.totalTasksCreated],
  ['Quests completed', universe.questsCompleted],
  ['Achievements', universe.achievementsUnlocked],
];

export default function UserStats({ data, onEnterUniverse }) {
  const { user, progression, universe } = data;
  const [statsOpen, setStatsOpen] = useState(false);
  const stats = entries(progression, universe);
  return (
    <main className="stats-view" id="journey-stats" tabIndex="-1">
      <p className="eyebrow">Universe restored</p>
      <h1>Welcome back, {user.displayName || 'Adventurer'}.</h1>
      <p className="stats-email">{user.email || 'Your Life RPG journey continues.'}</p>
      <section className="region-card">
        <p className="eyebrow">Current universe</p>
        <h2>{universe.currentRegion}</h2>
        <p>Explore your villages and continue building your next adventure.</p>
        <button className="enter-universe-button" type="button" onClick={onEnterUniverse}>Enter Universe <span aria-hidden="true">→</span></button>
      </section>
      {user.character ? <section className="character-stage" aria-labelledby="character-stage-title">
        <div><p className="eyebrow">Your adventurer</p><h2 id="character-stage-title">{user.character.name}</h2><p>Tap your character to view your journey stats.</p></div>
        <button className="character-button" type="button" onClick={() => setStatsOpen(true)} aria-haspopup="dialog" aria-label={`View ${user.character.name}'s journey stats`}>
          <CharacterPreview character={user.character} />
          <span className="character-button-label">View stats <span aria-hidden="true">↗</span></span>
        </button>
      </section> : null}
      {statsOpen && <div className="stats-modal-backdrop" role="presentation" onMouseDown={() => setStatsOpen(false)}>
        <section className="stats-modal" role="dialog" aria-modal="true" aria-labelledby="stats-modal-title" onMouseDown={(event) => event.stopPropagation()}>
          <button className="stats-modal-close" type="button" onClick={() => setStatsOpen(false)} aria-label="Close stats">×</button>
          <p className="eyebrow">{user.character.name}'s journey</p><h2 id="stats-modal-title">Your adventure at a glance</h2>
          <div className="stat-grid" aria-label="Your Life RPG statistics">
            {stats.map(([label, value]) => <article className="stat-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}
          </div>
        </section>
      </div>}
    </main>
  );
}
