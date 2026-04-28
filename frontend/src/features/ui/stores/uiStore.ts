import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  createTaskModalOpen: boolean;
  createProjectModalOpen: boolean;
  taskSlideOverId: string | null;
  toggleSidebar: () => void;
  openCreateTask: () => void;
  closeCreateTask: () => void;
  openCreateProject: () => void;
  closeCreateProject: () => void;
  openTaskSlideOver: (taskId: string) => void;
  closeTaskSlideOver: () => void;
}

export const uiStore = create<UIState>((set) => ({
  sidebarOpen: true,
  createTaskModalOpen: false,
  createProjectModalOpen: false,
  taskSlideOverId: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openCreateTask: () => set({ createTaskModalOpen: true }),
  closeCreateTask: () => set({ createTaskModalOpen: false }),
  openCreateProject: () => set({ createProjectModalOpen: true }),
  closeCreateProject: () => set({ createProjectModalOpen: false }),
  openTaskSlideOver: (taskId: string) => set({ taskSlideOverId: taskId }),
  closeTaskSlideOver: () => set({ taskSlideOverId: null }),
}));
