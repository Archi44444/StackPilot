import { api } from './api.js';

export const logTask = (payload) => api.post('/tasks', payload).then((r) => r.data.data);
export const listTasks = () => api.get('/tasks').then((r) => r.data.data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
