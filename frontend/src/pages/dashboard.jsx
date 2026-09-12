import { useEffect, useState } from 'react';
import Hero from '../components/hero';
import Navbar from '../components/navbar';
import UserStats from '../components/UserStats';
import { useAuth } from '../context/auth-context';
import { authenticatedRequest } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { firebaseUser, gameData, loading, fetchStats } = useAuth();
  const [stats, setStats] = useState(gameData);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');
  const [exploreMessage, setExploreMessage] = useState('');
  const [enteringUniverse, setEnteringUniverse] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!firebaseUser) { setStats(null); return; }
    setStatsLoading(true);
    fetchStats().then(setStats).catch((fetchError) => setError(fetchError.message)).finally(() => setStatsLoading(false));
  }, [firebaseUser]);

  if (loading) return <div className="page dashboard-page"><Navbar /><p className="page-loader">Loading your journey…</p></div>;

  const exploreStats = () => document.getElementById('journey-stats')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const requireCharacter = async () => {
    const result = await authenticatedRequest('/api/character/status', firebaseUser);
    if (!result.characterComplete) { navigate('/character'); return false; }
    return true;
  };
  const exploreJourney = async () => {
    try { if (await requireCharacter()) exploreStats(); }
    catch (requestError) { setError(requestError.message); }
  };
  const enterUniverse = async () => {
    if (!firebaseUser || enteringUniverse) return;
    setEnteringUniverse(true); setError('');
    try {
      if (!await requireCharacter()) return;
      const result = await authenticatedRequest('/api/universe/entry', firebaseUser);
      navigate(result.onboardingCompleted ? '/universe' : '/onboarding', { state: result.onboardingCompleted ? { universe: result.universe } : { taxonomy: result.taxonomy } });
    } catch (requestError) { setError(requestError.message); }
    finally { setEnteringUniverse(false); }
  };

  return (
    <div className="page dashboard-page">
      <Navbar />
      {firebaseUser && statsLoading && <p className="page-loader">Restoring your universe…</p>}
      {firebaseUser && stats && !statsLoading && <>
        <Hero onExplore={exploreJourney} playerName={stats.user.displayName || 'Adventurer'} />
        <UserStats data={stats} onEnterUniverse={enterUniverse} />
      </>}
      {firebaseUser && error && <main className="dashboard-error"><h1>Your journey needs attention.</h1><p>{error}</p></main>}
      {!firebaseUser && <Hero onExplore={() => setExploreMessage('Please enter or register to start exploring your journey.')} exploreMessage={exploreMessage} />}
    </div>
  );
}
