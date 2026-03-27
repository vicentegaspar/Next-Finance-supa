import { Suspense } from 'react'
import { TransactionsClient } from '@/components/transactions/TransactionsClient'

export default function TransactionsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Transações</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie suas receitas, despesas e transferências conectadas ao Supabase.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando transações...</div>}>
          <TransactionsClient />
        </Suspense>
      </div>
    </div>
  )
}
