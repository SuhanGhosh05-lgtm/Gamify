import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import CharacterPreview from '../components/character-preview';
import { useAuth } from '../context/auth-context';
import { authenticatedRequest } from '../services/api';

const defaults = { name: '', gender: 'male', skinColor: 'medium', hairStyle: 'short', hairColor: 'brown', outfitStyle: 'casual', outfitColor: 'blue', accessory: 'none' };

export default function Character() {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(defaults);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!firebaseUser) return;
    authenticatedRequest('/api/character/status', firebaseUser).then((result) => {
      if (result.characterComplete) { navigate('/', { replace: true }); return; }
      setOptions(result.options);
      if (result.character) setCharacter(result.character);
    }).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [firebaseUser, navigate]);
  const update = (field, value) => setCharacter((previous) => ({ ...previous, [field]: value }));
  const save = async (event) => {
    event.preventDefault(); if (saving) return;
    setSaving(true); setError('');
    try {
      await authenticatedRequest('/api/character', firebaseUser, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(character) });
      setSaved(true); window.setTimeout(() => navigate('/', { replace: true }), 700);
    } catch (requestError) { setError(requestError.message); setSaving(false); }
  };
  if (!firebaseUser) return <Navigate to="/login" replace />;
  return <div className="page dashboard-page"><Navbar /><main className="character-view"><p className="eyebrow">Your adventurer</p><h1>Create your character.</h1>
    {loading ? <p className="page-loader">Preparing your character…</p> : <form className="character-form" onSubmit={save}>
      <CharacterPreview character={character} />
      <section className="character-controls"><label>Character name<input className="name-input" value={character.name} onChange={(event) => update('name', event.target.value)} disabled={saving} /></label>
        {Object.entries(options || {}).map(([field, values]) => <label key={field}>{field.replace(/([A-Z])/g, ' $1')}<select value={character[field]} onChange={(event) => update(field, event.target.value)} disabled={saving}>{values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>)}
        {error && <p className="universe-error" role="alert">{error}</p>}
        {saved ? <p className="character-success">Your character is ready!</p> : <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save character'} <span aria-hidden="true">→</span></button>}
      </section>
    </form>}
  </main></div>;
}
