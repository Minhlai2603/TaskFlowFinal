'use client';

import { Sidebar } from '@/features/ui/components/Sidebar';
import { TopBar } from '@/features/ui/components/TopBar';
import { CreateTaskModal } from '@/features/tasks/components/CreateTaskModal';
import { CreateProjectModal } from '@/features/projects/components/CreateProjectModal';
import { TaskSlideOver } from '@/features/tasks/components/TaskSlideOver';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative custom-scrollbar">
          {children}
        </main>
      </div>

      {/* Global Components */}
      <CreateTaskModal />
      <CreateProjectModal />
      <TaskSlideOver />
    </div>
  );
}
