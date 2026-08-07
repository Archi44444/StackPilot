import { api } from './api.js';

const importOptions = { timeout: 120_000 };

export const importRepository = (url) => api.post('/repositories/import', { url }, importOptions).then((r) => r.data.data);
export const listRepositories = () => api.get('/repositories').then((r) => r.data.data);
export const deleteRepository = (id) => api.delete(`/repositories/${id}`);
export const importDocumentation = (url) => api.post('/docs/import', { url }, importOptions).then((r) => r.data.data);
export const listDocumentation = () => api.get('/docs').then((r) => r.data.data);
export const deleteDocumentation = (id) => api.delete(`/docs/${id}`);
export const getDashboard = () => api.get('/dashboard').then((r) => r.data.data);
export const searchStackOverflow = (q) => api.get('/stackoverflow/search', { params: { q } }).then((r) => r.data.data);
export const getCausalAnalytics = () => api.get('/analytics/causal').then((r) => r.data.data);
