// Render Backend API Integration
import axios from 'axios';

// ─── Axios Instance ───────────────────────────────────────────────────────────

const RENDER_BACKEND_URL = 'https://forge2-kanban-3.onrender.com/api';

const api = axios.create({
  baseURL: RENDER_BACKEND_URL,
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
