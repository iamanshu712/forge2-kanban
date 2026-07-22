// Render Backend API Integration
import axios from 'axios';

// ─── Axios Instance ───────────────────────────────────────────────────────────

const rawBaseUrl = (import.meta.env.VITE_API_URL as string | undefined) || '';

let baseURL = '/api';
if (rawBaseUrl.trim()) {
  const trimmed = rawBaseUrl.trim().replace(/\/+$/, '');
  baseURL = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor: Attach Token ───────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kanban_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Handle 401 ────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kanban_token');
      localStorage.removeItem('kanban_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
