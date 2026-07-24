import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from '../config/firebaseAdmin.js';
import { AppError } from '../utils/AppError.js';

const PAGE_LIMIT = 100;

function serialize(value) {
  if (value?.toDate instanceof Function) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serialize(item)]));
  return value;
}

function documentData(snapshot) {
  return { id: snapshot.id, ...serialize(snapshot.data()) };
}

async function getOwnedDocument(collectionName, id, uid) {
  const snapshot = await getDb().collection(collectionName).doc(id).get();
  if (!snapshot.exists || snapshot.data().uid !== uid) {
    throw new AppError('The requested resource was not found.', { statusCode: 404, code: 'NOT_FOUND' });
  }
  return snapshot;
}

async function paginate(query, collectionName, { limit, cursor }) {
  const size = Math.min(limit, PAGE_LIMIT);
  let pageQuery = query.limit(size + 1);
  if (cursor) {
    const cursorSnapshot = await getDb().collection(collectionName).doc(cursor).get();
    if (cursorSnapshot.exists) pageQuery = pageQuery.startAfter(cursorSnapshot);
  }
  const snapshot = await pageQuery.get();
  const documents = snapshot.docs.slice(0, size);
  return {
    items: documents.map(documentData),
    nextCursor: snapshot.docs.length > size ? documents.at(-1)?.id ?? null : null,
  };
}

export async function listConversations(uid, options) {
  const query = getDb().collection('conversations').where('uid', '==', uid).orderBy('updatedAt', 'desc');
  return paginate(query, 'conversations', options);
}

export async function ensureConversation(uid, conversationId, firstMessage) {
  const database = getDb();
  if (conversationId) {
    const snapshot = await getOwnedDocument('conversations', conversationId, uid);
    await snapshot.ref.update({ updatedAt: FieldValue.serverTimestamp() });
    return snapshot.id;
  }
  const reference = database.collection('conversations').doc();
  const title = firstMessage.trim().replace(/\s+/g, ' ').slice(0, 72) || 'New conversation';
  await reference.set({
    uid,
    title,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    messageCount: 0,
  });
  return reference.id;
}

export async function createMessage({ uid, conversationId, role, content, model, tokens }) {
  const database = getDb();
  const reference = database.collection('messages').doc();
  const message = {
    uid,
    conversationId,
    role,
    content,
    createdAt: FieldValue.serverTimestamp(),
  };
  if (model) message.model = model;
  if (tokens) message.tokens = tokens;
  const batch = database.batch();
  batch.set(reference, message);
  batch.update(database.collection('conversations').doc(conversationId), {
    updatedAt: FieldValue.serverTimestamp(),
    messageCount: FieldValue.increment(1),
  });
  await batch.commit();
  return reference.id;
}

export async function getRecentMessages(uid, conversationId, maxMessages = 30) {
  await getOwnedDocument('conversations', conversationId, uid);
  const snapshot = await getDb().collection('messages')
    .where('conversationId', '==', conversationId)
    .get();
  // The conversation ownership check above makes a uid filter redundant. Sorting
  // locally also keeps first-use chat working before the optional composite index
  // has finished building in a new Firebase project.
  return snapshot.docs
    .map((document) => documentData(document))
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
    .slice(-maxMessages);
}

export async function listMessages(uid, conversationId, options) {
  await getOwnedDocument('conversations', conversationId, uid);
  const query = getDb().collection('messages').where('uid', '==', uid).where('conversationId', '==', conversationId).orderBy('createdAt', 'asc');
  return paginate(query, 'messages', options);
}

export async function deleteConversation(uid, conversationId) {
  const database = getDb();
  await getOwnedDocument('conversations', conversationId, uid);
  const messagesQuery = database.collection('messages').where('uid', '==', uid).where('conversationId', '==', conversationId);
  // Firestore batches max out at 500 operations; delete large histories in bounded batches.
  while (true) {
    const messages = await messagesQuery.limit(400).get();
    if (messages.empty) break;
    const batch = database.batch();
    messages.docs.forEach((snapshot) => batch.delete(snapshot.ref));
    await batch.commit();
  }
  await database.collection('conversations').doc(conversationId).delete();
}

export async function createPrompt(uid, input) {
  const reference = getDb().collection('prompts').doc();
  await reference.set({
    uid,
    title: input.title,
    content: input.content,
    category: input.category,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return documentData(await reference.get());
}

export async function listPrompts(uid, options) {
  const query = getDb().collection('prompts').where('uid', '==', uid).orderBy('updatedAt', 'desc');
  return paginate(query, 'prompts', options);
}

export async function updatePrompt(uid, promptId, input) {
  const snapshot = await getOwnedDocument('prompts', promptId, uid);
  await snapshot.ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() });
  return documentData(await snapshot.ref.get());
}

export async function deletePrompt(uid, promptId) {
  const snapshot = await getOwnedDocument('prompts', promptId, uid);
  await snapshot.ref.delete();
}
