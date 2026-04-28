'use client';

import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authStore } from '@/features/auth/stores/authStore';
import api from '@/lib/axios';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: string;
  message: string;
  read_at: string | null;
  created_at: string;
  task_id?: string;
  comment_id?: string;
}

export function useNotifications() {
  const { workspaceId, user } = authStore();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', workspaceId, user?.id],
    queryFn: async () => {
      const res = await api.get('/notifications', {
        headers: { 'x-workspace-id': workspaceId }
      });
      return res.data.data as Notification[];
    },
    enabled: !!workspaceId && !!user?.id,
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: false, // Pause when tab is blur
  });

  const prevNotifs = useRef(notifications);

  useEffect(() => {
    if (notifications.length > 0) {
      const newNotifs = notifications.filter(
        n => !n.read_at && !prevNotifs.current.find((pn: any) => pn.id === n.id)
      );
      if (newNotifs.length > 0 && prevNotifs.current.length > 0) {
        newNotifs.forEach(n => {
          toast.info('Thông báo mới', { description: n.message });
        });
      }
      prevNotifs.current = notifications;
    }
  }, [notifications]);

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/mark-read`, {}, {
        headers: { 'x-workspace-id': workspaceId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/mark-read-all', {}, {
        headers: { 'x-workspace-id': workspaceId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead,
    markAllRead
  };
}
