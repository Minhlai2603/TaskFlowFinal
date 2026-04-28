import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getTasks, GetTasksParams, updateTask } from '@/features/tasks/api';
import { queryClient } from '@/lib/queryClient';
import { authStore } from '@/features/auth/stores/authStore';

export const useKanbanTasks = (filters: GetTasksParams) => {
  const { workspaceId } = authStore();

  const query = useInfiniteQuery({
    queryKey: ['kanban-tasks', workspaceId, filters],
    queryFn: ({ pageParam = 0 }) => 
      getTasks(workspaceId!, { ...filters, page: pageParam, limit: 50 }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.data) return undefined;
      const { page, limit, total } = lastPage.data;
      const loaded = (page + 1) * limit;
      return loaded < total ? page + 1 : undefined;
    },
    initialPageParam: 0,
    enabled: !!workspaceId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateTask(workspaceId!, id, data),
    onMutate: async ({ id, data }) => {
      // Optimistic update for kanban
      await queryClient.cancelQueries({ queryKey: ['kanban-tasks', workspaceId] });
      // We don't do complex optimistic UI across pages here to keep it simple and robust,
      // just invalidate to let it refetch if it fails, but we can do a simple one if we want.
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-tasks', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] }); // also invalidate normal tasks query
    },
    onError: () => {
      toast.error('Cập nhật thất bại');
    }
  });

  // Flatten the pages into a single tasks array
  const tasks = query.data?.pages.flatMap((page) => page.data?.tasks || []) || [];

  return {
    tasks,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    updateTask: updateMutation,
  };
};
