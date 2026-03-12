import { create } from 'zustand';
import { authApi } from '../utils/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('kt_token'),
  loading: false,

  init: async () => {
    const token = localStorage.getItem('kt_token');
    if (!token) return;
    try {
      const user = await authApi.me();
      set({ user, token });
    } catch {
      localStorage.removeItem('kt_token');
      set({ user: null, token: null });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem('kt_token', data.access_token);
      set({ user: data.user, token: data.access_token, loading: false });
      return { ok: true };
    } catch (e) {
      set({ loading: false });
      return { ok: false, error: e.response?.data?.detail || 'Login failed' };
    }
  },

  register: async (username, email, password) => {
    set({ loading: true });
    try {
      const data = await authApi.register({ username, email, password });
      localStorage.setItem('kt_token', data.access_token);
      set({ user: data.user, token: data.access_token, loading: false });
      return { ok: true };
    } catch (e) {
      set({ loading: false });
      return { ok: false, error: e.response?.data?.detail || 'Registration failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('kt_token');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
