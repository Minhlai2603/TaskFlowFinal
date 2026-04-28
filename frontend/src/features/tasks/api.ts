import api from '@/lib/axios';

export type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  project_id: string;
  assignee_id?: string | null;
  created_at: string;
  project?: { id: string, name: string, color: string };
  assignee?: { id: string, name: string, email: string };
}

export interface GetTasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
}

export interface GetTasksParams {
  projectId?: string;
  status?: string | string[];
  assigneeId?: string;
  priority?: string;
  q?: string;
  due_date_start?: string;
  due_date_end?: string;
  page?: number;
  limit?: number;
}

export const getTasks = async (workspaceId: string, params?: GetTasksParams) => {
  const response = await api.get<{ success: boolean; data: GetTasksResponse }>('/tasks', {
    headers: { 'x-workspace-id': workspaceId },
    params
  });
  return response.data;
};

export const getTask = async (workspaceId: string, id: string) => {
  const response = await api.get<{ success: boolean; data: Task }>(`/tasks/${id}`, {
    headers: { 'x-workspace-id': workspaceId }
  });
  return response.data;
};

export const createTask = async (workspaceId: string, data: Partial<Task>) => {
  const response = await api.post<{ success: boolean; data: Task }>('/tasks', data, {
    headers: { 'x-workspace-id': workspaceId }
  });
  return response.data;
};

export const updateTask = async (workspaceId: string, id: string, data: Partial<Task>) => {
  const response = await api.patch<{ success: boolean; data: Task }>(`/tasks/${id}`, data, {
    headers: { 'x-workspace-id': workspaceId }
  });
  return response.data;
};

export const deleteTask = async (workspaceId: string, id: string) => {
  const response = await api.delete<{ success: boolean }>(`/tasks/${id}`, {
    headers: { 'x-workspace-id': workspaceId }
  });
  return response.data;
};
