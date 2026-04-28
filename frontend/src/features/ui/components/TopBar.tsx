'use client';

import { Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { uiStore } from '../stores/uiStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { authStore } from '@/features/auth/stores/authStore';
import { NotificationPopover } from '@/features/notifications/components/NotificationPopover';

import { GlobalSearch } from '@/features/tasks/components/GlobalSearch';

export function TopBar() {
  const { toggleSidebar } = uiStore();
  const { user, workspaceRole } = authStore();

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-50 sticky top-0">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </Button>
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-3">
        <NotificationPopover />
        <div className="h-6 w-px bg-slate-200 mx-1" />
        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-900 leading-none">{user?.name}</p>
            <p className="text-[10px] text-slate-500 leading-none mt-1 uppercase tracking-tight">
              {workspaceRole}
            </p>
          </div>
          <Avatar className="w-8 h-8 border border-slate-200">
            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold uppercase">
              {user?.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
