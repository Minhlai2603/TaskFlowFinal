'use client';

import { useParams } from 'next/navigation';
import { useProject } from '@/features/projects/hooks/useProjects';
import { KanbanBoard } from '@/features/kanban/components/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Plus, Archive, Settings, MoreVertical, Loader2, AlertCircle } from 'lucide-react';
import { uiStore } from '@/features/ui/stores/uiStore';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const { project, isLoading: projectLoading } = useProject(id);
  const { tasks, isLoading: tasksLoading } = useTasks(id);
  const { openCreateTask } = uiStore();

  if (projectLoading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  if (!project) return <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2"><AlertCircle className="w-12 h-12" /> <p>Dự án không tồn tại</p></div>;

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'DONE').length;
  const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;
  const isArchived = !!project.archived_at;

  return (
    <div className="space-y-6 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <TooltipProvider>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
              {isArchived && (
                <Badge variant="secondary" className="bg-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  Archived
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex-1 max-w-xs space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Tiến độ dự án</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-slate-200" />
              </div>
              <div className="flex gap-4 border-l border-slate-200 pl-6">
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase">Tasks</p>
                  <p className="text-lg font-bold text-slate-900">{totalTasks}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase">Done</p>
                  <p className="text-lg font-bold text-indigo-600">{doneTasks}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 border-slate-200 text-slate-600">
              <Settings className="w-4 h-4 mr-2" />
              Cài đặt
            </Button>
            
            {isArchived ? (
              <Tooltip>
                <TooltipTrigger>
                  <div className="cursor-not-allowed">
                    <Button 
                      disabled
                      className="h-9 bg-slate-200 text-slate-500"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo Task
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Project đã lưu trữ, không thể tạo task mới</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button 
                onClick={openCreateTask}
                className="h-9 bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo Task
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Description Section */}
        {project.description && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-600 leading-relaxed max-w-3xl">
            {project.description}
          </div>
        )}

        {/* Kanban Section */}
        <div className="flex-1 min-h-0 pt-4">
          <KanbanBoard filters={{ projectId: id }} />
        </div>
      </TooltipProvider>
    </div>
  );
}
