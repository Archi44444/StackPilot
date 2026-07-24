import { api } from './api.js';

export async function getSettings() {
  const response = await api.get('/settings');
  return response.data.data;
}

export async function updateSettings(settings) {
  const response = await api.put('/settings', settings);
  return response.data.data;
}
