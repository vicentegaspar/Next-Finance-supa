'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calculator, BarChart3, TrendingUp } from 'lucide-react'
import { InvestmentScenario, InvestmentScenarioItem } from './InvestmentScenarioItem'
import { InvestmentGrowthChart } from './InvestmentGrowthChart'

const generateId = () => Math.random().toString(36).substring(2, 9)

const COLORS = [
  '#22c55e', // Emerald
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#f59e0b', // Amber
  '#ef4444', // Red
]

export function InvestmentCalculator() {
  const [scenarios, setScenarios] = useState<InvestmentScenario[]>([
    {
      id: 'sc-1',
      name: 'Simulação 1',
      initialInvestment: 10000,
      monthlyContribution: 1000,
      annualReturnRate: 10,
      color: COLORS[0],
    },
    {
      id: 'sc-2',
      name: 'Simulação 2',
      initialInvestment: 10000,
      monthlyContribution: 1000,
      annualReturnRate: 12,
      color: COLORS[1],
    },
  ])

  const addScenario = () => {
    if (scenarios.length >= 5) return
    
    const newId = generateId()
    setScenarios([
      ...scenarios,
      {
        id: newId,
        name: `Cenário ${scenarios.length + 1}`,
        initialInvestment: 10000,
        monthlyContribution: 1000,
        annualReturnRate: 8,
        color: COLORS[scenarios.length % COLORS.length],
      },
    ])
  }

  const removeScenario = (id: string) => {
    if (scenarios.length <= 1) return
    setScenarios(scenarios.filter((s) => s.id !== id))
  }

  const updateScenario = (id: string, updates: Partial<InvestmentScenario>) => {
    setScenarios(scenarios.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calculator className="size-5 text-primary" />
              Configuração
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={addScenario}
              disabled={scenarios.length >= 5}
              className="h-8 gap-1 border-primary/20 hover:border-primary/50 text-xs"
            >
              <Plus className="size-3" />
              Novo Cenário
            </Button>
          </div>

          <div className="space-y-3">
            {scenarios.map((scenario) => (
              <InvestmentScenarioItem
                key={scenario.id}
                scenario={scenario}
                onChange={updateScenario}
                onRemove={removeScenario}
                isRemovable={scenarios.length > 1}
              />
            ))}
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary/80 uppercase">Poder dos Juros Compostos</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Pequenas diferenças em rentabilidade ou aportes podem gerar um impacto massivo no longo prazo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full border-border/40 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-heading flex items-center gap-2">
                    <BarChart3 className="size-5 text-primary" />
                    Evolução Patrimonial
                  </CardTitle>
                  <CardDescription>
                    Projeção estimada de crescimento ao longo do tempo.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <InvestmentGrowthChart scenarios={scenarios} />
              
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[5, 10, 25, 50].map((year) => (
                  <div key={year} className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center hover:bg-muted/50 transition-colors">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">{year} Anos</p>
                    <div className="mt-2 space-y-1.5">
                      {scenarios.map((s) => {
                         const monthlyRate = Math.pow(1 + s.annualReturnRate / 100, 1 / 12) - 1
                         let val = s.initialInvestment
                         for (let m = 0; m < year * 12; m++) {
                           val = val * (1 + monthlyRate) + s.monthlyContribution
                         }
                         const principal = s.initialInvestment + (s.monthlyContribution * year * 12)
                         const profit = val - principal
                         
                         return (
                           <div key={s.id} className="flex flex-col items-center">
                             <p className="text-xs font-mono font-bold" style={{ color: s.color }}>
                               {new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(val)}
                             </p>
                             {year >= 25 && (
                               <p className="text-[9px] text-muted-foreground font-medium">
                                 +{new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(profit)} lucro
                               </p>
                             )}
                           </div>
                         )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
