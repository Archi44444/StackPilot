import { FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getDb } from '../config/firebaseAdmin.js';
import { deleteAllConversations } from './firestoreService.js';

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

async function deleteCollectionByUid(collectionName, uid) {
  const database = getDb();
  const query = database.collection(collectionName).where('uid', '==', uid);
  while (true) {
    const snapshots = await query.limit(300).get();
    if (snapshots.empty) break;
    const batch = database.batch();
    snapshots.docs.forEach((snapshot) => batch.delete(snapshot.ref));
    await batch.commit();
  }
}

export async function deleteUserAccount(uid) {
  const database = getDb();
  await Promise.all([
    deleteCollectionByUid('documents', uid),
    deleteCollectionByUid('prompts', uid),
    deleteCollectionByUid('repositories', uid),
    deleteCollectionByUid('documentation', uid),
  ]);
  await deleteAllConversations(uid);
  await database.collection('users').doc(uid).delete();
  await getAuth().deleteUser(uid);
}
