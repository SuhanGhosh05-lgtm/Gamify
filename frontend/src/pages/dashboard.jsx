import { useEffect, useState } from 'react';
import Hero from '../components/hero';
import Navbar from '../components/navbar';
import UserStats from '../components/UserStats';
import { useAuth } from '../context/auth-context';

export default function Dashboard() {
  const { firebaseUser, gameData, loading, fetchStats } = useAuth();
  const [stats, setStats] = useState(gameData);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');
  const [exploreMessage, setExploreMessage] = useState('');

  useEffect(() => {
    if (!firebaseUser) { setStats(null); return; }
    setStatsLoading(true);
    fetchStats().then(setStats).catch((fetchError) => setError(fetchError.message)).finally(() => setStatsLoading(false));
  }, [firebaseUser]);

  if (loading) return <div className="page dashboard-page"><Navbar /><p className="page-loader">Loading your journey…</p></div>;

  const exploreStats = () => document.getElementById('journey-stats')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="page dashboard-page">
      <Navbar />
      {firebaseUser && statsLoading && <p className="page-loader">Restoring your universe…</p>}
      {firebaseUser && stats && !statsLoading && <>
        <Hero onExplore={exploreStats} playerName={stats.user.displayName || 'Adventurer'} />
        <UserStats data={stats} />
      </>}
      {firebaseUser && error && <main className="dashboard-error"><h1>Your journey needs attention.</h1><p>{error}</p></main>}
      {!firebaseUser && <Hero onExplore={() => setExploreMessage('Please enter or register to start exploring your journey.')} exploreMessage={exploreMessage} />}
    </div>
  );
}
