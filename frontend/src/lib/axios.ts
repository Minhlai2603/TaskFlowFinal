import axios from 'axios';
import { authStore } from '@/features/auth/stores/authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true, // BẮT BUỘC để gửi httpOnly cookie theo mọi request
});

// Request interceptor: Tự động gắn x-workspace-id
api.interceptors.request.use((config) => {
  const workspaceId = authStore.getState().workspaceId;
  if (workspaceId) {
    config.headers['x-workspace-id'] = workspaceId;
  }
  return config;
});

// Flag để tránh multiple simultaneous logout calls
let isLoggingOut = false;

// Response interceptor: Xử lý 401 (token hết hạn) → clear session + redirect
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const publicRoutes = ['/login', '/register', '/invite'];
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isPublicRoute = publicRoutes.some((route) => currentPath.startsWith(route));

    if (error.response?.status === 401 && !isPublicRoute && !isLoggingOut) {
      isLoggingOut = true;
      try {
        // Xóa store Zustand
        authStore.getState().logout();

        // Gọi Next.js API route để clear httpOnly cookie trên server
        await fetch('/api/auth/clear-session', { method: 'POST' });
      } catch {
        // Nếu clear session thất bại, vẫn redirect
      } finally {
        isLoggingOut = false;
        // Hard redirect — middleware sẽ bắt được (không còn cookie)
        if (typeof window !== 'undefined') {
          window.location.replace('/login');
        }
      }
    }

    if (error.response?.status === 429) {
      const { toast } = require('sonner');
      toast.error('Bạn đang thao tác quá nhanh. Vui lòng chờ.');
    }

    return Promise.reject(error);
  }
);

export default api;
