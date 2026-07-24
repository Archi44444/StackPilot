import axios from 'axios';

let tokenGetter;

export function setIdTokenGetter(nextTokenGetter) {
  tokenGetter = nextTokenGetter;
}

export const getIdToken = async (forceRefresh = false) => (tokenGetter ? tokenGetter(forceRefresh) : null);

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000/api/v1',
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = tokenGetter ? await tokenGetter() : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Backend credentials can be reloaded while a local session is active. Refresh
// the Firebase token once before surfacing a 401 to the user.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (error.response?.status !== 401 || request?._tokenRefreshAttempted) {
      return Promise.reject(error);
    }

    request._tokenRefreshAttempted = true;
    const token = await getIdToken(true);
    if (!token) return Promise.reject(error);
    request.headers = { ...request.headers, Authorization: `Bearer ${token}` };
    return api(request);
  },
);
