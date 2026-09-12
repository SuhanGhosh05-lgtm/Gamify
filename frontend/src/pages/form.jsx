import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import { useAuth } from '../context/auth-context';
import { authenticatedRequest } from '../services/api';

export default function OnboardingForm() {
  const { firebaseUser } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [taxonomy, setTaxonomy] = useState(state?.taxonomy || []);
  const [selectedInterests, setSelectedInterests] = useState(new Set());
  const [selectedSubinterests, setSelectedSubinterests] = useState(new Set());
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [labels, setLabels] = useState({ universeName: '' });
  const [step, setStep] = useState('choices');
  const [loading, setLoading] = useState(!state?.taxonomy);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!firebaseUser || state?.taxonomy) return;
    authenticatedRequest('/api/universe/entry', firebaseUser).then((result) => {
      if (result.characterRequired) { navigate('/character', { replace: true }); return; }
      if (result.onboardingCompleted) navigate('/universe', { replace: true, state: { universe: result.universe } });
      else setTaxonomy(result.taxonomy);
    }).catch((requestError) => {
      if (requestError.code === 'CHARACTER_REQUIRED') navigate('/character', { replace: true });
      else setError(requestError.message);
    }).finally(() => setLoading(false));
  }, [firebaseUser, navigate, state?.taxonomy]);

  const toggle = (setter, key) => setter((previous) => {
    const next = new Set(previous); next.has(key) ? next.delete(key) : next.add(key); return next;
  });
  const updateLabel = (key, value) => setLabels((previous) => ({ ...previous, [key]: value }));
  const selections = useMemo(() => taxonomy.filter(({ name }) => selectedInterests.has(name)).map((interest) => ({
    interest: interest.name,
    villageName: labels[`village/${interest.name}`] || '',
    subinterests: interest.subinterests.filter((subinterest) => selectedSubinterests.has(`${interest.name}/${subinterest.name}`)).map((subinterest) => ({
      name: subinterest.name,
      wardName: labels[`ward/${interest.name}/${subinterest.name}`] || '',
      topics: subinterest.topics.filter((topic) => selectedTopics.has(`${interest.name}/${subinterest.name}/${topic}`)).map((topic) => ({
        name: topic, houseName: labels[`house/${interest.name}/${subinterest.name}/${topic}`] || '',
      })),
    })),
  })), [taxonomy, selectedInterests, selectedSubinterests, selectedTopics, labels]);
  const selectionError = () => {
    if (!selections.length) return 'Choose at least one interest to begin creating your Universe.';
    const interest = selections.find((item) => !item.subinterests.length);
    if (interest) return `Choose at least one subinterest for ${interest.interest}.`;
    const subinterest = selections.flatMap((item) => item.subinterests).find((item) => !item.topics.length);
    return subinterest && `Choose at least one topic for ${subinterest.name}.`;
  };
  const next = () => {
    const message = selectionError();
    if (message) { setError(message); return; }
    setError(''); setStep('names');
  };
  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true); setError('');
    try {
      const result = await authenticatedRequest('/api/universe/onboarding', firebaseUser, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ selections, universeName: labels.universeName }),
      });
      navigate('/universe', { replace: true, state: { universe: result.universe } });
    } catch (requestError) { setError(requestError.message); } finally { setSubmitting(false); }
  };
  if (!firebaseUser) return <Navigate to="/login" replace />;
  return <div className="page dashboard-page"><Navbar /><main className="onboarding-view"><p className="eyebrow">Shape your universe</p>
    {loading ? <p className="page-loader">Loading your choices…</p> : <form onSubmit={submit}>
      {step === 'choices' ? <><h1>What calls to you?</h1>{taxonomy.map((interest) => <section className="taxonomy-card" key={interest.name}>
        <label><input type="checkbox" checked={selectedInterests.has(interest.name)} onChange={() => toggle(setSelectedInterests, interest.name)} /> {interest.name}</label>
        {selectedInterests.has(interest.name) && <div className="taxonomy-children">{interest.subinterests.map((subinterest) => { const subKey = `${interest.name}/${subinterest.name}`; return <div key={subKey}>
          <label><input type="checkbox" checked={selectedSubinterests.has(subKey)} onChange={() => toggle(setSelectedSubinterests, subKey)} /> {subinterest.name}</label>
          {selectedSubinterests.has(subKey) && <div className="topic-list">{subinterest.topics.map((topic) => { const topicKey = `${subKey}/${topic}`; return <label key={topicKey}><input type="checkbox" checked={selectedTopics.has(topicKey)} onChange={() => toggle(setSelectedTopics, topicKey)} /> {topic}</label>; })}</div>}
        </div>; })}</div>}
      </section>)}<button className="primary-button" type="button" onClick={next}>Next <span aria-hidden="true">→</span></button></> : <><h1>Name your world.</h1>
        <section className="taxonomy-card"><label>Universe name<input className="name-input" value={labels.universeName} onChange={(event) => updateLabel('universeName', event.target.value)} placeholder="My Universe" disabled={submitting} /></label></section>
        {selections.map((interest) => <section className="taxonomy-card" key={interest.interest}><label>Village name for {interest.interest}<input className="name-input" value={interest.villageName} onChange={(event) => updateLabel(`village/${interest.interest}`, event.target.value)} placeholder={`${interest.interest} Village`} disabled={submitting} /></label>
          {interest.subinterests.map((subinterest) => <div className="taxonomy-children" key={subinterest.name}><label>Ward name for {subinterest.name}<input className="name-input" value={subinterest.wardName} onChange={(event) => updateLabel(`ward/${interest.interest}/${subinterest.name}`, event.target.value)} placeholder={`${subinterest.name} Ward`} disabled={submitting} /></label>
            {subinterest.topics.map((topic) => <label className="name-topic" key={topic.name}>House name for {topic.name}<input className="name-input" value={topic.houseName} onChange={(event) => updateLabel(`house/${interest.interest}/${subinterest.name}/${topic.name}`, event.target.value)} placeholder={`${topic.name} House`} disabled={submitting} /></label>)}
          </div>)}</section>)}
        <button className="back-form-button" type="button" onClick={() => setStep('choices')} disabled={submitting}>Back</button><button className="primary-button" type="submit" disabled={submitting}>{submitting ? <><span className="loading-spinner" /> Creating your Universe…</> : <>Create your Universe <span aria-hidden="true">→</span></>}</button></>}
      {error && <p className="universe-error" role="alert">{error}</p>}
    </form>}
  </main></div>;
}
