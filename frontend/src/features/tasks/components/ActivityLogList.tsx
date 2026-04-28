import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MessageSquare, RefreshCw, PlusCircle, CheckCircle2, Trash2 } from 'lucide-react';

interface ActivityLog {
  id: string;
  action_type: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'COMMENTED' | 'DELETED';
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  user: {
    name: string;
  };
}

interface ActivityLogListProps {
  logs: ActivityLog[];
}

const actionIcons = {
  CREATED: <PlusCircle className="w-4 h-4 text-emerald-500" />,
  UPDATED: <RefreshCw className="w-4 h-4 text-blue-500" />,
  STATUS_CHANGED: <CheckCircle2 className="w-4 h-4 text-indigo-500" />,
  COMMENTED: <MessageSquare className="w-4 h-4 text-orange-500" />,
  DELETED: <Trash2 className="w-4 h-4 text-red-500" />
};

const formatFieldLabel = (field?: string) => {
  const labels: Record<string, string> = {
    title: 'tiêu đề',
    description: 'mô tả',
    assignee_id: 'người thực hiện',
    priority: 'độ ưu tiên',
    due_date: 'ngày đến hạn',
    status: 'trạng thái'
  };
  return field ? labels[field] || field : '';
};

export function ActivityLogList({ logs }: ActivityLogListProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-center p-8 text-sm text-slate-500">
        Chưa có hoạt động nào.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {logs.map((log) => {
        const fieldLabel = formatFieldLabel(log.field_changed);
        return (
          <div key={log.id} className="flex gap-4">
            <div className="mt-1">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                {actionIcons[log.action_type]}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-sm">
                <span className="font-medium text-slate-900">{log.user.name}</span>
                {' '}
                <span className="text-slate-600">
                  {log.action_type === 'CREATED' && 'đã tạo công việc này'}
                  {log.action_type === 'COMMENTED' && 'đã bình luận'}
                  {log.action_type === 'DELETED' && 'đã xóa công việc'}
                  {log.action_type === 'STATUS_CHANGED' && `đã đổi ${fieldLabel}`}
                  {log.action_type === 'UPDATED' && `đã cập nhật ${fieldLabel}`}
                </span>
              </div>
              
              {(log.action_type === 'STATUS_CHANGED' || log.action_type === 'UPDATED') && log.field_changed && (
                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-md border border-slate-100 mt-2 flex items-center gap-2 flex-wrap">
                  <span className="line-through opacity-70 max-w-[200px] truncate">{log.old_value || 'Trống'}</span>
                  <span>→</span>
                  <span className="font-medium text-slate-700 max-w-[200px] truncate">{log.new_value || 'Trống'}</span>
                </div>
              )}

              {log.action_type === 'COMMENTED' && log.new_value && (
                <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2 whitespace-pre-wrap">
                  {log.new_value.replace(/@\[([^\]]+)\]\([^\)]+\)/g, '@$1')}
                </div>
              )}

              <div className="text-xs text-slate-400">
                {format(new Date(log.created_at), 'HH:mm - dd/MM/yyyy', { locale: vi })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
