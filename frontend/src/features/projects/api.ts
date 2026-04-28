import api from '@/lib/axios';

export interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
  workspace_id: string;
  created_by: string;
  archived_at?: string | null;
  created_at: string;
  _count?: {
    tasks: number;
  };
}

export const getProjects = async (workspaceId: string) => {
  const response = await api.get<{ success: boolean; data: Project[] }>('/projects', {
    headers: { 'x-workspace-id': workspaceId }
  });
  return response.data;
};

export const getProject = async (workspaceId: string, id: string) => {
  const response = await api.get<{ success: boolean; data: Project }>(`/projects/${id}`, {
    headers: { 'x-workspace-id': workspaceId }
  });
  return response.data;
};

export const createProject = async (workspaceId: string, data: { name: string, color: string, description?: string }) => {
  const response = await api.post<{ success: boolean; data: Project }>('/projects', data, {
    headers: { 'x-workspace-id': workspaceId }
  });
  return response.data;
};

export const updateProject = async (workspaceId: string, id: string, data: Partial<Project>) => {
  const response = await api.patch<{ success: boolean; data: Project }>(`/projects/${id}`, data, {
    headers: { 'x-workspace-id': workspaceId }
  });
  return response.data;
};

export const archiveProject = async (workspaceId: string, id: string) => {
  const response = await api.patch<{ success: boolean; data: Project }>(`/projects/${id}/archive`, {}, {
    headers: { 'x-workspace-id': workspaceId }
  });
  return response.data;
};

export const deleteProject = async (workspaceId: string, id: string) => {
  const response = await api.delete<{ success: boolean }>(`/projects/${id}`, {
    headers: { 'x-workspace-id': workspaceId }
  });
  return response.data;
};
