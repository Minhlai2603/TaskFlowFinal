import api from '@/lib/axios';
import { WorkspaceInfo } from '@/features/auth/stores/authStore';

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Workspace {
  id: string;
  name: string;
  created_by: string;
  members?: WorkspaceMember[];
}

export interface SwitchWorkspaceResponse {
  success: boolean;
  data: {
    workspaceId: string;
    workspaceRole: 'ADMIN' | 'MANAGER' | 'MEMBER';
    workspace: { id: string; name: string };
  };
}

export interface AcceptInviteResponse {
  success: boolean;
  data: {
    user: { id: string; name: string; email: string };
    workspaceId: string;
    workspaceRole: 'ADMIN' | 'MANAGER' | 'MEMBER';
    workspaces: WorkspaceInfo[];
  };
}

export const getWorkspace = async (id: string) => {
  const response = await api.get<{ success: boolean; data: Workspace }>(`/workspaces/${id}`);
  return response.data;
};

export const updateWorkspace = async (id: string, name: string) => {
  const response = await api.patch<{ success: boolean; data: Workspace }>(`/workspaces/${id}`, { name });
  return response.data;
};

export const getMembers = async (id: string) => {
  const response = await api.get<{ success: boolean; data: WorkspaceMember[] }>(`/workspaces/${id}/members`);
  return response.data;
};

export const inviteMember = async (id: string, email: string, role: string) => {
  const response = await api.post<{ success: boolean }>(`/workspaces/${id}/invites`, { email, role });
  return response.data;
};

export const removeMember = async (workspaceId: string, userId: string) => {
  const response = await api.delete<{ success: boolean }>(`/workspaces/${workspaceId}/members/${userId}`);
  return response.data;
};

export const verifyInvite = async (token: string) => {
  const response = await api.get<{
    success: boolean;
    data: { invite: any; userExists: boolean };
  }>(`/workspaces/invites/${token}`);
  return response.data;
};

export const acceptInvite = async (token: string, userData?: any): Promise<AcceptInviteResponse> => {
  const response = await api.post<AcceptInviteResponse>(
    `/workspaces/invites/${token}/accept`,
    userData
  );
  return response.data;
};

/**
 * Chuyển đổi active workspace.
 * Backend xác nhận membership và trả về workspace info + role.
 */
export const switchWorkspace = async (workspaceId: string): Promise<SwitchWorkspaceResponse> => {
  const response = await api.post<SwitchWorkspaceResponse>(`/workspaces/${workspaceId}/switch`);
  return response.data;
};

/**
 * Tạo personal workspace nếu user hiện tại chưa có workspace ADMIN.
 * Dùng sau khi login để đảm bảo mọi user đều có workspace riêng.
 */
export const ensurePersonalWorkspace = async () => {
  const response = await api.post<{ success: boolean; data: any }>('/workspaces/ensure-personal');
  return response.data;
};
