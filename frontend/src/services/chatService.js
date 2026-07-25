import { api } from './api.js';
import { getIdToken } from './api.js';

export const getConversationHistory = (params) => api.get('/chat/history', { params }).then((response) => response.data.data);
export const getMessages = (conversationId, params) => api.get(`/chat/${conversationId}/messages`, { params }).then((response) => response.data.data);
export const deleteConversation = (conversationId) => api.delete(`/chat/${conversationId}`);

export async function streamChat(payload, { onToken, onDone, onError, onSources }) {
  const token = await getIdToken();
  const response = await fetch(`${api.defaults.baseURL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(payload),
  });
  if (!response.ok || !response.body) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error?.message ?? 'Unable to start the AI response.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const dispatch = (frame) => {
    const event = frame.match(/^event:\s*(.+)$/m)?.[1] ?? 'message';
    const data = frame.split('\n').filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim()).join('\n');
    if (!data) return;
    const payloadData = JSON.parse(data);
    if (event === 'token') onToken?.(payloadData);
    if (event === 'done') onDone?.(payloadData);
    if (event === 'sources') onSources?.(payloadData);
    if (event === 'error') onError?.(payloadData);
  };

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';
    frames.filter(Boolean).forEach(dispatch);
    if (done) break;
  }
  if (buffer.trim()) dispatch(buffer);
}
