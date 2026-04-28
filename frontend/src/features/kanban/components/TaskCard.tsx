'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/features/tasks/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { uiStore } from '@/features/ui/stores/uiStore';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { openTaskSlideOver } = uiStore();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task,
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  const priorityColors = {
    LOW: 'bg-slate-100 text-slate-600',
    MEDIUM: 'bg-blue-100 text-blue-600',
    HIGH: 'bg-orange-100 text-orange-600',
    URGENT: 'bg-red-100 text-red-600',
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => openTaskSlideOver(task.id)}
      className={cn(
        "group hover:shadow-md transition-all duration-200 cursor-pointer border-slate-200 hover:border-indigo-300 active:scale-[0.98]",
        isDragging && "opacity-50 ring-2 ring-indigo-500 z-50"
      )}
    >
      <CardContent className="p-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge className={cn("text-[10px] px-1.5 py-0", priorityColors[task.priority])} variant="secondary">
            {task.priority}
          </Badge>
          <button className="text-slate-400 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-sm font-semibold text-slate-800 leading-tight line-clamp-2">
          {task.title}
        </h3>

        {task.project && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.project.color }} />
            <span className="text-[10px] text-slate-500 font-medium truncate">{task.project.name}</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            {task.due_date && (
              <div className="flex items-center gap-1 text-[10px]">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(task.due_date), 'dd MMM', { locale: vi })}</span>
              </div>
            )}
          </div>
          
          {task.assignee ? (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500 font-medium">{task.assignee.name.split(' ').pop()}</span>
              <div className="w-5 h-5 rounded-full bg-indigo-100 border border-white flex items-center justify-center text-[10px] font-bold text-indigo-600">
                {task.assignee.name.charAt(0)}
              </div>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border border-dashed border-slate-300 flex items-center justify-center">
              <User className="w-2.5 h-2.5 text-slate-300" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
