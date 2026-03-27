'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'
import { createWorkspaceStore, WorkspaceStore, WorkspaceState } from '@/store/workspace'
import { Database } from '@/types/supabase'

type Workspace = Database['public']['Tables']['workspaces']['Row']

export const WorkspaceStoreContext = createContext<WorkspaceStore | null>(null)

export interface WorkspaceStoreProviderProps {
  children: ReactNode
  workspaces: Workspace[]
  initialWorkspace: Workspace
}

export const WorkspaceStoreProvider = ({
  children,
  workspaces,
  initialWorkspace,
}: WorkspaceStoreProviderProps) => {
  const storeRef = useRef<WorkspaceStore>(null)
  
  if (!storeRef.current) {
    storeRef.current = createWorkspaceStore({ 
      workspaces, 
      activeWorkspace: initialWorkspace 
    })
  }

  return (
    <WorkspaceStoreContext.Provider value={storeRef.current}>
      {children}
    </WorkspaceStoreContext.Provider>
  )
}

export function useWorkspaceStore<T>(selector: (state: WorkspaceState) => T): T {
  const store = useContext(WorkspaceStoreContext)
  if (!store) {
    throw new Error(`useWorkspaceStore must be used within WorkspaceStoreProvider`)
  }
  return useStore(store, selector)
}
