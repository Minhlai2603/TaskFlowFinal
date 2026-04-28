'use client';

import Link from 'next/link';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Plus, Folder, MoreVertical, Archive, Trash2, Loader2, ArrowUpRight } from 'lucide-react';
import { uiStore } from '@/features/ui/stores/uiStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function ProjectsPage() {
  const { projects, isLoading } = useProjects();
  const { openCreateProject } = uiStore();

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dự án</h1>
          <p className="text-sm text-slate-500">Tổ chức và quản lý các nhóm công việc theo dự án.</p>
        </div>
        <Button 
          onClick={openCreateProject}
          className="bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Dự án mới
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 overflow-hidden">
            <CardHeader className="pb-3 space-y-1">
              <div className="flex items-center justify-between">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner" 
                  style={{ backgroundColor: `${project.color}20`, color: project.color }}
                >
                  <Folder className="w-5 h-5" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-slate-100 text-slate-400 hover:text-slate-900 outline-none">
                    <MoreVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Archive className="w-4 h-4" /> Lưu trữ
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-50">
                      <Trash2 className="w-4 h-4" /> Xóa dự án
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="pt-2">
                <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors">
                  {project.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 min-h-[40px] mt-1">
                  {project.description || 'Không có mô tả cho dự án này.'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                    {project._count?.tasks || 0} tasks
                  </Badge>
                  {project.archived_at && (
                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                      Archived
                    </Badge>
                  )}
                </div>
                <Link 
                  href={`/app/projects/${project.id}`}
                  className="text-indigo-600 text-sm font-semibold flex items-center gap-1 hover:underline underline-offset-4"
                >
                  Chi tiết <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl gap-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <Folder className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Chưa có dự án nào</h3>
              <p className="text-sm text-slate-500 max-w-xs mt-1">
                Hãy tạo dự án đầu tiên để bắt đầu tổ chức công việc của bạn và team.
              </p>
            </div>
            <Button 
              onClick={openCreateProject}
              variant="outline"
              className="mt-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              Tạo dự án ngay
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
