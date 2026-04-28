'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown, Building2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { authStore, WorkspaceInfo } from '@/features/auth/stores/authStore';
import { switchWorkspace as apiSwitchWorkspace } from '@/features/workspaces/api';
import { queryClient } from '@/lib/queryClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import api from '@/lib/axios';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  MEMBER: 'Thành viên',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-indigo-100 text-indigo-700',
  MANAGER: 'bg-emerald-100 text-emerald-700',
  MEMBER: 'bg-slate-100 text-slate-600',
};

function WorkspaceAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initial = name.charAt(0).toUpperCase();
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-sm';
  return (
    <div
      className={cn(
        'rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0',
        sizeClass
      )}
    >
      {initial}
    </div>
  );
}

export function WorkspaceSwitcher() {
  const { workspaceId, workspaceRole, workspaces, switchWorkspace: storeSwitch, setWorkspaces } = authStore();
  const [isSwitching, setIsSwitching] = useState(false);

  // Tự động sync workspaces từ /auth/me nếu session cũ chưa có workspaces[]
  useEffect(() => {
    if (workspaces.length === 0 && workspaceId) {
      api.get('/auth/me').then(async (res) => {
        const data = res.data?.data;
        if (data?.workspaces?.length > 0) {
          setWorkspaces(data.workspaces);
          // Nếu không có ADMIN workspace → tạo personal workspace
          const hasAdmin = data.workspaces.some((w: any) => w.role === 'ADMIN');
          if (!hasAdmin) {
            try {
              await api.post('/workspaces/ensure-personal');
              // Sync lại sau khi tạo
              const updated = await api.get('/auth/me');
              const newWorkspaces = updated.data?.data?.workspaces || [];
              if (newWorkspaces.length > 0) setWorkspaces(newWorkspaces);
            } catch { /* silent */ }
          }
        } else if (data?.workspaceId) {
          setWorkspaces([{
            id: data.workspaceId,
            name: 'My Workspace',
            role: (data.workspaceRole || 'MEMBER') as 'ADMIN' | 'MANAGER' | 'MEMBER',
          }]);
        }
      }).catch(() => {/* silent fail */});
    }
  }, [workspaces.length, workspaceId, setWorkspaces]);

  const currentWorkspace = workspaces.find((w) => w.id === workspaceId);

  // Tên hiển thị: lấy từ workspaces list hoặc fallback
  const displayName = currentWorkspace?.name || 'Workspace';
  const displayRole = workspaceRole ? (ROLE_LABELS[workspaceRole] || workspaceRole) : '';

  const handleSwitch = async (workspace: WorkspaceInfo) => {
    if (workspace.id === workspaceId) return;

    setIsSwitching(true);
    try {
      const result = await apiSwitchWorkspace(workspace.id);
      const { workspaceId: newId, workspaceRole: newRole } = result.data;

      // Cập nhật authStore — axios interceptor sẽ tự động dùng workspaceId mới
      storeSwitch(newId, newRole);

      // Xóa toàn bộ cached data vì đang switch sang workspace khác
      queryClient.invalidateQueries();

      toast.success(`Đã chuyển sang workspace "${result.data.workspace.name}"`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể chuyển workspace');
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="border-b border-slate-200">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'w-full h-14 flex items-center gap-3 px-4 py-2',
            'hover:bg-slate-50 transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-inset',
            isSwitching && 'opacity-60 pointer-events-none'
          )}
        >
          {isSwitching ? (
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin flex-shrink-0" />
          ) : (
            <WorkspaceAvatar name={displayName} />
          )}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
              {displayName}
            </p>
            {displayRole && (
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                {displayRole}
              </p>
            )}
          </div>
          {workspaces.length > 1 && (
            <ChevronsUpDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          )}
        </DropdownMenuTrigger>

        {workspaces.length > 0 && (
          <DropdownMenuContent
            className="w-[240px] p-1.5 shadow-lg border-slate-200"
            align="start"
            sideOffset={4}
          >
          <DropdownMenuGroup>
            <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Workspaces của bạn
            </div>

            <div className="flex flex-col gap-0.5">
              {workspaces.map((ws) => {
                const isActive = ws.id === workspaceId;
                return (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => handleSwitch(ws)}
                    className={cn(
                      'flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer',
                      'focus:bg-slate-50 data-[highlighted]:bg-slate-50',
                      isActive && 'bg-indigo-50 focus:bg-indigo-50 data-[highlighted]:bg-indigo-50'
                    )}
                  >
                    <WorkspaceAvatar name={ws.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium truncate',
                          isActive ? 'text-indigo-700' : 'text-slate-800'
                        )}
                      >
                        {ws.name}
                      </p>
                      <span
                        className={cn(
                          'text-[10px] font-medium px-1.5 py-0.5 rounded',
                          ROLE_COLORS[ws.role] || ROLE_COLORS.MEMBER
                        )}
                      >
                        {ROLE_LABELS[ws.role] || ws.role}
                      </span>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
            </div>
          </DropdownMenuGroup>

            {workspaces.length > 1 && (
              <>
                <DropdownMenuSeparator className="my-1.5 bg-slate-100" />
                <div className="px-2 py-1">
                  <p className="text-[10px] text-slate-400 text-center">
                    Bạn là thành viên của {workspaces.length} workspace
                  </p>
                </div>
              </>
            )}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
