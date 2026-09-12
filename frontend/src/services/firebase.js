import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, onAuthStateChanged as observeAuthState, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = Object.values(firebaseConfig).every(Boolean);
const app = isConfigured ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const googleProvider = auth ? new GoogleAuthProvider() : null;

export function onAuthStateChanged(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return observeAuthState(auth, callback);
}

export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    throw new Error('Google sign-in is not configured yet. Please contact the app administrator.');
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      throw new Error('Google sign-in was cancelled. Please try again when you are ready.');
    }
    throw new Error('Google sign-in could not be completed. Please try again.');
  }
}

export function signOutUser() { return auth ? signOut(auth) : Promise.resolve(); }
