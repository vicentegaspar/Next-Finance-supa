'use client'

import { useEffect, useState, useMemo } from 'react'
import { useWorkspaceStore } from '@/components/providers/workspace-store-provider'
import { getTransactions } from '@/actions/transactions'
import { Database } from '@/types/supabase'
import { Landmark, ArrowLeftRight, TrendingUp, Loader2, ArrowUpRight, ArrowDownRight, PieChart as PieIcon } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, ResponsiveContainer } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Transaction = Database['public']['Tables']['transactions']['Row']

const mainChartConfig = {
  income: {
    label: 'Receitas',
    color: 'hsl(var(--chart-2))',
  },
  expense: {
    label: 'Despesas',
    color: 'hsl(var(--destructive))',
  },
} satisfies ChartConfig

export function DashboardCharts() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!activeWorkspace) return
      try {
        setLoading(true)
        const data = await getTransactions(activeWorkspace.id)
        setTransactions(data || [])
      } catch (err) {
        console.error("Dashboard error:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [activeWorkspace])

  const stats = useMemo(() => {
    let income = 0
    let expense = 0

    transactions.forEach(t => {
      if (t.status !== 'completed') return
      if (t.type === 'income') income += Number(t.amount)
      if (t.type === 'expense') expense += Number(t.amount)
    })

    return {
      income,
      expense,
      balance: income - expense
    }
  }, [transactions])

  const chartData = useMemo(() => {
    const dailyData: Record<string, { date: string, income: number, expense: number }> = {}
    const flowTxs = transactions.filter(t => t.type !== 'transfer' && t.status === 'completed')
    flowTxs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    flowTxs.forEach((t) => {
      const dt = new Date(t.date)
      const dateStr = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' })
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { date: dateStr, income: 0, expense: 0 }
      }
      if (t.type === 'income') dailyData[dateStr].income += Number(t.amount)
      if (t.type === 'expense') dailyData[dateStr].expense += Number(t.amount)
    })
    return Object.values(dailyData).slice(-15) // Last 15 active days
  }, [transactions])

  const categoryData = useMemo(() => {
    const cats: Record<string, { name: string, value: number, fill: string }> = {}
    const expenseTxs = transactions.filter(t => t.type === 'expense' && t.status === 'completed')
    
    // Fallback names if category_id is missing/generic
    const colors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ]

    expenseTxs.forEach((t, i) => {
        const catName = t.description || 'Outros' // Simplified for demo if categories table join isn't here yet
        if (!cats[catName]) {
            cats[catName] = { name: catName, value: 0, fill: colors[Object.keys(cats).length % colors.length] }
        }
        cats[catName].value += Number(t.amount)
    })

    return Object.values(cats).sort((a, b) => b.value - a.value).slice(0, 5)
  }, [transactions])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  if (!activeWorkspace) return null

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground w-full border border-border border-dashed rounded-xl mt-4">
        <Loader2 className="size-8 animate-spin text-primary mb-4" />
        <p className="animate-pulse">Sincronizando estatísticas ametista...</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-2">
        <Card className="p-0 border-none shadow-lg overflow-hidden group">
          <div className="bg-card p-5 h-full relative border border-border/50 rounded-xl">
            <div className="absolute -right-6 -top-6 size-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
            <div className="flex items-center gap-2 text-primary font-semibold mb-3">
              <div className="p-1.5 bg-primary/10 rounded-md">
                 <Landmark className="size-4" />
              </div>
              Saldo Consolidado
            </div>
            <div className="space-y-1">
               <span className="text-3xl font-bold font-heading tracking-tight block">
                 {formatCurrency(stats.balance)}
               </span>
               <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Status do Patrimônio</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-0 border-none shadow-lg overflow-hidden group">
          <div className="bg-card p-5 h-full relative border border-chart-2/30 rounded-xl">
             <div className="absolute -right-6 -top-6 size-24 bg-chart-2/20 rounded-full blur-2xl group-hover:bg-chart-2/30 transition-all duration-500" />
             <div className="flex items-center justify-between text-chart-2 font-semibold mb-3">
               <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-chart-2/10 rounded-md">
                    <TrendingUp className="size-4" />
                 </div>
                 Ganhos Totais
               </div>
               <ArrowUpRight className="size-4 opacity-40 shrink-0" />
             </div>
             <div className="space-y-1">
               <span className="text-3xl font-bold font-heading tracking-tight block text-chart-2">
                 {formatCurrency(stats.income)}
               </span>
               <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Entradas Efetivadas</p>
            </div>
          </div>
        </Card>

        <Card className="p-0 border-none shadow-lg overflow-hidden group">
           <div className="bg-card p-5 h-full relative border border-destructive/30 rounded-xl">
             <div className="absolute -right-6 -top-6 size-24 bg-destructive/20 rounded-full blur-2xl group-hover:bg-destructive/30 transition-all duration-500" />
             <div className="flex items-center justify-between text-destructive font-semibold mb-3">
               <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-destructive/10 rounded-md">
                    <ArrowLeftRight className="size-4" />
                 </div>
                 Despesas Pagas
               </div>
               <ArrowDownRight className="size-4 opacity-40 shrink-0" />
             </div>
             <div className="space-y-1">
               <span className="text-3xl font-bold font-heading tracking-tight block text-destructive">
                 {formatCurrency(stats.expense)}
               </span>
               <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Saídas Confirmadas</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <Card className="xl:col-span-2 p-6 shadow-xl border-border/40 bg-card/40 backdrop-blur-md">
          <div className="mb-6">
             <h2 className="text-xl font-heading font-bold text-foreground">Fluxo de Caixa</h2>
             <p className="text-xs text-muted-foreground mt-1">Evolução diária de receitas e gastos confirmados.</p>
          </div>
          
          {chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/10 border border-dashed border-border/50 rounded-xl text-sm">
               Aguardando primeiras movimentações para gerar inteligência...
            </div>
          ) : (
            <ChartContainer config={mainChartConfig} className="w-full h-[320px]">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 'bold' }}
                />
                <YAxis hide />
                <ChartTooltip cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }} content={<ChartTooltipContent />} />
                <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="var(--color-income)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                    animationDuration={1500}
                />
                <Area 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="var(--color-expense)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorExpense)" 
                    animationDuration={1500}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </Card>

        {/* Categories Pie Chart */}
        <Card className="p-6 shadow-xl border-border/40 bg-card/40 backdrop-blur-md flex flex-col items-center">
            <div className="w-full mb-6">
                <h2 className="text-xl font-heading font-bold text-foreground">Distribuição</h2>
                <p className="text-xs text-muted-foreground mt-1">Onde você mais investiu seu capital.</p>
            </div>
            
            {categoryData.length === 0 ? (
                 <div className="grow flex flex-col items-center justify-center text-muted-foreground gap-3 opacity-40">
                    <PieIcon className="size-12" />
                    <span className="text-sm">Sem dados de categorias</span>
                 </div>
            ) : (
                <div className="w-full flex-1 flex flex-col min-h-0">
                    <div className="h-[220px] w-full shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} className="outline-none" />
                                    ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-4 space-y-2 w-full overflow-y-auto max-h-[140px] pr-1 scrollbar-hide">
                        {categoryData.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                                    <span className="text-xs font-semibold truncate text-muted-foreground hover:text-foreground">{item.name}</span>
                                </div>
                                <span className="text-xs font-bold font-heading shrink-0">{formatCurrency(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
      </div>
    </div>
  )
}
