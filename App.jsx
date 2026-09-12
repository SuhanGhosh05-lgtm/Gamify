import { useEffect, useState } from 'react';
import Login from './Pages/login';
import Onboarding from './Pages/universe';
import Dashboard from './Pages/dashboard';
import { firebaseConfigurationError } from './Firebase';
import { logout, observeAuth } from './Pages/service/auth';
import { loadPlayer, recordLogin, saveNewPlayer } from './Pages/service/recovery';
export default function App() {
  const [status, setStatus] = useState('loading'); const [user, setUser] = useState(null); const [player, setPlayer] = useState(null); const [error, setError] = useState('');
  useEffect(() => observeAuth(async (nextUser, authError) => { setError(authError || ''); setUser(nextUser); if (!nextUser) return setStatus('signed-out'); setStatus('loading'); try { const savedPlayer = await loadPlayer(nextUser.uid); if (savedPlayer) { setPlayer(savedPlayer); setStatus('ready'); recordLogin(nextUser.uid); } else setStatus('onboarding'); } catch (err) { setError(err.message); setStatus('error'); } }), []);
  const completeOnboarding = async (preferences, universe) => { await saveNewPlayer(user, preferences, universe); setPlayer({ profile: { displayName: user.displayName, preferences }, universe }); setStatus('ready'); };
  if (status === 'loading') return <main aria-busy="true">Loading your adventure…</main>;
  if (status === 'signed-out') return <Login configurationError={firebaseConfigurationError} />;
  if (status === 'error') return <main><p role="alert">{error}</p><button onClick={() => window.location.reload()}>Try again</button></main>;
  if (status === 'onboarding') return <Onboarding user={user} onComplete={completeOnboarding} />;
  return <Dashboard player={player} onLogout={logout} />;
}
