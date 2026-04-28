'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Check, 
  Layout, 
  Folder, 
  BarChart3, 
  Settings, 
  Plus, 
  ChevronRight,
  LogOut,
  User as UserIcon,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { uiStore } from '../stores/uiStore';
import { authStore } from '@/features/auth/stores/authStore';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { WorkspaceSwitcher } from '@/features/workspaces/components/WorkspaceSwitcher';

const NAV_ITEMS = [
  { label: 'Công việc của tôi', href: '/app/my-tasks', icon: Check },
  { label: 'Dự án', href: '/app/projects', icon: Folder },
  { label: 'Đội ngũ', href: '/app/team', icon: Users },
  { label: 'Báo cáo', href: '/app/reports', icon: BarChart3 },
  { label: 'Cài đặt', href: '/app/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, openCreateTask, openCreateProject } = uiStore();
  const { user, logout } = useAuth();
  const { projects } = useProjects();

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col hidden md:flex h-screen sticky top-0 transition-all duration-300">
      {/* Workspace Switcher thay thế static Logo */}
      <WorkspaceSwitcher />

      {/* Main Nav */}
      <div className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
              pathname.startsWith(item.href)
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}

        {/* Projects List */}
        <div className="mt-6 px-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dự án</span>
            <button 
              onClick={openCreateProject}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href={`/app/projects/${project.id}`}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors group",
                  pathname === `/app/projects/${project.id}`
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                )}
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: project.color }} 
                />
                <span className="truncate flex-1">{project.name}</span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
            {projects.length > 5 && (
              <Link href="/app/projects" className="text-xs text-indigo-600 px-3 py-1 hover:underline">
                View all ({projects.length})
              </Link>
            )}
            {projects.length === 0 && (
              <p className="text-[11px] text-slate-400 px-3 py-2 italic">Chưa có dự án nào</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Create */}
      <div className="px-3 mb-2">
        <Button 
          onClick={openCreateTask}
          className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Tạo Task
        </Button>
      </div>

      {/* User Block */}
      <div className="p-4 border-t border-slate-200">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-slate-50 transition-colors text-left group outline-none">
            <Avatar className="w-8 h-8 border border-slate-200">
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1">
            <DropdownMenuItem className="cursor-pointer p-0">
              <Link href="/app/settings" className="flex items-center gap-2 w-full px-2 py-1.5">
                <UserIcon className="w-4 h-4" />
                Hồ sơ cá nhân
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer p-0">
              <Link href="/app/settings" className="flex items-center gap-2 w-full px-2 py-1.5">
                <Settings className="w-4 h-4" />
                Cài đặt hệ thống
              </Link>
            </DropdownMenuItem>
            <div className="h-px bg-slate-100 my-1" />
            <DropdownMenuItem 
              onClick={() => logout.mutate()}
              className="flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
