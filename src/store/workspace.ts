import { createStore } from 'zustand'
import { Database } from '@/types/supabase'

type Workspace = Database['public']['Tables']['workspaces']['Row']

export interface WorkspaceState {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  setActiveWorkspace: (workspace: Workspace) => void
}

export type WorkspaceStore = ReturnType<typeof createWorkspaceStore>

export const createWorkspaceStore = (
  initProps?: Partial<WorkspaceState>
) => {
  return createStore<WorkspaceState>()((set) => ({
    workspaces: initProps?.workspaces || [],
    activeWorkspace: initProps?.activeWorkspace || null,
    setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
  }))
}
