import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, firebaseConfigurationError, googleProvider } from '../../Firebase';

export function observeAuth(callback) {
  if (!auth) { callback(null, firebaseConfigurationError); return () => {}; }
  return onAuthStateChanged(auth, (user) => callback(user, null), (error) => {
    console.error('Firebase authentication state error.', error);
    callback(null, 'We could not restore your sign-in. Please try again.');
  });
}
export async function signInWithGoogle() {
  if (!auth || !googleProvider) throw new Error(firebaseConfigurationError);
  try { return await signInWithPopup(auth, googleProvider); } catch (error) {
    console.error('Google sign-in failed.', error);
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') throw new Error('Google sign-in was cancelled.');
    throw new Error('Unable to sign in with Google. Please try again.');
  }
}
export async function logout() {
  if (!auth) return;
  try { await signOut(auth); } catch (error) { console.error('Sign-out failed.', error); throw new Error('Unable to sign out. Please try again.'); }
}
