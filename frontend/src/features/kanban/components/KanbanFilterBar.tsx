'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FolderKanban, Flag, Users } from 'lucide-react';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useWorkspace } from '@/features/workspaces/hooks/useWorkspace';
import { authStore } from '@/features/auth/stores/authStore';
import { useEffect, useState } from 'react';

interface KanbanFilterBarProps {
  filters: {
    projectId?: string;
    assigneeId?: string;
    priority?: string;
    q?: string;
    due_date_start?: string;
    due_date_end?: string;
  };
  onFilterChange: (key: string, value: string | null | undefined) => void;
}

export function KanbanFilterBar({ filters, onFilterChange }: KanbanFilterBarProps) {
  const workspaceId = authStore(state => state.workspaceId);
  const { projects } = useProjects();
  const { members } = useWorkspace(workspaceId || undefined);
  const [searchTerm, setSearchTerm] = useState(filters.q || '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('q', searchTerm || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, onFilterChange]);

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-slate-200/60 shadow-sm p-1.5 rounded-2xl flex flex-wrap items-center gap-2 transition-all hover:shadow-md mb-6">
      {/* Tìm kiếm */}
      <div className="relative group">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-500" />
        <Input 
          placeholder="Tìm kiếm công việc..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9 w-[180px] xl:w-[220px] pl-9 bg-white/50 border-transparent hover:bg-white focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all shadow-none"
        />
      </div>

      <div className="hidden sm:block w-px h-6 bg-slate-200/60 mx-1" />

      {/* Lọc Dự án */}
      <Select 
        value={filters.projectId || 'all'} 
        onValueChange={(val) => onFilterChange('projectId', val === 'all' ? undefined : val)}
      >
        <SelectTrigger className="h-9 w-[160px] bg-white/50 border-transparent hover:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all text-sm font-medium shadow-none">
          <div className="flex items-center gap-2 truncate">
            <FolderKanban className="w-4 h-4 text-slate-400 shrink-0" />
            <SelectValue placeholder="Tất cả dự án">
              {!filters.projectId || filters.projectId === 'all' 
                ? 'Tất cả dự án' 
                : projects?.find((p: any) => p.id === filters.projectId)?.name || 'Tất cả dự án'
              }
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl shadow-xl border-slate-100">
          <SelectItem value="all" className="font-medium">Tất cả dự án</SelectItem>
          {projects?.map((p: any) => (
            <SelectItem key={p.id} value={p.id}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: p.color }} />
                <span className="truncate">{p.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Lọc Người Phụ Trách */}
      <Select 
        value={filters.assigneeId || 'all'} 
        onValueChange={(val) => onFilterChange('assigneeId', val === 'all' ? undefined : val)}
      >
        <SelectTrigger className="h-9 w-[180px] bg-white/50 border-transparent hover:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all text-sm font-medium shadow-none">
          <div className="flex items-center gap-2 truncate">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            <SelectValue placeholder="Người phụ trách">
              {!filters.assigneeId || filters.assigneeId === 'all' 
                ? 'Tất cả thành viên' 
                : members?.find((m: any) => m.user.id === filters.assigneeId)?.user.name || 'Tất cả thành viên'
              }
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl shadow-xl border-slate-100">
          <SelectItem value="all" className="font-medium">Tất cả thành viên</SelectItem>
          {(members || []).map((m: any) => (
            <SelectItem key={m.id} value={m.user.id}>{m.user.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Lọc Ưu tiên */}
      <Select 
        value={filters.priority || 'all'} 
        onValueChange={(val) => onFilterChange('priority', val === 'all' ? undefined : val)}
      >
        <SelectTrigger className="h-9 w-[160px] bg-white/50 border-transparent hover:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all text-sm font-medium shadow-none">
          <div className="flex items-center gap-2 truncate">
            <Flag className="w-4 h-4 text-slate-400 shrink-0" />
            <SelectValue placeholder="Tất cả mức độ">
              {(!filters.priority || filters.priority === 'all') && 'Tất cả mức độ'}
              {filters.priority === 'LOW' && 'Thấp (Low)'}
              {filters.priority === 'MEDIUM' && 'Trung bình'}
              {filters.priority === 'HIGH' && 'Cao (High)'}
              {filters.priority === 'URGENT' && 'Khẩn cấp'}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl shadow-xl border-slate-100">
          <SelectItem value="all" className="font-medium">Tất cả mức độ</SelectItem>
          <SelectItem value="LOW">Thấp (Low)</SelectItem>
          <SelectItem value="MEDIUM">Trung bình (Medium)</SelectItem>
          <SelectItem value="HIGH">Cao (High)</SelectItem>
          <SelectItem value="URGENT">Khẩn cấp (Urgent)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
