import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
}

interface AuthState {
  user: User | null;
  workspaceId: string | null;
  workspaceRole: 'ADMIN' | 'MANAGER' | 'MEMBER' | null;
  /** Danh sách tất cả workspaces mà user thuộc về */
  workspaces: WorkspaceInfo[];
  setAuth: (
    user: User,
    workspaceId: string,
    workspaceRole: 'ADMIN' | 'MANAGER' | 'MEMBER',
    workspaces?: WorkspaceInfo[]
  ) => void;
  /** Chuyển đổi active workspace mà không cần re-login */
  switchWorkspace: (workspaceId: string, workspaceRole: 'ADMIN' | 'MANAGER' | 'MEMBER') => void;
  /** Cập nhật danh sách workspaces (dùng khi accept invite) */
  setWorkspaces: (workspaces: WorkspaceInfo[]) => void;
  logout: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      workspaceId: null,
      workspaceRole: null,
      workspaces: [],
      setAuth: (user, workspaceId, workspaceRole, workspaces = []) =>
        set({ user, workspaceId, workspaceRole, workspaces }),
      switchWorkspace: (workspaceId, workspaceRole) =>
        set({ workspaceId, workspaceRole }),
      setWorkspaces: (workspaces) => set({ workspaces }),
      logout: () => {
        set({ user: null, workspaceId: null, workspaceRole: null, workspaces: [] });
        localStorage.setItem('logout-event', Date.now().toString());
        localStorage.removeItem('logout-event');
      },
    }),
    {
      name: 'taskflow-auth',
    }
  )
);
