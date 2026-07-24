import { useCallback } from 'react';
import { firebaseDb } from '../firebase/config.js';
import { subscribeToPrompts } from '../firebase/firestore.js';
import { createPrompt, deletePrompt, updatePrompt } from '../services/promptService.js';
import { useAuth } from './useAuth.js';
import { useRealtimeSubscription } from './useRealtimeSubscription.js';

export function usePrompts() {
  const { user } = useAuth();
  const subscribe = user && firebaseDb ? (onChange, onError) => subscribeToPrompts(user.uid, onChange, onError) : null;
  const result = useRealtimeSubscription(subscribe, [user?.uid]);
  return {
    prompts: result.data,
    loading: result.loading,
    error: result.error,
    createPrompt: useCallback((input) => createPrompt(input), []),
    updatePrompt: useCallback((promptId, input) => updatePrompt(promptId, input), []),
    deletePrompt: useCallback((promptId) => deletePrompt(promptId), []),
  };
}
