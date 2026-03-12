import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('kt_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auto-logout on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kt_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/api/auth/register', data).then(r => r.data),
  login:    (data) => api.post('/api/auth/login', data).then(r => r.data),
  me:       ()     => api.get('/api/auth/me').then(r => r.data),
};

// ── Entries ───────────────────────────────────────────────────────────────
export const entriesApi = {
  list:       (params) => api.get('/api/entries/', { params }).then(r => r.data),
  listPublic: (params) => api.get('/api/entries/public', { params }).then(r => r.data),
  get:        (id)     => api.get(`/api/entries/${id}`).then(r => r.data),
  create:     (data)   => api.post('/api/entries/', data).then(r => r.data),
  update:     (id, d)  => api.put(`/api/entries/${id}`, d).then(r => r.data),
  delete:     (id)     => api.delete(`/api/entries/${id}`),
};

// ── Search ────────────────────────────────────────────────────────────────
export const searchApi = {
  search: (q, scope = 'mine') => api.get('/api/search/', { params: { q, scope } }).then(r => r.data),
};

export default api;
