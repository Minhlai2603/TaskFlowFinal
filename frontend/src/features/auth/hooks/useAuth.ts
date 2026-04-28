import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { login, register, logout, getMe } from '../api';
import { authStore } from '../stores/authStore';
import { queryClient } from '@/lib/queryClient';

export const useAuth = () => {
  const router = useRouter();
  const { setAuth, logout: clearStore } = authStore();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      const { user, workspaceId, workspaceRole, workspaces = [] } = response.data;
      setAuth(user, workspaceId, workspaceRole, workspaces);
      // Sync query client data immediately as per tasks.md FR-01
      queryClient.setQueryData(['auth', 'me'], response);
      toast.success('Đăng nhập thành công!');
      router.push('/app/my-tasks');
      // NOTE: ensurePersonalWorkspace được xử lý tự động bởi WorkspaceSwitcher
      // khi user vào dashboard — không làm ở đây để tránh race condition với router.push
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Đăng nhập thất bại';
      toast.error(message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (response) => {
      const { user, workspaceId, workspaceRole, workspaces = [] } = response.data;
      setAuth(user, workspaceId, workspaceRole, workspaces);
      queryClient.setQueryData(['auth', 'me'], response);
      toast.success('Đăng ký thành công!');
      router.push('/app/my-tasks');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Đăng ký thất bại';
      toast.error(message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearStore();
      queryClient.clear();
      toast.success('Đăng xuất thành công');
      router.push('/login');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi đăng xuất');
    },
  });

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000, // 5 phút như đặc tả
    enabled: !!authStore.getState().user, // Chỉ gọi khi user object tồn tại
  });

  return {
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    user: meQuery.data?.data.user,
    isLoading: loginMutation.isPending || registerMutation.isPending || meQuery.isLoading,
  };
};
