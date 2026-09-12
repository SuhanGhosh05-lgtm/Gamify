import { doc, getDoc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../Firebase';
const userRef = (uid) => doc(db, 'users', uid);
const universeRef = (uid) => doc(db, 'users', uid, 'game', 'universe');
export async function loadPlayer(uid) {
  try {
    const profileSnapshot = await getDoc(userRef(uid));
    if (!profileSnapshot.exists() || !profileSnapshot.data().onboardingCompleted) return null;
    const universeSnapshot = await getDoc(universeRef(uid));
    if (!universeSnapshot.exists()) throw new Error('Your saved universe is unavailable. Please contact support before restarting onboarding.');
    return { profile: profileSnapshot.data(), universe: universeSnapshot.data() };
  } catch (error) { console.error('Could not load player data.', error); throw new Error('We could not load your saved Life RPG data. Please try again.'); }
}
export async function saveNewPlayer(user, preferences, universe) {
  try {
    const batch = writeBatch(db);
    batch.set(userRef(user.uid), { email: user.email ?? null, displayName: user.displayName ?? 'Adventurer', photoURL: user.photoURL ?? null, createdAt: serverTimestamp(), lastLoginAt: serverTimestamp(), onboardingCompleted: true, preferences }, { merge: true });
    batch.set(universeRef(user.uid), { ...universe, updatedAt: serverTimestamp() });
    await batch.commit();
  } catch (error) { console.error('Could not save new player data.', error); throw new Error('We could not save your universe. Please try again.'); }
}
export async function recordLogin(uid) { try { await updateDoc(userRef(uid), { lastLoginAt: serverTimestamp() }); } catch (error) { console.error('Could not update last login.', error); } }
