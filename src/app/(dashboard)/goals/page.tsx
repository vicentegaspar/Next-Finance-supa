import { Suspense } from 'react'
import { GoalsList } from '@/components/goals/GoalsList'

export default function GoalsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Metas & Sonhos</h1>
          <p className="text-muted-foreground mt-1 text-sm">Acompanhe de forma visual o progresso percentual dos seus objetivos individuais.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando seus sonhos...</div>}>
          <GoalsList />
        </Suspense>
      </div>
    </div>
  )
}
