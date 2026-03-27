'use client'

import { ChevronsUpDown, Building, Check } from 'lucide-react'
import { useWorkspaceStore } from '@/components/providers/workspace-store-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function WorkspaceSwitcher() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)
  const workspaces = useWorkspaceStore((state) => state.workspaces)
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace)

  if (!activeWorkspace) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 hover:bg-secondary text-secondary-foreground text-sm font-medium border border-border/50 shadow-sm transition-colors outline-none cursor-pointer" />}>
        <div className="flex bg-primary size-5 rounded-[4px] items-center justify-center text-[10px] uppercase font-bold text-primary-foreground shadow-sm">
          {activeWorkspace.name.charAt(0)}
        </div>
        <span className="truncate max-w-[140px] hidden sm:inline-block">
          {activeWorkspace.name}
        </span>
        <ChevronsUpDown className="size-3.5 text-muted-foreground ml-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px] mt-1">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Seus Workspaces
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => setActiveWorkspace(ws)}
              className="flex items-center justify-between cursor-pointer py-2 focus:bg-sidebar-accent"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Building className="size-4 text-muted-foreground shrink-0" />
                <span className="truncate font-medium">{ws.name}</span>
              </div>
              {ws.id === activeWorkspace.id && (
                <Check className="size-4 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
