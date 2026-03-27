'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useWorkspaceStore } from '@/components/providers/workspace-store-provider'
import { Database } from '@/types/supabase'
import { getInvestments } from '@/actions/investments'
import { InvestmentFormModal } from './InvestmentFormModal'
import { Loader2, TrendingUp, Building2, Coins, Briefcase, Bitcoin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type InvestmentType = Database['public']['Tables']['investments']['Row']

export function InvestmentsList() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)
  const [investments, setInvestments] = useState<InvestmentType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInvestments = useCallback(async () => {
    if (!activeWorkspace) return
    try {
      setLoading(true)
      const data = await getInvestments(activeWorkspace.id)
      setInvestments(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [activeWorkspace])

  useEffect(() => {
    fetchInvestments()
  }, [fetchInvestments])

  const totalPosition = useMemo(() => {
    return investments.reduce((acc, curr) => acc + Number(curr.current_position), 0)
  }, [investments])

  if (!activeWorkspace) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'fixed_income': return <Building2 className="size-4" />;
      case 'variable_income': return <TrendingUp className="size-4" />;
      case 'funds': return <Briefcase className="size-4" />;
      case 'crypto': return <Bitcoin className="size-4" />;
      default: return <Coins className="size-4" />;
    }
  }

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'fixed_income': return 'Renda Fixa';
      case 'variable_income': return 'Renda Variável';
      case 'funds': return 'Fundos';
      case 'crypto': return 'Criptomoedas';
      case 'real_estate': return 'Imóveis';
      default: return type;
    }
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-b-xl">
      <div className="p-4 border-b border-border flex items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            Minha Carteira
          </h2>
          {investments.length > 0 && !loading && (
             <p className="text-sm font-medium text-muted-foreground mt-0.5">Total: <span className="text-foreground">{formatCurrency(totalPosition)}</span></p>
          )}
        </div>
        <InvestmentFormModal onCreated={fetchInvestments} />
      </div>

      <div className="p-6 overflow-auto flex-1 h-full">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-6 animate-spin mr-2 text-primary" /> Atualizando cotações...
          </div>
        ) : investments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg bg-muted/20">
            <TrendingUp className="size-10 mx-auto mb-3 opacity-20" />
             <p>Sua carteira está vazia neste Workspace.</p>
             <p className="text-sm mt-1">Comece investindo no seu futuro hoje.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {investments.map((inv) => {
              const position = Number(inv.current_position)
              const avg = Number(inv.average_price)

              return (
                <Card key={inv.id} className="border-border/50 hover:border-primary/30 transition-colors shadow-sm bg-card/40 hover:bg-card/70 backdrop-blur-sm">
                  <CardHeader className="pb-2 p-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {getTypeIcon(inv.type)}
                      <span className="text-xs font-semibold uppercase">{getTypeLabel(inv.type)}</span>
                    </div>
                    {inv.broker && (
                      <span className="text-[10px] px-2 py-0.5 rounded-sm bg-secondary text-secondary-foreground font-medium truncate max-w-[80px]">
                        {inv.broker}
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-1">
                    <CardTitle className="text-lg mb-4 font-heading">{inv.name}</CardTitle>
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Posição</span>
                        <span className="text-xl font-bold font-heading">{formatCurrency(position)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground block uppercase font-medium">Preço Médio</span>
                        <span className="text-sm font-semibold">{formatCurrency(avg)}</span>
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
