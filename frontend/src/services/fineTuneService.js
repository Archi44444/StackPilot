import { api } from './api.js';

// Fine-tune inference can take 30-90s on first load (model loading from disk).
// We override the global 30s timeout specifically for this endpoint.
const FINE_TUNE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

export async function generateFineTuned(payload) {
  const response = await api.post('/fine-tune/generate', payload, {
    timeout: FINE_TUNE_TIMEOUT_MS,
  });
  return response.data.data;
}
