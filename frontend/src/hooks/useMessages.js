import { subscribeToMessages } from '../firebase/firestore.js';
import { firebaseDb } from '../firebase/config.js';
import { useAuth } from './useAuth.js';
import { useRealtimeSubscription } from './useRealtimeSubscription.js';

export function useMessages(conversationId) {
  const { user } = useAuth();
  const subscribe = user && conversationId && firebaseDb ? (onChange, onError) => subscribeToMessages(user.uid, conversationId, onChange, onError) : null;
  const result = useRealtimeSubscription(subscribe, [user?.uid, conversationId]);
  return { messages: result.data, loading: result.loading, error: result.error };
}
