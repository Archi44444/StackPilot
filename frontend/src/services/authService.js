import { api } from './api.js';

export const deleteAccount = () => api.delete('/auth/account');
