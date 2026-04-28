'use client';

import { useState } from 'react';
import { KanbanBoard } from '@/features/kanban/components/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { Plus, Search, FolderKanban, Flag } from 'lucide-react';
import { uiStore } from '@/features/ui/stores/uiStore';
import { authStore } from '@/features/auth/stores/authStore';

export default function MyTasksPage() {
  const { openCreateTask } = uiStore();
  const { projects } = useProjects();
  const { user } = authStore();
  
  const [filters, setFilters] = useState({
    projectId: 'all',
    priority: 'all',
    search: ''
  });

  // Luôn filter theo assigneeId của user hiện tại — trang "Công việc của tôi"
  const myTaskFilters = {
    ...filters,
    assigneeId: user?.id,
  };

  return (
    <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Công việc của tôi</h1>
          <p className="text-sm text-slate-500">Quản lý và theo dõi tất cả các đầu việc được giao.</p>
        </div>
        
        <div className="bg-white/60 backdrop-blur-xl border border-slate-200/60 shadow-sm p-1.5 rounded-2xl flex flex-wrap items-center gap-2 transition-all hover:shadow-md">
          {/* Tìm kiếm */}
          <div className="relative group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-500" />
            <Input 
              placeholder="Tìm kiếm task..." 
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="h-9 w-[180px] xl:w-[220px] pl-9 bg-white/50 border-transparent hover:bg-white focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all shadow-none"
            />
          </div>

          <div className="hidden sm:block w-px h-6 bg-slate-200/60 mx-1" />

          {/* Lọc Dự án */}
          <Select value={filters.projectId} onValueChange={(val) => setFilters({...filters, projectId: val as string})}>
            <SelectTrigger className="h-9 w-[160px] bg-white/50 border-transparent hover:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all text-sm font-medium shadow-none">
              <div className="flex items-center gap-2 truncate">
                <FolderKanban className="w-4 h-4 text-slate-400 shrink-0" />
                <SelectValue placeholder="Tất cả dự án">
                  {filters.projectId === 'all' 
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

          {/* Lọc Ưu tiên */}
          <Select value={filters.priority} onValueChange={(val) => setFilters({...filters, priority: val as string})}>
            <SelectTrigger className="h-9 w-[160px] bg-white/50 border-transparent hover:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all text-sm font-medium shadow-none">
              <div className="flex items-center gap-2 truncate">
                <Flag className="w-4 h-4 text-slate-400 shrink-0" />
                <SelectValue placeholder="Tất cả mức độ">
                  {filters.priority === 'all' && 'Tất cả mức độ'}
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

          <Button 
            onClick={openCreateTask}
            className="h-9 ml-auto sm:ml-2 bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-sm shadow-indigo-600/20 rounded-xl px-4 font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tạo Task
          </Button>
        </div>
      </div>

      {/* Board Area */}
      <div className="flex-1 min-h-0">
        <KanbanBoard filters={myTaskFilters} />
      </div>
    </div>
  );
}
