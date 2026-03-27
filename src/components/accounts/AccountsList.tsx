'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWorkspaceStore } from '@/components/providers/workspace-store-provider'
import { Database } from '@/types/supabase'
import { getAccounts } from '@/actions/accounts'
import { AccountFormModal } from './AccountFormModal'
import { Landmark, Wallet, PiggyBank, TrendingUp, Loader2, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

type Account = Database['public']['Tables']['accounts']['Row']

export function AccountsList() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAccounts = useCallback(async () => {
    if (!activeWorkspace) return
    try {
      setLoading(true)
      const data = await getAccounts(activeWorkspace.id)
      setAccounts(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeWorkspace])

  // Fetch or re-fetch on workspace change
  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  if (!activeWorkspace) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'checking': return <Landmark className="size-5 text-primary" />
      case 'savings': return <PiggyBank className="size-5 text-chart-2" />
      case 'investment': return <TrendingUp className="size-5 text-chart-3" />
      case 'wallet': return <Wallet className="size-5 text-muted-foreground" />
      default: return <Landmark className="size-5 text-primary" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'checking': return 'Conta Corrente'
      case 'savings': return 'Poupança'
      case 'investment': return 'Investimentos'
      case 'wallet': return 'Carteira Física'
      default: return 'Conta'
    }
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-b-xl">
      <div className="p-4 border-b border-border flex items-center justify-between gap-3 shrink-0">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          Suas Prateleiras Financeiras
        </h2>
        <AccountFormModal onCreated={fetchAccounts} />
      </div>

      <div className="p-6 overflow-auto flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-6 animate-spin mr-2 text-primary" /> Carregando contas...
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg bg-muted/20">
            <Landmark className="size-10 mx-auto mb-3 opacity-20" />
            <p>Nenhuma conta criada ainda neste Workspace.</p>
            <p className="text-sm mt-1">Comece vinculando ou registrando o saldo da sua Corrente Física principal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {accounts.map((acc) => (
              <Card key={acc.id} className="group hover:-translate-y-1 hover:shadow-md transition-all duration-300 border-border/70 hover:border-primary/40 bg-card/60 backdrop-blur-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sidebar rounded-lg shadow-sm border border-border/30">
                      {getIcon(acc.type)}
                    </div>
                    <div>
                      <CardTitle className="text-base tracking-tight">{acc.name}</CardTitle>
                      <span className="text-xs text-muted-foreground inline-block mt-0.5">
                        {getTypeLabel(acc.type)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-heading truncate" title={formatCurrency(Number(acc.balance))}>
                    {formatCurrency(Number(acc.balance))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-end">
                  <span className="text-xs font-medium text-primary hover:underline cursor-pointer flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver detalhes <ArrowRight className="size-3" />
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
