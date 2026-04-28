import api from '@/lib/axios';

// Redefining types locally to avoid cross-workspace issues
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: AuthUser;
    workspaceId: string;
    workspaceRole: 'ADMIN' | 'MANAGER' | 'MEMBER';
    /** Danh sách tất cả workspaces của user */
    workspaces: WorkspaceInfo[];
  };
  error?: string;
}

export const register = async (data: any): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const login = async (data: any): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const logout = async (): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<{ success: boolean; message: string }>('/auth/logout');
  return response.data;
};

export const updateProfile = async (data: { name: string }): Promise<AuthResponse> => {
  const response = await api.patch<AuthResponse>('/auth/profile', data);
  return response.data;
};

export const getMe = async (): Promise<AuthResponse> => {
  const response = await api.get<AuthResponse>('/auth/me');
  return response.data;
};
