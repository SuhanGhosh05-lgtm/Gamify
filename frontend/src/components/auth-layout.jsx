import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

export default function AuthLayout({ mode }) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { authenticate } = useAuth();
  const isLogin = mode === 'login';

  const handleGoogleSignIn = async () => {
    setMessage('');
    setIsLoading(true);
    try {
      const result = await authenticate(isLogin ? 'login' : 'register');
      setMessage(result.message);
      window.setTimeout(() => navigate('/'), 650);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to continue with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <Link className="auth-brand" to="/"><span aria-hidden="true">✦</span> Life RPG</Link>
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="eyebrow">{isLogin ? 'Welcome back, adventurer' : 'Begin your adventure'}</p>
        <h1 id="auth-title">{isLogin ? 'Enter your world' : 'Create your hero'}</h1>
        <p className="auth-description">
          {isLogin ? 'Pick up where you left off and continue your quest.' : 'Start turning everyday progress into an epic journey.'}
        </p>
        <button className="google-button" type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
          <span className="google-icon" aria-hidden="true">G</span>
          {isLoading ? 'Opening Google…' : 'Continue with Google'}
        </button>
        {message && <p className="auth-message" role="status">{message}</p>}
        <p className="auth-switch">
          {isLogin ? 'New to the quest? ' : 'Already have an account? '}
          <Link to={isLogin ? '/register' : '/login'}>{isLogin ? 'Register' : 'Enter'}</Link>
        </p>
        <Link className="back-link" to="/">← Back to dashboard</Link>
      </section>
    </main>
  );
}
