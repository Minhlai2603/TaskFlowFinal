'use client';

import { useNotifications } from '../hooks/useNotifications';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Check, MessageSquare, UserPlus, Calendar } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { uiStore } from '@/features/ui/stores/uiStore';

export function NotificationPopover() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { openTaskSlideOver } = uiStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'TASK_COMMENTED':
      case 'TASK_MENTIONED':
        return <MessageSquare className="w-3 h-3 text-blue-500" />;
      case 'TASK_ASSIGNED':
        return <UserPlus className="w-3 h-3 text-indigo-500" />;
      case 'TASK_DUE_SOON':
        return <Calendar className="w-3 h-3 text-orange-500" />;
      default:
        return <Bell className="w-3 h-3 text-slate-500" />;
    }
  };

  const handleNotificationClick = (n: any) => {
    if (n.task_id) {
      openTaskSlideOver(n.task_id);
    }
    if (!n.read_at) {
      markRead.mutate(n.id);
    }
  };

  return (
    <Popover>
      <PopoverTrigger className="inline-flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-slate-100 relative text-slate-500 hover:text-slate-900 outline-none">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">Thông báo</p>
          {unreadCount > 0 && (
            <button 
              onClick={() => markAllRead.mutate()}
              className="text-[10px] font-medium text-indigo-600 hover:underline flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Bell className="w-8 h-8 opacity-20" />
              <p className="text-xs">Không có thông báo nào</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex gap-3 p-4 text-left border-b border-slate-50 transition-colors ${
                    !n.read_at ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    !n.read_at ? 'bg-white shadow-sm' : 'bg-slate-100 opacity-60'
                  }`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-xs leading-relaxed ${!n.read_at ? 'font-medium text-slate-900' : 'text-slate-500'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {format(new Date(n.created_at), 'HH:mm, dd/MM/yyyy', { locale: vi })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
