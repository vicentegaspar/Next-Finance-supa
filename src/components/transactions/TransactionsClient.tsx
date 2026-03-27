'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWorkspaceStore } from '@/components/providers/workspace-store-provider'
import { Database } from '@/types/supabase'
import { getTransactions } from '@/actions/transactions'
import { TransactionFormModal } from './TransactionFormModal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft, Search, Filter, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Transaction = Database['public']['Tables']['transactions']['Row']

export function TransactionsClient() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)
  const [searchTerm, setSearchTerm] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = useCallback(async () => {
    if (!activeWorkspace) return
    try {
      setLoading(true)
      const data = await getTransactions(activeWorkspace.id)
      setTransactions(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeWorkspace])

  // Refetch when switching workspaces
  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  if (!activeWorkspace) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const filteredTransactions = transactions.filter(tx => 
    (tx.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-card/50">
      <div className="p-4 border-b border-border flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar transações..." 
              className="pl-9 bg-background border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2 bg-background border-border hidden sm:flex">
            <Filter className="size-4" />
            <span className="font-medium">Filtros</span>
          </Button>
        </div>
        
        {/* Pass the callback to the modal so it refreshes the list on success */}
        <TransactionFormModal onTransactionCreated={fetchTransactions} />
      </div>

      <div className="overflow-auto flex-1 h-full">
        <Table>
          <TableHeader className="bg-sidebar/50 sticky top-0 z-10 backdrop-blur-md">
            <TableRow className="border-border">
              <TableHead className="w-[120px] font-medium text-foreground">Data</TableHead>
              <TableHead className="font-medium text-foreground">Descrição</TableHead>
              <TableHead className="font-medium text-foreground">Categoria</TableHead>
              <TableHead className="font-medium text-foreground">Status</TableHead>
              <TableHead className="text-right font-medium text-foreground">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin size-5" /> Carregando transações...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Nenhuma transação encontrada neste Workspace. Comece clicando em "Nova Transação".
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id} className="cursor-pointer hover:bg-muted/30 border-border/50">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {tx.type === 'income' && <ArrowUpRight className="size-4 text-chart-2" />}
                      {tx.type === 'expense' && <ArrowDownRight className="size-4 text-destructive" />}
                      {tx.type === 'transfer' && <ArrowRightLeft className="size-4 text-primary" />}
                      {tx.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-sm font-normal text-xs bg-sidebar/50 text-foreground border-border/60">
                      Sem categoria
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tx.status === 'completed' ? (
                      <Badge className="bg-chart-2/15 text-chart-2 hover:bg-chart-2/25 border-none rounded-sm font-normal">
                        Efetivada
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-sm font-normal text-muted-foreground bg-muted/50 hover:bg-muted">
                        Pendente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${tx.type === 'income' ? 'text-chart-2' : tx.type === 'expense' ? 'text-foreground' : 'text-primary'}`}>
                    {tx.type === 'expense' ? '-' : '+'} {formatCurrency(Number(tx.amount))}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
