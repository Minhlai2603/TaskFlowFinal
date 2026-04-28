'use client';

import { useDroppable } from '@dnd-kit/core';
import { Task, TaskStatus } from '@/features/tasks/api';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';
import { Plus, MoreHorizontal } from 'lucide-react';
import { uiStore } from '@/features/ui/stores/uiStore';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  count: number;
}

export function KanbanColumn({ id, title, tasks, count }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const { openCreateTask } = uiStore();

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-72 min-w-[280px] bg-slate-100/50 rounded-xl p-3 h-full transition-colors duration-200",
        isOver && "bg-indigo-50/50 ring-2 ring-indigo-200"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-700">{title}</h2>
          <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={openCreateTask}
            className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-500"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-500">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && !isOver && (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 opacity-50">
            <p className="text-[10px] font-medium text-slate-400">Chưa có task</p>
          </div>
        )}
      </div>
    </div>
  );
}
