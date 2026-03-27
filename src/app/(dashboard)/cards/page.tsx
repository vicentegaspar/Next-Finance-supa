import { Suspense } from 'react'
import { CardsList } from '@/components/cards/CardsList'

export default function CardsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Cartões de Crédito</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gere as faturas e acompanhe seus limites operacionais sem sustos.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Procurando no bolso...</div>}>
          <CardsList />
        </Suspense>
      </div>
    </div>
  )
}
