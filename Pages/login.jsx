import { useState } from 'react';
import { signInWithGoogle } from './service/auth';
export default function Login({ configurationError }) {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const signIn = async () => { setBusy(true); setError(''); try { await signInWithGoogle(); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <main><h1>Life RPG</h1><p>Turn your real-life goals into an adventure.</p><button onClick={signIn} disabled={busy || Boolean(configurationError)}>{busy ? 'Opening Google…' : 'Continue with Google'}</button>{(error || configurationError) && <p role="alert">{error || configurationError}</p>}</main>;
}
