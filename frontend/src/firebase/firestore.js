import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { firebaseDb } from './config.js';

function requireDb() {
  if (!firebaseDb) throw new Error('Firebase Firestore is not configured.');
  return firebaseDb;
}

function subscribe(source, onChange, onError) {
  return onSnapshot(source, (snapshot) => onChange(snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))), onError);
}

export function subscribeToConversations(uid, onChange, onError) {
  const database = requireDb();
  return subscribe(query(collection(database, 'conversations'), where('uid', '==', uid), orderBy('updatedAt', 'desc'), limit(50)), onChange, onError);
}

export function subscribeToMessages(uid, conversationId, onChange, onError) {
  const database = requireDb();
  return subscribe(query(collection(database, 'messages'), where('uid', '==', uid), where('conversationId', '==', conversationId), orderBy('createdAt', 'asc'), limit(100)), onChange, onError);
}

export function subscribeToPrompts(uid, onChange, onError) {
  const database = requireDb();
  return subscribe(query(collection(database, 'prompts'), where('uid', '==', uid), orderBy('updatedAt', 'desc'), limit(100)), onChange, onError);
}
