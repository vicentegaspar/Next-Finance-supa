'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWorkspaceStore } from '@/components/providers/workspace-store-provider'
import { Database } from '@/types/supabase'
import { getCreditCards } from '@/actions/cards'
import { CardFormModal } from './CardFormModal'
import { CreditCard, Loader2, Landmark, AlertCircle, CalendarClock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

type CreditCardType = Database['public']['Tables']['credit_cards']['Row']

export function CardsList() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)
  const [cards, setCards] = useState<CreditCardType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCards = useCallback(async () => {
    if (!activeWorkspace) return
    try {
      setLoading(true)
      const data = await getCreditCards(activeWorkspace.id)
      setCards(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [activeWorkspace])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  if (!activeWorkspace) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const getProgress = (used: number, total: number) => {
    if (total <= 0) return 0
    const val = (used / total) * 100
    return val > 100 ? 100 : val
  }

  const getProgressColor = (pct: number) => {
    if (pct < 50) return "bg-primary"
    if (pct < 85) return "bg-chart-3" // Yellow/Orange
    return "bg-destructive" // Red 
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-b-xl">
      <div className="p-4 border-b border-border flex items-center justify-between gap-3 shrink-0">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          Cartões de Crédito
        </h2>
        <CardFormModal onCreated={fetchCards} />
      </div>

      <div className="p-6 overflow-auto flex-1 h-full">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-6 animate-spin mr-2 text-primary" /> Carregando seus cartões...
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg bg-muted/20">
            <Landmark className="size-10 mx-auto mb-3 opacity-20" />
             <p>Nenhum cartão cadastrado neste Workspace.</p>
             <p className="text-sm mt-1">Adicione seus cartões para gerenciar top limites e faturas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((card) => {
              const used = Number(card.used_limit)
              const total = Number(card.total_limit)
              const available = total - used
              const progressPct = getProgress(used, total)

              return (
                <Card key={card.id} className="relative overflow-hidden border-border hover:border-border/80 transition-all bg-gradient-to-br from-card to-card/50 shadow-sm group">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-primary/10`} />
                  <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <CreditCard className="size-5" />
                      </div>
                      <CardTitle className="text-lg tracking-tight font-heading">{card.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 mt-2">
                      <span className="text-sm text-muted-foreground mb-1 block">Fatura Parcial</span>
                      <div className="text-3xl font-bold font-heading text-foreground">
                        {formatCurrency(used)}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 mb-5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground">Limite disponível</span>
                        <span className="text-foreground">{formatCurrency(available)}</span>
                      </div>
                      <Progress value={progressPct} indicatorClassName={getProgressColor(progressPct)} className="h-1.5 rounded-full w-full bg-secondary" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1 text-[10px] opacity-70">
                        <span>R$ 0</span>
                        <span>{formatCurrency(total)} Total</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                      <div className="flex items-start gap-2">
                         <AlertCircle className="size-3.5 text-muted-foreground mt-0.5" />
                         <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Fechamento</p>
                            <p className="text-sm font-medium">Dia {card.closing_day}</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-2">
                         <CalendarClock className="size-3.5 text-muted-foreground mt-0.5" />
                         <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Vencimento</p>
                            <p className="text-sm font-medium">Dia {card.due_day}</p>
                         </div>
                      </div>
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
