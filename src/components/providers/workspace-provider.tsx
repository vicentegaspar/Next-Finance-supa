import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkspaceStoreProvider } from './workspace-store-provider'

export async function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch workspaces (filtered automatically by RLS due to workspace_users table logic)
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: true })

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center p-8 min-h-screen text-muted-foreground bg-background">
        <p className="animate-pulse">Configurando seu Workspace inicial...</p>
        <p className="text-sm">Por favor, recarregue a página em instantes.</p>
      </div>
    )
  }

  return (
    <WorkspaceStoreProvider workspaces={workspaces} initialWorkspace={workspaces[0]}>
      {children}
    </WorkspaceStoreProvider>
  )
}
