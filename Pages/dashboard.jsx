export default function Dashboard({ player, onLogout }) {
  const { profile, universe } = player;
  return <main><header><h1>{universe.title}</h1><button onClick={onLogout}>Log out</button></header><p>Welcome back, {profile.displayName || 'Adventurer'}.</p><p>XP: {universe.progress?.xp ?? 0} · Coins: {universe.progress?.coins ?? 0} · Streak: {universe.progress?.streak ?? 0}</p><h2>Regions</h2><ul>{(universe.regions || []).map((region) => <li key={region.id}>{region.name} {region.unlocked ? '— unlocked' : '— locked'}</li>)}</ul></main>;
}
