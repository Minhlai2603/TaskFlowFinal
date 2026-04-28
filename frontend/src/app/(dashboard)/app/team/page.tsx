'use client';

import { useState } from 'react';
import { KanbanBoard } from '@/features/kanban/components/KanbanBoard';
import { KanbanFilterBar } from '@/features/kanban/components/KanbanFilterBar';
import { GetTasksParams } from '@/features/tasks/api';
import { authStore } from '@/features/auth/stores/authStore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function TeamPage() {
  const [filters, setFilters] = useState<GetTasksParams>({});
  const { workspaceRole } = authStore();
  const canViewTeam = workspaceRole === 'ADMIN' || workspaceRole === 'MANAGER';

  if (!canViewTeam) {
    return (
      <div className="p-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Truy cập bị từ chối</AlertTitle>
          <AlertDescription>
            Bạn không có quyền xem bảng Kanban của team. Chỉ Admin và Manager mới có quyền truy cập.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleFilterChange = (key: string, value: string | null | undefined) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value || undefined };
      if (!value) {
        delete newFilters[key as keyof GetTasksParams];
      }
      return newFilters;
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Team Dashboard</h1>
        <p className="text-slate-500 mt-1">Quản lý và theo dõi tiến độ công việc của toàn bộ đội ngũ.</p>
      </div>

      <KanbanFilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      <div className="flex-1 min-h-0">
        <KanbanBoard filters={filters} />
      </div>
    </div>
  );
}
