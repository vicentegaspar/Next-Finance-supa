'use client'

import { useState } from 'react'
import { useWorkspaceStore } from '@/components/providers/workspace-store-provider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Download, Loader2, Calendar as CalendarIcon } from 'lucide-react'
import { getReportTransactions } from '@/actions/reports'
import { generateCSV, generatePDF } from '@/lib/exportUtils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export function ReportsManager() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace)
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [loadingCsv, setLoadingCsv] = useState(false)
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month')
  const [date, setDate] = useState<Date>(new Date())

  if (!activeWorkspace) return null

  const handleExport = async (type: 'pdf' | 'csv') => {
    try {
      if (type === 'pdf') setLoadingPdf(true)
      if (type === 'csv') setLoadingCsv(true)

      const transactions = await getReportTransactions(activeWorkspace.id, period, date)

      let periodStr = 'Todo o Período'
      let filenamePart = 'completo'
      if (period === 'month') {
        periodStr = format(date, "MMMM 'de' yyyy", { locale: ptBR })
        periodStr = periodStr.charAt(0).toUpperCase() + periodStr.slice(1)
        filenamePart = format(date, "MM_yyyy")
      } else if (period === 'year') {
        periodStr = format(date, 'yyyy')
        filenamePart = periodStr
      }

      const filename = `relatorio_clarix_${filenamePart}`

      if (transactions.length === 0) {
        alert('Não há transações no período selecionado.')
        return
      }

      if (type === 'csv') {
        generateCSV(transactions, filename)
      } else {
        generatePDF(transactions, periodStr, filename)
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Ocorreu um erro ao gerar o relatório.')
    } finally {
      if (type === 'pdf') setLoadingPdf(false)
      if (type === 'csv') setLoadingCsv(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Configuração do Relatório
          </CardTitle>
          <CardDescription>
            Selecione o período desejado para exportar seus dados financeiros.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tipo de Período</label>
            <Select value={period} onValueChange={(val: any) => setPeriod(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mensal</SelectItem>
                <SelectItem value="year">Anual</SelectItem>
                <SelectItem value="all">Todo o Período</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {period !== 'all' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Data Base ({period === 'month' ? 'Mês e Ano' : 'Ano'})
              </label>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, period === 'month' ? 'MMMM yyyy' : 'yyyy', { locale: ptBR }) : <span>Selecione a data</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                    defaultMonth={date}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden relative group">
          <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <h3 className="text-lg font-bold mb-2">Balancete em PDF</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Um documento formatado e pronto para impressão, resumindo suas receitas, despesas e saldo líquido agrupados por categoria.
            </p>
            <Button 
              className="w-full sm:w-auto font-medium" 
              onClick={() => handleExport('pdf')}
              disabled={loadingPdf || loadingCsv}
            >
              {loadingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              {loadingPdf ? 'Gerando PDF...' : 'Exportar PDF'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm overflow-hidden relative group">
          <div className="absolute inset-0 bg-linear-to-r from-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <h3 className="text-lg font-bold mb-2">Planilha de Dados (CSV)</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Exportação dos dados brutos consolidados. Ideal para integrar com Excel, Google Sheets ou outras ferramentas contábeis.
            </p>
            <Button 
              variant="secondary" 
              className="w-full sm:w-auto font-medium"
              onClick={() => handleExport('csv')}
              disabled={loadingPdf || loadingCsv}
            >
              {loadingCsv ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {loadingCsv ? 'Processando CSV...' : 'Baixar CSV'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
