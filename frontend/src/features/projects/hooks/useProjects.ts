import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getProjects, createProject, getProject, updateProject, deleteProject } from '../api';
import { queryClient } from '@/lib/queryClient';
import { authStore } from '@/features/auth/stores/authStore';

export const useProjects = () => {
  const { workspaceId } = authStore();

  const projectsQuery = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => getProjects(workspaceId!),
    enabled: !!workspaceId,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string, color: string, description?: string }) => 
      createProject(workspaceId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      toast.success('Đã tạo dự án mới');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Tạo dự án thất bại');
    },
  });

  return {
    projects: projectsQuery.data?.data || [],
    isLoading: projectsQuery.isLoading,
    createProject: createMutation,
  };
};

export const useProject = (id: string) => {
  const { workspaceId } = authStore();

  const projectQuery = useQuery({
    queryKey: ['project', id, workspaceId],
    queryFn: () => getProject(workspaceId!, id),
    enabled: !!workspaceId && !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateProject(workspaceId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      toast.success('Đã cập nhật dự án');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(workspaceId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      toast.success('Đã xóa dự án');
    },
  });

  return {
    project: projectQuery.data?.data,
    isLoading: projectQuery.isLoading,
    updateProject: updateMutation,
    deleteProject: deleteMutation,
  };
};
