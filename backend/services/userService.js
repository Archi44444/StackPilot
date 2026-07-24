import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from '../config/firebaseAdmin.js';

export async function syncUserProfile({ uid, email, displayName, photoURL }) {
  const reference = getDb().collection('users').doc(uid);
  const existing = await reference.get();
  const profile = {
    email: email ?? null,
    displayName: displayName ?? null,
    photoURL: photoURL ?? null,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (!existing.exists) {
    profile.createdAt = FieldValue.serverTimestamp();
    profile.settings = { model: 'gpt-4o-mini', temperature: 0.3, theme: 'dark' };
  }
  await reference.set(profile, { merge: true });
  const saved = await reference.get();
  return { id: saved.id, ...saved.data() };
}

export async function getUserProfile(uid) {
  const snapshot = await getDb().collection('users').doc(uid).get();
  return snapshot.exists ? { id: snapshot.id, ...snapshot.data() } : null;
}
