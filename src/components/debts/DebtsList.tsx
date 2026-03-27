'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useWorkspaceStore } from '@/components/providers/workspace-store-provider'
import { Database } from '@/types/supabase'
import { getDebts } from '@/actions/debts'
import { DebtFormModal } from './DebtFormModal'
import { Loader2, Wallet, ArrowDownToDot, ArrowUpFromDot } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

type DebtType = Database['public']['Tables']['debts']['Row']

export function DebtsList() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)
  const [debts, setDebts] = useState<DebtType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDebts = useCallback(async () => {
    if (!activeWorkspace) return
    try {
      setLoading(true)
      const data = await getDebts(activeWorkspace.id)
      setDebts(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [activeWorkspace])

  useEffect(() => {
    fetchDebts()
  }, [fetchDebts])

  const totals = useMemo(() => {
    let toPay = 0
    let toReceive = 0
    debts.forEach(d => {
      const remaining = Number(d.principal_amount) - Number(d.paid_amount)
      if (d.type === 'payable') toPay += remaining
      else toReceive += remaining
    })
    return { toPay, toReceive }
  }, [debts])

  if (!activeWorkspace) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const getProgress = (paid: number, total: number) => {
    if (total <= 0) return 0
    const val = (paid / total) * 100
    return val > 100 ? 100 : val
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-b-xl">
      <div className="p-4 border-b border-border flex items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            Controle de Dívidas
          </h2>
          {debts.length > 0 && !loading && (
             <div className="flex gap-4 mt-1 text-sm font-medium">
               <span className="text-destructive flex items-center gap-1"><ArrowDownToDot className="size-3"/> A Pagar: {formatCurrency(totals.toPay)}</span>
               <span className="text-chart-2 flex items-center gap-1"><ArrowUpFromDot className="size-3"/> A Receber: {formatCurrency(totals.toReceive)}</span>
             </div>
          )}
        </div>
        <DebtFormModal onCreated={fetchDebts} />
      </div>

      <div className="p-6 overflow-auto flex-1 h-full">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-6 animate-spin mr-2 text-primary" /> Carregando compromissos...
          </div>
        ) : debts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg bg-muted/20">
            <Wallet className="size-10 mx-auto mb-3 opacity-20" />
             <p>Você não tem dívidas cadastradas neste Workspace.</p>
             <p className="text-sm mt-1">Ótima notícia! Ou apenas adicione o dinheiro que te devem.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {debts.map((debt) => {
              const isPayable = debt.type === 'payable'
              const primaryColor = isPayable ? 'text-destructive' : 'text-chart-2'
              const bgColor = isPayable ? 'bg-destructive/10' : 'bg-chart-2/10'
              const total = Number(debt.principal_amount)
              const paid = Number(debt.paid_amount)
              const remaining = total - paid
              const progressPct = getProgress(paid, total)

              return (
                <Card key={debt.id} className="relative overflow-hidden border-border/70 hover:border-primary/40 transition-colors shadow-sm bg-card/60 backdrop-blur-sm group">
                   <div className={`absolute top-0 right-0 w-1.5 h-full ${isPayable ? 'bg-destructive/60' : 'bg-chart-2/60'}`} />
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-lg tracking-tight font-heading mb-1">{debt.name}</CardTitle>
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${primaryColor} px-2 py-0.5 rounded-sm ${bgColor}`}>
                        {isPayable ? 'Obrigação' : 'Direito'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <span className="text-sm text-muted-foreground block mb-0.5">Saldo Restante</span>
                        <span className={`text-2xl font-bold font-heading ${primaryColor}`}>
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold font-heading text-foreground">{progressPct.toFixed(0)}%</span>
                        <span className="text-[10px] text-muted-foreground block uppercase font-medium">Concluído</span>
                      </div>
                    </div>
                    
                    <Progress value={progressPct} indicatorClassName={isPayable ? "bg-destructive" : "bg-chart-2"} className="h-1.5 rounded-full w-full bg-secondary" />
                    
                    <div className="flex justify-between items-center mt-3 text-[11px] text-muted-foreground font-medium">
                      <span>Total: {formatCurrency(total)}</span>
                      {debt.due_date && (
                        <span>Vence: {new Date(debt.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
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
