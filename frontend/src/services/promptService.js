import { api } from './api.js';

export const createPrompt = (input) => api.post('/prompts', input).then((response) => response.data.data);
export const getPrompts = (params) => api.get('/prompts', { params }).then((response) => response.data.data);
export const updatePrompt = (promptId, input) => api.put(`/prompts/${promptId}`, input).then((response) => response.data.data);
export const deletePrompt = (promptId) => api.delete(`/prompts/${promptId}`);
