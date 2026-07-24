import { createContext, useEffect, useMemo, useState } from 'react';
import { isFirebaseConfigured, firebaseConfigurationMessage } from '../firebase/config.js';
import { registerWithEmail, signInWithEmail, signInWithGoogle, signOutUser, subscribeToAuth } from '../firebase/auth.js';
import { setIdTokenGetter } from '../services/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return undefined;
    }
    const unsubscribe = subscribeToAuth((nextUser) => {
      setUser(nextUser);
      setIdTokenGetter(async (forceRefresh = false) => nextUser?.getIdToken(forceRefresh) ?? null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isConfigured: isFirebaseConfigured,
    configurationError: isFirebaseConfigured ? null : firebaseConfigurationMessage,
    register: registerWithEmail,
    login: signInWithEmail,
    loginWithGoogle: signInWithGoogle,
    logout: signOutUser,
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
