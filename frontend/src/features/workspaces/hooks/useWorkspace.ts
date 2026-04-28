import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getWorkspace, updateWorkspace, getMembers, inviteMember, removeMember } from '../api';
import { queryClient } from '@/lib/queryClient';

export const useWorkspace = (workspaceId?: string) => {
  const workspaceQuery = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => getWorkspace(workspaceId!),
    enabled: !!workspaceId,
  });

  const membersQuery = useQuery({
    queryKey: ['workspace', workspaceId, 'members'],
    queryFn: () => getMembers(workspaceId!),
    enabled: !!workspaceId,
  });

  const updateMutation = useMutation({
    mutationFn: (name: string) => updateWorkspace(workspaceId!, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      toast.success('Cập nhật tên workspace thành công');
    },
    onError: () => {
      toast.error('Cập nhật thất bại');
    },
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) => 
      inviteMember(workspaceId!, email, role),
    onSuccess: () => {
      toast.success('Đã gửi lời mời tham gia');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Mời thành viên thất bại');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeMember(workspaceId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'members'] });
      toast.success('Đã xóa thành viên');
    },
    onError: () => {
      toast.error('Xóa thành viên thất bại');
    },
  });

  return {
    workspace: workspaceQuery.data?.data,
    members: membersQuery.data?.data,
    isLoading: workspaceQuery.isLoading || membersQuery.isLoading,
    updateWorkspace: updateMutation,
    inviteMember: inviteMutation,
    removeMember: removeMutation,
  };
};
