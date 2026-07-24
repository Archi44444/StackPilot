import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { env } from './env.js';

function assertFirebaseConfiguration() {
  const { projectId, clientEmail, privateKey } = env.firebase;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.');
  }
}

export function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0];
  assertFirebaseConfiguration();
  return initializeApp({
    credential: cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey,
    }),
  });
}

export const getFirebaseAuth = () => getAuth(getFirebaseApp());
export const getDb = () => getFirestore(getFirebaseApp());
export const getBucket = () => getStorage(getFirebaseApp()).bucket();
