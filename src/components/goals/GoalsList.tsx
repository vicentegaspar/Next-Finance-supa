'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWorkspaceStore } from '@/components/providers/workspace-store-provider'
import { Database } from '@/types/supabase'
import { getGoals } from '@/actions/goals'
import { GoalFormModal } from './GoalFormModal'
import { Target, Loader2, Rocket, Calendar, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

type Goal = Database['public']['Tables']['goals']['Row']

export function GoalsList() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGoals = useCallback(async () => {
    if (!activeWorkspace) return
    try {
      setLoading(true)
      const data = await getGoals(activeWorkspace.id)
      setGoals(data || [])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }, [activeWorkspace])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  if (!activeWorkspace) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const getProgress = (current: number, target: number) => {
    if (target <= 0) return 0
    const val = (current / target) * 100
    return val > 100 ? 100 : val
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-b-xl">
      <div className="p-4 border-b border-border flex items-center justify-between gap-3 shrink-0">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          Meus Objetivos
        </h2>
        <GoalFormModal onCreated={fetchGoals} />
      </div>

      <div className="p-6 overflow-auto flex-1 h-full">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-6 animate-spin mr-2 text-primary" /> Carregando metas...
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg bg-muted/20">
            <Rocket className="size-10 mx-auto mb-3 opacity-20" />
             <p>Você ainda não definiu nenhuma meta neste Contexto.</p>
             <p className="text-sm mt-1">Sonhe grande! Crie sua primeira meta financeira.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const progressPct = getProgress(Number(goal.current_amount), Number(goal.target_amount))
              const isCompleted = progressPct >= 100

              return (
                <Card key={goal.id} className="relative overflow-hidden border-border/70 hover:border-primary/40 transition-colors bg-card/60 backdrop-blur-sm shadow-sm group">
                  <div className={`absolute top-0 left-0 w-1 h-full ${isCompleted ? 'bg-chart-2' : 'bg-primary/50 group-hover:bg-primary transition-colors'}`} />
                  <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 pl-6">
                    <div className="flex items-center gap-3 w-full justify-between">
                      <CardTitle className="text-lg tracking-tight font-heading">{goal.name}</CardTitle>
                      {isCompleted ? (
                        <div className="px-2 py-1 rounded bg-chart-2/20 text-chart-2 text-[10px] font-bold uppercase tracking-wider">
                          Alcançada
                        </div>
                      ) : (
                        <div className="p-1.5 bg-sidebar rounded-full shadow-sm border border-border/50 text-muted-foreground">
                          <Target className="size-4" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pl-6 pb-4">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <span className="text-2xl font-bold font-heading">{formatCurrency(Number(goal.current_amount))}</span>
                        <span className="text-sm text-muted-foreground block">
                          de {formatCurrency(Number(goal.target_amount))}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold font-heading text-primary">{progressPct.toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    <Progress value={progressPct} className="h-2 rounded-full w-full bg-sidebar-accent" />
                    
                    <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground font-medium">
                      {goal.target_date ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3" />
                          <span>Alvo: {new Date(goal.target_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="size-3" />
                          <span>Sem data limite definida</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
