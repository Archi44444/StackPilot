import { useCallback } from 'react';
import { subscribeToConversations } from '../firebase/firestore.js';
import { firebaseDb } from '../firebase/config.js';
import { deleteConversation } from '../services/chatService.js';
import { useAuth } from './useAuth.js';
import { useRealtimeSubscription } from './useRealtimeSubscription.js';

export function useConversations() {
  const { user } = useAuth();
  const subscribe = user && firebaseDb ? (onChange, onError) => subscribeToConversations(user.uid, onChange, onError) : null;
  const result = useRealtimeSubscription(subscribe, [user?.uid]);
  const removeConversation = useCallback((conversationId) => deleteConversation(conversationId), []);
  return { conversations: result.data, loading: result.loading, error: result.error, removeConversation };
}
