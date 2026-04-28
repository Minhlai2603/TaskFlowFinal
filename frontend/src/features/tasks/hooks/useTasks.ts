import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getTasks, createTask, updateTask, deleteTask } from '../api';
import { queryClient } from '@/lib/queryClient';
import { authStore } from '@/features/auth/stores/authStore';

export const useTasks = (projectId?: string) => {
  const { workspaceId } = authStore();

  const tasksQuery = useQuery({
    queryKey: ['tasks', workspaceId, projectId],
    queryFn: () => getTasks(workspaceId!, { projectId }),
    enabled: !!workspaceId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createTask(workspaceId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      toast.success('Đã tạo task mới');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Tạo task thất bại');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateTask(workspaceId!, id, data),
    onMutate: async ({ id, data }) => {
      // Optimistic UI
      await queryClient.cancelQueries({ queryKey: ['tasks', workspaceId] });
      const previousTasks = queryClient.getQueryData(['tasks', workspaceId, projectId]);
      
      queryClient.setQueryData(['tasks', workspaceId, projectId], (old: any) => {
        if (!old?.data?.tasks) return old;
        return {
          ...old,
          data: {
            ...old.data,
            tasks: old.data.tasks.map((t: any) => t.id === id ? { ...t, ...data } : t)
          }
        };
      });

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['tasks', workspaceId, projectId], context?.previousTasks);
      toast.error('Cập nhật thất bại');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
    }
  });

  return {
    tasks: tasksQuery.data?.data?.tasks || [],
    isLoading: tasksQuery.isLoading,
    createTask: createMutation,
    updateTask: updateMutation,
  };
};
