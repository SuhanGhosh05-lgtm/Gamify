import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithGoogle, signOutUser } from '../services/firebase';
import { authenticatedRequest } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => onAuthStateChanged((user) => {
    setFirebaseUser(user);
    if (!user) setGameData(null);
    setLoading(false);
  }), []);

  const authenticate = async (action) => {
    setError('');
    try {
      const user = await signInWithGoogle();
      const result = await authenticatedRequest(`/api/auth/${action}`, user, { method: 'POST' });
      const data = { user: result.user, progression: result.progression, universe: result.universe };
      setGameData(data);
      return { ...result, ...data };
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to continue.');
      throw authError;
    }
  };

  const fetchStats = async () => {
    if (!firebaseUser) return null;
    const result = await authenticatedRequest('/api/users/me/stats', firebaseUser);
    const data = { user: (({ progression, universe, success, ...user }) => user)(result), progression: result.progression, universe: result.universe };
    setGameData(data);
    return data;
  };

  const logout = async () => {
    await signOutUser();
    setGameData(null);
  };

  const value = useMemo(() => ({ firebaseUser, gameData, loading, error, authenticate, fetchStats, logout }), [firebaseUser, gameData, loading, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
