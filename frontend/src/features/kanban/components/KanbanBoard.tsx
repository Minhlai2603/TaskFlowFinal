'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent, 
  DragEndEvent,
  closestCorners
} from '@dnd-kit/core';
import { Task, TaskStatus } from '@/features/tasks/api';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { useKanbanTasks } from '../hooks/useKanbanTasks';

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'TO_DO', title: 'Cần làm' },
  { id: 'IN_PROGRESS', title: 'Đang làm' },
  { id: 'IN_REVIEW', title: 'Đang xem xét' },
  { id: 'DONE', title: 'Hoàn thành' },
];

interface KanbanBoardProps {
  filters: any;
}

export function KanbanBoard({ filters }: KanbanBoardProps) {
  const apiFilters = {
    projectId: filters?.projectId && filters.projectId !== 'all' ? filters.projectId : undefined,
    assigneeId: filters?.assigneeId && filters.assigneeId !== 'all' ? filters.assigneeId : undefined,
    priority: filters?.priority && filters.priority !== 'all' ? filters.priority : undefined,
    q: filters?.search || filters?.q || undefined,
    due_date_start: filters?.due_date_start,
    due_date_end: filters?.due_date_end,
  };

  const { tasks, updateTask, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useKanbanTasks(apiFilters);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      updateTask.mutate({ id: taskId, data: { status: newStatus } });
    }

    setActiveTask(null);
  };

  if (isLoading) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-12rem)]">
        {COLUMNS.map((col) => (
          <div key={col.id} className="w-72 min-w-[280px] bg-slate-50 rounded-xl p-3 h-full animate-pulse">
            <div className="h-6 w-24 bg-slate-200 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-24 bg-slate-200 rounded-lg" />
              <div className="h-24 bg-slate-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-12rem)] min-h-[500px] custom-scrollbar">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="flex flex-col">
              <KanbanColumn 
                id={col.id} 
                title={col.title} 
                tasks={columnTasks} 
                count={columnTasks.length}
              />
              {/* Intersection observer target for each column to trigger load more if needed, though usually at the board level. We place one at the end of the board here */}
            </div>
          );
        })}
        {hasNextPage && (
          <div ref={observerTarget} className="w-4 h-full flex items-center justify-center">
            {isFetchingNextPage && <span className="animate-spin h-4 w-4 border-2 border-slate-500 rounded-full border-t-transparent" />}
          </div>
        )}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-72 rotate-3 shadow-xl">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
