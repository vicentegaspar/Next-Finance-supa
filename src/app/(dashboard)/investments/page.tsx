import { Suspense } from 'react'
import { InvestmentsList } from '@/components/investments/InvestmentsList'
import { InvestmentCalculator } from '@/components/investments/InvestmentCalculator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, PieChart } from 'lucide-react'

export default function InvestmentsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Investimentos</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gerencie seu portfólio e simule a evolução do seu patrimônio.</p>
        </div>
      </div>

      <Tabs defaultValue="portfolio" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-muted/50 p-1 mb-6 self-start">
          <TabsTrigger value="portfolio" className="gap-2 data-[state=active]:bg-background">
            <PieChart className="size-4" />
            Minha Carteira
          </TabsTrigger>
          <TabsTrigger value="calculator" className="gap-2 data-[state=active]:bg-background">
            <TrendingUp className="size-4" />
            Simulador de Futuro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="flex-1 flex flex-col min-h-0 mt-0">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
            <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Abraçando os gráficos...</div>}>
              <InvestmentsList />
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="calculator" className="flex-1 overflow-auto mt-0 pr-1">
          <div className="animate-in slide-in-from-bottom-2 duration-500">
            <InvestmentCalculator />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
