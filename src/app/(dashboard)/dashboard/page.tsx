'use client'

import { signout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/components/providers/workspace-store-provider'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { LogOut } from 'lucide-react'

export default function DashboardPage() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)

  return (
    <div className="flex flex-col items-start gap-4 animate-in fade-in duration-500 max-w-6xl mx-auto w-full">
      <div className="pt-2 mb-2 w-full flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary mb-1">Visão Geral</h1>
          <p className="text-muted-foreground text-sm">
            Estatísticas ativas do contexto: <strong className="text-foreground">{activeWorkspace?.name}</strong>
          </p>
        </div>
        <form>
          <Button type="submit" formAction={signout} variant="outline" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 border-border shadow-sm">
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Desconectar Sessão</span>
          </Button>
        </form>
      </div>

      {/* Realtime Graphics Component */}
      <DashboardCharts />
    </div>
  )
}
