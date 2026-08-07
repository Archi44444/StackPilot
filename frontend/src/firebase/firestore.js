import { collection, limit, onSnapshot, query, where } from 'firebase/firestore';
import { firebaseDb } from './config.js';

function requireDb() {
  if (!firebaseDb) throw new Error('Firebase Firestore is not configured.');
  return firebaseDb;
}

function dateValue(value) {
  if (value?.toMillis instanceof Function) return value.toMillis();
  if (value?.seconds) return value.seconds * 1000;
  return value ? new Date(value).getTime() : 0;
}

function subscribe(source, onChange, onError, transform = (items) => items) {
  return onSnapshot(source, (snapshot) => {
    const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
    onChange(transform(items));
  }, onError);
}

export function subscribeToConversations(uid, onChange, onError) {
  const database = requireDb();
  // Sorting in the browser keeps history available while a new Firebase project
  // is still building optional composite indexes.
  return subscribe(query(collection(database, 'conversations'), where('uid', '==', uid), limit(100)), onChange, onError,
    (items) => items.sort((left, right) => dateValue(right.updatedAt) - dateValue(left.updatedAt)).slice(0, 50));
}

export function subscribeToMessages(uid, conversationId, onChange, onError) {
  const database = requireDb();
  return subscribe(query(collection(database, 'messages'), where('uid', '==', uid), limit(500)), onChange, onError,
    (items) => items.filter((item) => item.conversationId === conversationId).sort((left, right) => dateValue(left.createdAt) - dateValue(right.createdAt)).slice(-100));
}

export function subscribeToPrompts(uid, onChange, onError) {
  const database = requireDb();
  return subscribe(query(collection(database, 'prompts'), where('uid', '==', uid), limit(100)), onChange, onError,
    (items) => items.sort((left, right) => dateValue(right.updatedAt) - dateValue(left.updatedAt)));
}
