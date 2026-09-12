import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/navbar';
import { useAuth } from '../context/auth-context';
import { authenticatedRequest } from '../services/api';

function Quest({ quest, onComplete }) {
  return <li className={`quest-item${quest.completed ? ' complete' : ''}`}>
    <div><strong>{quest.title}</strong>{quest.description && <p>{quest.description}</p>}<small>{quest.xpReward} XP{quest.difficulty ? ` · ${quest.difficulty}` : ''}</small></div>
    <div className="quest-actions">
      {!quest.completed && <button onClick={() => onComplete(quest.id)}>Complete</button>}
      {quest.completed && <span>Completed</span>}
    </div>
  </li>;
}

export default function Universe() {
  const { firebaseUser } = useAuth();
  const { state } = useLocation();
  const [universe, setUniverse] = useState(state?.universe || null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!firebaseUser) return;
    setLoading(true); setError('');
    try { setUniverse((await authenticatedRequest('/api/universe', firebaseUser)).universe); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [firebaseUser]);
  useEffect(() => { if (!state?.universe) load(); else setLoading(false); }, [load, state?.universe]);
  const complete = async (id) => {
    try { await authenticatedRequest(`/api/universe/quests/${id}/complete`, firebaseUser, { method: 'POST' }); await load(); }
    catch (requestError) { setError(requestError.message); }
  };
  if (!firebaseUser) return <div className="page dashboard-page"><Navbar /><main className="dashboard-error"><h1>Enter your journey first.</h1><Link to="/login">Log in</Link></main></div>;
  return <div className="page dashboard-page"><Navbar /><main className="universe-view">
    <p className="eyebrow">Your universe</p><h1>{universe?.universeName || 'Build your world.'}</h1>
    {loading && <p className="page-loader">Loading your universe…</p>}
    {error && <p className="universe-error">{error}</p>}
    {!loading && universe && <>
      {universe.villages.length ? universe.villages.map((village) => <section className="village-card" key={village.id}><h2>{village.villageName || village.name}</h2>{village.description && <p>{village.description}</p>}
        {village.wards.length ? village.wards.map((ward) => <div className="ward-card" key={ward.id}><h3>{ward.wardName || ward.name}</h3>{ward.description && <p>{ward.description}</p>}
          {ward.houses.length ? ward.houses.map((house) => <div className="house-card" key={house.id}><h4>{house.houseName || house.name}</h4>{house.description && <p>{house.description}</p>}
            {house.currentQuests.length ? <ul>{house.currentQuests.map((quest) => <Quest key={quest.id} quest={quest} onComplete={complete} />)}</ul> : <p className="empty-note">No quests in this house.</p>}
          </div>) : <p className="empty-note">No houses in this ward.</p>}</div>) : <p className="empty-note">No wards in this village.</p>}</section>) : <section className="village-card empty-state"><h2>Your universe is ready</h2><p>There are no villages yet. Add your first village through the Universe API to begin shaping your world.</p></section>}
    </>}
  </main></div>;
}
