import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { api } from '../services/api.js';
import { firebaseAuth, firebaseConfigurationMessage } from './config.js';

function requireFirebaseAuth() {
  if (!firebaseAuth) throw new Error(firebaseConfigurationMessage);
  return firebaseAuth;
}

export async function syncUserProfile(user) {
  const token = await user.getIdToken();
  await api.post('/auth/sync', {
    displayName: user.displayName ?? undefined,
    photoURL: user.photoURL ?? undefined,
  }, { headers: { Authorization: `Bearer ${token}` } });
}

export async function registerWithEmail({ displayName, email, password }) {
  const credential = await createUserWithEmailAndPassword(requireFirebaseAuth(), email, password);
  await updateProfile(credential.user, { displayName });
  await syncUserProfile(credential.user);
  return credential.user;
}

export async function signInWithEmail({ email, password }) {
  const credential = await signInWithEmailAndPassword(requireFirebaseAuth(), email, password);
  await syncUserProfile(credential.user);
  return credential.user;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(requireFirebaseAuth(), provider);
  await syncUserProfile(credential.user);
  return credential.user;
}

export const signOutUser = () => signOut(requireFirebaseAuth());
export const subscribeToAuth = (callback) => onAuthStateChanged(requireFirebaseAuth(), callback);

const messages = {
  'auth/email-already-in-use': 'An account already exists for this email address.',
  'auth/invalid-credential': 'Your email or password is incorrect.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/weak-password': 'Choose a password with at least six characters.',
};

export function getAuthErrorMessage(error) {
  if (error?.message === firebaseConfigurationMessage) return error.message;
  console.error('[Auth Error]', error?.code, error?.message, error);
  const apiError = error?.response?.data?.error;
  if (apiError?.message) return apiError.message;
  return messages[error?.code] ?? `Error: ${error?.code ?? error?.message ?? 'Unknown error. Check browser console for details.'}`;
}
