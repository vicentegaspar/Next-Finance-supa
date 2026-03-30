'use client'

import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { InvestmentScenario } from './InvestmentScenarioItem'
import { cn } from '@/lib/utils'

interface InvestmentGrowthChartProps {
  scenarios: InvestmentScenario[]
}

export function InvestmentGrowthChart({ scenarios }: InvestmentGrowthChartProps) {
  const chartData = useMemo(() => {
    const data: any[] = []
    const years = [0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
    
    // We'll calculate year by year for the specified years
    // but to make it smooth, we can just calculate every year from 0 to 50
    for (let year = 0; year <= 50; year += year <= 5 ? 1 : 5) {
      const point: any = { year }
      
      scenarios.forEach((scenario) => {
        const monthlyRate = Math.pow(1 + scenario.annualReturnRate / 100, 1 / 12) - 1
        const months = year * 12
        
        let totalValue = scenario.initialInvestment
        for (let m = 0; m < months; m++) {
          totalValue = totalValue * (1 + monthlyRate) + scenario.monthlyContribution
        }
        
        point[scenario.id] = Math.round(totalValue)
        // Add principal tracking for the FIRST scenario only to keep chart clean
        if (scenarios.indexOf(scenario) === 0) {
          point.principal = Math.round(scenario.initialInvestment + (scenario.monthlyContribution * months))
        }
      })
      
      data.push(point)
    }
    
    return data
  }, [scenarios])

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      principal: {
        label: 'Total Investido',
        color: '#94a3b8', // Slate 400
      },
    }
    scenarios.forEach((s) => {
      config[s.id] = {
        label: s.name || 'Cenário',
        color: s.color,
      }
    })
    return config
  }, [scenarios])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="w-full h-[400px] mt-6">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="grad-principal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
            {scenarios.map((s) => (
              <linearGradient key={`grad-${s.id}`} id={`grad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
          <XAxis
            dataKey="year"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            ticks={[5, 10, 25, 50]}
            tickFormatter={(value) => `${value} anos`}
            className="text-[10px] font-medium"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) =>
              new Intl.NumberFormat('pt-BR', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(value)
            }
            className="text-[10px] font-medium"
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => `${value} anos`}
                formatter={(value, name, props) => {
                  const isPrincipal = name === 'Total Investido'
                  return (
                    <div className="flex items-center gap-2">
                      <div
                        className="size-2 rounded-[2px]"
                        style={{ backgroundColor: props.color }}
                      />
                      <span className="text-muted-foreground">{name}:</span>
                      <span className={cn(
                        "font-bold",
                        isPrincipal ? "text-muted-foreground/80 font-normal" : "text-foreground"
                      )}>
                        {formatCurrency(value as number)}
                      </span>
                    </div>
                  )
                }}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="principal"
            stroke="#94a3b8"
            strokeWidth={1}
            strokeDasharray="4 4"
            fill="url(#grad-principal)"
            stackId="none"
          />
          {scenarios.map((s) => (
            <Area
              key={s.id}
              type="monotone"
              dataKey={s.id}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#grad-${s.id})`}
              stackId="none"
              animationDuration={1000}
            />
          ))}
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
