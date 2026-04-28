'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authStore } from '@/features/auth/stores/authStore';
import api from '@/lib/axios';
import { MentionInput } from './MentionInput';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    name: string;
  };
}

interface CommentSectionProps {
  taskId: string;
}

export function CommentSection({ taskId }: CommentSectionProps) {
  const [content, setContent] = useState('');
  const [mentions, setMentions] = useState<{name: string, id: string}[]>([]);
  const { workspaceId } = authStore();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['tasks', taskId, 'comments'],
    queryFn: async () => {
      const res = await api.get(`/tasks/${taskId}/comments`, {
        headers: { 'x-workspace-id': workspaceId }
      });
      return res.data.data as Comment[];
    },
    enabled: !!taskId && !!workspaceId,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post(`/tasks/${taskId}/comments`, { content }, {
        headers: { 'x-workspace-id': workspaceId }
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'comments'] });
      setContent('');
      setMentions([]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Không thể gửi bình luận');
    }
  });

  const handleSend = () => {
    if (!content.trim() || createCommentMutation.isPending) return;
    
    let processedContent = content;
    // Sort mentions by name length descending to replace longer names first
    const sortedMentions = [...mentions].sort((a, b) => b.name.length - a.name.length);
    sortedMentions.forEach(m => {
      processedContent = processedContent.split(`@${m.name}`).join(`@[${m.name}](${m.id})`);
    });

    createCommentMutation.mutate(processedContent);
  };

  const renderContent = (text: string) => {
    // Replace @[Name](id) with @Name styled span
    const parts = text.split(/(@\[[^\]]+\]\([a-f0-9-]+\))/);
    return parts.map((part, i) => {
      const match = part.match(/@\[([^\]]+)\]\(([a-f0-9-]+)\)/);
      if (match) {
        return (
          <span key={i} className="font-bold text-indigo-600 bg-indigo-50 px-1 rounded">
            @{match[1]}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <MessageSquare className="w-3 h-3" />
          Thảo luận ({comments.length})
        </p>
      </div>

      <div className="flex-1 -mx-2 px-2">
        <div className="space-y-4 pb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200 flex-shrink-0">
                {comment.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{comment.user.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {format(new Date(comment.created_at), 'HH:mm, dd/MM', { locale: vi })}
                  </span>
                </div>
                <div className="text-sm text-slate-600 leading-relaxed break-words">
                  {renderContent(comment.content)}
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && !isLoading && (
            <div className="py-8 text-center opacity-30 flex flex-col items-center gap-2">
              <MessageSquare className="w-8 h-8" />
              <p className="text-xs">Chưa có bình luận nào</p>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white pt-4 pb-6 mt-auto z-10 -mx-6 px-6 border-t border-slate-100">
        <div className="space-y-3">
          <MentionInput
            value={content}
            onChange={setContent}
            onSend={handleSend}
            onMentionAdd={(member) => {
              setMentions(prev => {
                if (!prev.find(m => m.id === member.id)) {
                  return [...prev, { name: member.name, id: member.id }];
                }
                return prev;
              });
            }}
            placeholder="Viết bình luận... (Sử dụng @ để nhắc tên)"
          />
          <div className="flex justify-end">
            <Button 
              size="sm" 
              onClick={handleSend} 
              disabled={!content.trim() || createCommentMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              <Send className="w-3 h-3" />
              {createCommentMutation.isPending ? 'Đang gửi...' : 'Gửi'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
