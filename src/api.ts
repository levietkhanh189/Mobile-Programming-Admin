import axios from 'axios';
import { clearAuth, getToken } from './auth';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://backend-production-9c18.up.railway.app/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      const path = window.location.pathname;
      if (!path.endsWith('/login')) {
        clearAuth();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export const API_URL = API_BASE_URL;
