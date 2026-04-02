import { ReportsManager } from '@/components/reports/ReportsManager'

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Relatórios e Exportação</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gere balancetes mensais e anuais em PDF ou exporte seus dados para planilhas.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <ReportsManager />
      </div>
    </div>
  )
}
