'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InvestmentScenario {
  id: string
  name: string
  initialInvestment: number
  monthlyContribution: number
  annualReturnRate: number
  color: string
}

interface InvestmentScenarioItemProps {
  scenario: InvestmentScenario
  onChange: (id: string, updates: Partial<InvestmentScenario>) => void
  onRemove: (id: string) => void
  isRemovable: boolean
}

export function InvestmentScenarioItem({
  scenario,
  onChange,
  onRemove,
  isRemovable,
}: InvestmentScenarioItemProps) {
  return (
    <Card className="border-border/40 bg-card/30 backdrop-blur-sm relative overflow-hidden group">
      <div 
        className="absolute left-0 top-0 bottom-0 w-1" 
        style={{ backgroundColor: scenario.color }}
      />
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <Input
              value={scenario.name}
              onChange={(e) => onChange(scenario.id, { name: e.target.value })}
              className="h-8 font-semibold bg-transparent border-none px-0 focus-visible:ring-0 text-primary"
              placeholder="Nome do Cenário"
            />
          </div>
          {isRemovable && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(scenario.id)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Inicial (R$)
            </Label>
            <Input
              type="number"
              value={scenario.initialInvestment}
              onChange={(e) => onChange(scenario.id, { initialInvestment: Number(e.target.value) })}
              className="h-9 bg-muted/20 border-border/50 focus:border-primary/50 transition-all font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Mensal (R$)
            </Label>
            <Input
              type="number"
              value={scenario.monthlyContribution}
              onChange={(e) => onChange(scenario.id, { monthlyContribution: Number(e.target.value) })}
              className="h-9 bg-muted/20 border-border/50 focus:border-primary/50 transition-all font-mono"
            />
          </div>
          <div className="space-y-1.5 flex flex-col">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Rentabilidade (% aa)
            </Label>
            <div className="flex gap-1.5 flex-1">
              <Input
                type="number"
                step="0.1"
                value={scenario.annualReturnRate}
                onChange={(e) => onChange(scenario.id, { annualReturnRate: Number(e.target.value) })}
                className="h-9 bg-muted/20 border-border/50 focus:border-primary/50 transition-all font-mono"
              />
              <div className="flex flex-col gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="size-4 text-[8px] font-bold opacity-50 hover:opacity-100"
                  onClick={() => onChange(scenario.id, { annualReturnRate: 10.75, name: scenario.name.includes('Simulação') ? 'Selic (CDI)' : scenario.name })}
                  title="Selic (CDI) ~10.75%"
                >
                  S
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="size-4 text-[8px] font-bold opacity-50 hover:opacity-100"
                  onClick={() => onChange(scenario.id, { annualReturnRate: 12, name: scenario.name.includes('Simulação') ? 'S&P 500' : scenario.name })}
                  title="S&P 500 (Avg) ~12%"
                >
                  W
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
